import { createHash } from 'node:crypto';
import rawCases from './cases.json';
import rawRubrics from './rubrics.json';
import {
  parseBundle,
  validateReport,
  statements,
  type Bundle,
  type Report,
  type Statement,
} from '../src/lib/contracts';

export type Status = 'pass' | 'fail' | 'review-required';
interface Dimension {
  status: Status;
  issues: string[];
}
interface Coverage extends Dimension {
  covered: number;
  total: number;
  referencePresenceOnly: true;
}
export interface EvaluationResult {
  citationValidity: Dimension;
  requiredEvidence: Coverage;
  uncertainty: Dimension;
  citationSupport: Dimension;
}
export interface Rubric {
  key: string;
  reviewer: string;
  scope: string;
  requiredEvidence: { signal: string; anyOf: string[] }[];
  requiredUnknowns: string[];
  supportedStatements: { signature: string; text: string; evidenceIds: string[]; note: string }[];
  unsupportedStatements: { text: string; reason: string; uncertaintyFailure: boolean }[];
}
export interface EvaluationCase {
  id: string;
  bundle: Bundle;
  report: Report;
  rubric: Rubric;
  expected: Partial<Record<keyof EvaluationResult, Status>>;
  note: string;
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => JSON.stringify(key) + ':' + stable(item))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
export function statementSignature(statement: Statement): string {
  return createHash('sha256').update(stable(statement)).digest('hex');
}
export function loadEvaluationCases(): EvaluationCase[] {
  return rawCases.map((raw) => {
    const rubric = rawRubrics.rubrics.find((item) => item.key === raw.rubricKey);
    if (!rubric) throw new Error('Missing evaluation rubric: ' + raw.rubricKey);
    return {
      ...raw,
      bundle: parseBundle(raw.bundle),
      rubric,
      report: raw.report as Report,
      expected: raw.expected as EvaluationCase['expected'],
    };
  });
}
export function evaluateReport(input: unknown, bundle: Bundle, rubric: Rubric): EvaluationResult {
  let report: Report;
  try {
    report = validateReport(input, bundle);
  } catch {
    const unassessed: Dimension = {
      status: 'review-required',
      issues: ['Report contract failed; this dimension was not assessed.'],
    };
    return {
      citationValidity: { status: 'fail', issues: ['Schema or citation integrity failed.'] },
      requiredEvidence: {
        ...unassessed,
        covered: 0,
        total: rubric.requiredEvidence.length,
        referencePresenceOnly: true,
      },
      uncertainty: unassessed,
      citationSupport: unassessed,
    };
  }
  const all = statements(report);
  const citedInFindings = new Set(
    [...report.summary, ...report.impact, ...report.observations, ...report.hypotheses].flatMap(
      (item) => item.evidenceIds,
    ),
  );
  const uncovered = rubric.requiredEvidence.filter(
    (signal) => !signal.anyOf.some((id) => citedInFindings.has(id)),
  );
  const missingUnknowns = rubric.requiredUnknowns.filter(
    (text) => !report.missingInformation.some((item) => item.text === text),
  );
  const forbidden = rubric.unsupportedStatements.filter((item) =>
    all.some((statement) => statement.text === item.text),
  );
  const unreviewedUnknown = report.missingInformation.some(
    (item) =>
      !rubric.supportedStatements.some((review) => review.signature === statementSignature(item)),
  );
  const uncertaintyIssues = [
    ...missingUnknowns.map((text) => 'Missing reviewed uncertainty: ' + text),
    ...forbidden.filter((item) => item.uncertaintyFailure).map((item) => item.reason),
  ];
  const supportFailures: string[] = forbidden.map((item) => item.reason);
  const unreviewed: string[] = [];
  for (const statement of all) {
    if (
      rubric.supportedStatements.some(
        (review) => review.signature === statementSignature(statement),
      )
    )
      continue;
    if (forbidden.some((item) => item.text === statement.text)) continue;
    const sameText = rubric.supportedStatements.find((review) => review.text === statement.text);
    if (
      sameText &&
      stable([...sameText.evidenceIds].sort()) !== stable([...statement.evidenceIds].sort())
    ) {
      supportFailures.push(
        'Known claim has a source set outside its reviewed support: ' + statement.id,
      );
    } else unreviewed.push('Unreviewed wording or statement structure: ' + statement.id);
  }
  return {
    citationValidity: { status: 'pass', issues: [] },
    requiredEvidence: {
      status: uncovered.length ? 'fail' : 'pass',
      covered: rubric.requiredEvidence.length - uncovered.length,
      total: rubric.requiredEvidence.length,
      referencePresenceOnly: true,
      issues: uncovered.map((signal) => signal.signal),
    },
    uncertainty: {
      status: forbidden.some((item) => item.uncertaintyFailure)
        ? 'fail'
        : missingUnknowns.length
          ? unreviewedUnknown
            ? 'review-required'
            : 'fail'
          : unreviewedUnknown
            ? 'review-required'
            : 'pass',
      issues: uncertaintyIssues,
    },
    citationSupport: {
      status: supportFailures.length ? 'fail' : unreviewed.length ? 'review-required' : 'pass',
      issues: [...supportFailures, ...unreviewed],
    },
  };
}

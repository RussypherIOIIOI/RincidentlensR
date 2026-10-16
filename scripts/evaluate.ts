import { mkdirSync, writeFileSync } from 'node:fs';
import { evaluateReport, loadEvaluationCases } from '../evaluation/runner';

const cases = loadEvaluationCases();
const results = cases.map((item) => {
  const result = evaluateReport(item.report, item.bundle, item.rubric);
  const matched = Object.entries(item.expected).every(
    ([dimension, expected]) => result[dimension as keyof typeof result].status === expected,
  );
  return {
    id: item.id,
    matchedExpectation: matched,
    expected: item.expected,
    observed: result,
    note: item.note,
  };
});
mkdirSync(new URL('../reports', import.meta.url), { recursive: true });
writeFileSync(
  new URL('../reports/evaluation-results.json', import.meta.url),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scope:
        'Offline closed-fixture regression. No live-model accuracy or general entailment score.',
      review: 'AI-reviewed fixture annotations; human semantic review remains recommended.',
      caseCount: results.length,
      matchingExpectations: results.filter((item) => item.matchedExpectation).length,
      results,
    },
    null,
    2,
  ) + '\n',
);
console.table(
  results.map((item) => ({
    case: item.id,
    expectedOutcome: item.matchedExpectation ? 'matched' : 'MISMATCH',
    citations: item.observed.citationValidity.status,
    evidence: item.observed.requiredEvidence.status,
    uncertainty: item.observed.uncertainty.status,
    support: item.observed.citationSupport.status,
  })),
);
console.log(
  results.filter((item) => item.matchedExpectation).length +
    '/' +
    results.length +
    ' fixture cases matched their expected outcomes. This is not a live-model quality score.',
);
if (results.some((item) => !item.matchedExpectation)) process.exitCode = 1;

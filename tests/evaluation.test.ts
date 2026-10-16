import { describe, it, expect } from 'vitest';
import { evaluateReport, loadEvaluationCases } from '../evaluation/runner';
describe('closed-fixture evaluation dimensions', () => {
  it('includes every saved scenario plus adversarial and incomplete-evidence cases', () => {
    const cases = loadEvaluationCases();
    for (const id of [
      'saved-scenario-001',
      'saved-scenario-002',
      'saved-scenario-003',
      'incomplete-auth-evidence',
      'adversarial-log',
    ])
      expect(cases.map((c) => c.id)).toContain(id);
  });
  it('matches the explicit expected outcome of every positive and negative case', () => {
    for (const c of loadEvaluationCases()) {
      const result = evaluateReport(c.report, c.bundle, c.rubric);
      for (const [dimension, status] of Object.entries(c.expected))
        expect(result[dimension as keyof typeof result].status, c.id + ' / ' + dimension).toBe(
          status,
        );
    }
    expect(loadEvaluationCases().length).toBeGreaterThanOrEqual(10);
  });
  it('does not mistake a real but irrelevant source ID for semantic support', () => {
    const c = loadEvaluationCases().find((c) => c.id === 'irrelevant-citation')!;
    const result = evaluateReport(c.report, c.bundle, c.rubric);
    expect(result.citationValidity.status).toBe('pass');
    expect(result.citationSupport.status).toBe('fail');
  });
  it('reports unknown paraphrases as review-required rather than automatically verified', () => {
    const c = loadEvaluationCases()[0];
    const r = structuredClone(c.report);
    r.summary[0].text = 'A paraphrase that has not been reviewed against the evidence.';
    const result = evaluateReport(r, c.bundle, c.rubric);
    expect(result.citationValidity.status).toBe('pass');
    expect(result.citationSupport.status).toBe('review-required');
  });
  it('detects missing required evidence independently from citation validity', () => {
    const c = loadEvaluationCases().find((c) => c.id === 'required-evidence-omitted')!;
    const result = evaluateReport(c.report, c.bundle, c.rubric);
    expect(result.citationValidity.status).toBe('pass');
    expect(result.requiredEvidence.status).toBe('fail');
    expect(result.requiredEvidence.total).toBeGreaterThan(0);
  });
  it('requires explicit missing-information coverage for the reviewed cases', () => {
    const c = loadEvaluationCases().find((c) => c.id === 'missing-uncertainty')!;
    expect(evaluateReport(c.report, c.bundle, c.rubric).uncertainty.status).toBe('fail');
  });
});

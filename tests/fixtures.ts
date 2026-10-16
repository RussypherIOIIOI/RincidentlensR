export const bundle = {
  id: 'scenario-001',
  version: '1',
  evidence: [
    {
      id: 's001-e02',
      scenarioId: 'scenario-001',
      kind: 'log',
      source: 'checkout-api',
      text: 'GET /checkout returned HTTP 503.',
      timestamp: '2026-02-18T10:02:00.000Z',
      severity: 'error',
    },
    {
      id: 's001-e01',
      scenarioId: 'scenario-001',
      kind: 'deployment',
      source: 'release-controller',
      text: 'Release r42 rollout completed.',
      timestamp: '2026-02-18T10:00:00.000Z',
      severity: 'info',
    },
    {
      id: 's001-r01',
      scenarioId: 'scenario-001',
      kind: 'runbook',
      source: 'operations-guide',
      text: 'Compare release configuration before considering rollback.',
      timestamp: null,
      severity: 'reference',
    },
  ],
};
export const report = {
  summary: [
    {
      id: 'summary-1',
      text: 'Checkout returned HTTP 503 after release r42 completed.',
      evidenceIds: ['s001-e01', 's001-e02'],
    },
  ],
  impact: [
    { id: 'impact-1', text: 'A checkout request returned HTTP 503.', evidenceIds: ['s001-e02'] },
  ],
  observations: [
    { id: 'observation-1', text: 'Release r42 completed at 10:00 UTC.', evidenceIds: ['s001-e01'] },
  ],
  hypotheses: [
    {
      id: 'hypothesis-1',
      text: 'Release configuration may be involved.',
      evidenceIds: ['s001-e01', 's001-e02'],
      uncertainty: 'low',
      gaps: ['The exact configuration diff is not supplied.'],
      counterEvidenceIds: [],
    },
  ],
  missingInformation: [
    {
      id: 'gap-1',
      text: 'Recovery status is unknown.',
      whyItMatters: 'The current service state cannot be established.',
      nextCheck: 'Collect later health checks.',
      evidenceIds: [],
    },
  ],
  nextChecks: [
    {
      id: 'check-1',
      text: 'Compare release configuration.',
      rationale: 'The supplied runbook recommends this check.',
      evidenceIds: ['s001-r01'],
    },
  ],
};

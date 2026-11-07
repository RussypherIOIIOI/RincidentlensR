import { describe, expect, it } from 'vitest';
import { ledgerFigures } from '@/lib/ledger';
import { loadScenarios } from '@/server/scenarios';

describe('ledger figures', () => {
  const scenarios = loadScenarios();

  it('counts the bundled incidents, records and open questions', () => {
    const figures = ledgerFigures(scenarios);
    expect(figures.incidents).toBe(3);
    expect(figures.sources).toBe(
      scenarios.reduce((total, item) => total + item.bundle.evidence.length, 0),
    );
    expect(figures.unknowns).toBe(
      scenarios.reduce((total, item) => total + item.artifact.report.missingInformation.length, 0),
    );
    expect(figures.citations).toBeGreaterThan(figures.sources);
    expect(figures.unresolved).toBe(0);
  });

  it('reports a citation that names no record in its own bundle', () => {
    const [first, second] = scenarios;
    const tampered = {
      ...first,
      artifact: {
        ...first.artifact,
        report: {
          ...first.artifact.report,
          summary: [
            {
              ...first.artifact.report.summary[0],
              evidenceIds: [second.bundle.evidence[0].id, 's001-e99'],
            },
          ],
        },
      },
    };
    // Both bundles are supplied, so the ID borrowed from `second` is known to the page but
    // must still count as unresolved for `first`.
    const before = ledgerFigures([first, second]);
    const after = ledgerFigures([tampered, second]);
    expect(after.unresolved).toBe(2);
    expect(after.citations).toBe(
      before.citations - first.artifact.report.summary[0].evidenceIds.length + 2,
    );
  });
});

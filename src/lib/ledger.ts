import { statements, type Artifact, type Bundle } from './contracts';

export interface LedgerFigures {
  incidents: number;
  sources: number;
  citations: number;
  unknowns: number;
  unresolved: number;
}

/**
 * Counts figures for the ledger readout from the loaded bundles and reports.
 * `unresolved` counts citation references with no matching evidence record in
 * the same bundle, so the readout reports what was checked rather than a claim.
 */
export function ledgerFigures(
  scenarios: readonly { bundle: Bundle; artifact: Artifact }[],
): LedgerFigures {
  let sources = 0,
    citations = 0,
    unknowns = 0,
    unresolved = 0;
  for (const { bundle, artifact } of scenarios) {
    const known = new Set(bundle.evidence.map((item) => item.id));
    sources += bundle.evidence.length;
    unknowns += artifact.report.missingInformation.length;
    for (const statement of statements(artifact.report)) {
      const refs = [
        ...statement.evidenceIds,
        ...('counterEvidenceIds' in statement ? statement.counterEvidenceIds : []),
      ];
      citations += refs.length;
      unresolved += refs.filter((ref) => !known.has(ref)).length;
    }
  }
  return { incidents: scenarios.length, sources, citations, unknowns, unresolved };
}

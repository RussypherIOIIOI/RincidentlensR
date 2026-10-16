# Fixture maintenance recipe

Use this only after reviewing changed evidence and claims as described in [CONTRIBUTING.md](../CONTRIBUTING.md). It computes metadata from source files and **does not write or approve anything**. Run from the repository root after `npm ci`; no provider key or network request is required.

Finish the reviewed evidence/report edits before running the snippet. Rerun it after any subsequent evidence or report edit, because those edits can change the hash or statement signatures.

## Compute a bundle hash and statement signatures

This PowerShell example targets scenario-001. For another scenario, change both JSON paths together.

```powershell
@'
import { readFileSync } from 'node:fs';
import { parseBundle, validateReport } from './src/lib/contracts.ts';
import { evidenceHash } from './src/lib/integrity.ts';
import { statementSignature } from './evaluation/runner.ts';

const bundle = parseBundle(JSON.parse(readFileSync('data/evidence/scenario-001.json', 'utf8')));
const artifact = JSON.parse(readFileSync('data/reports/scenario-001.json', 'utf8'));
const report = validateReport(artifact.report, bundle);
console.log(JSON.stringify({
  bundleId: bundle.id,
  evidenceHash: evidenceHash(bundle),
  statements: Object.entries(report).flatMap(([section, items]) =>
    items.map(statement => ({ section, id: statement.id, signature: statementSignature(statement) }))
  )
}, null, 2));
'@ | node --import tsx --input-type=module
```

The snippet validates the evidence bundle and report shape/references, then prints the new canonical bundle hash and every report statement’s signature. It deliberately does not call `validateArtifact`, because a source edit can make the existing envelope hash stale while you are maintaining it.

A successful command does not establish semantic support. Review each affected proposition against the actual source, including rationale/gaps, before using the printed values.

## Apply reviewed updates

1. Confirm the matching file in `data/reports/` contains the final reviewed claims and explicit unknowns. If it needs further edits, make them and rerun the snippet before copying metadata.
2. After review, put the computed hash into that artifact’s `evidenceHash`. Preserve honest `origin`, `model`, and `generatedAt` values.
3. Update affected independent bundle/report copies in [cases.json](../evaluation/cases.json).
4. In [rubrics.json](../evaluation/rubrics.json), review the applicable `requiredEvidence`, `requiredUnknowns`, `supportedStatements`, and `unsupportedStatements`. Update the whole statement’s signature, text/reference metadata, reviewer, and review note together.
5. For evidence variants and deliberately invalid candidates, retain their intended differences. Do not replace all candidates with a valid saved report or relax expected failures.
6. Run `npm run validate:data`, `npm test`, and `npm run eval`; inspect the per-dimension results. Update documentation if the corpus or counts changed.

Signatures cover the entire statement, including its ID and auxiliary fields, so editing a gap or rationale changes the digest too. Never copy a new signature solely to silence a failure. Runtime data and evaluation annotations remain separate even when their contents deliberately match.

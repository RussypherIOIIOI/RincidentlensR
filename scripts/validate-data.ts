import { readFileSync } from 'node:fs';
import { SCENARIO_IDS, parseBundle } from '../src/lib/contracts';
import { validateArtifact } from '../src/lib/integrity';
for (const id of SCENARIO_IDS) {
  const bundle = parseBundle(
    JSON.parse(readFileSync(new URL('../data/evidence/' + id + '.json', import.meta.url), 'utf8')),
  );
  const artifact = validateArtifact(
    JSON.parse(readFileSync(new URL('../data/reports/' + id + '.json', import.meta.url), 'utf8')),
    bundle,
  );
  console.log(
    id +
      ': ' +
      bundle.evidence.length +
      ' evidence sources; ' +
      artifact.report.observations.length +
      ' observations; saved-report integrity valid',
  );
}

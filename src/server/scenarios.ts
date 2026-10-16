import 'server-only';
import b1 from '../../data/evidence/scenario-001.json';
import b2 from '../../data/evidence/scenario-002.json';
import b3 from '../../data/evidence/scenario-003.json';
import r1 from '../../data/reports/scenario-001.json';
import r2 from '../../data/reports/scenario-002.json';
import r3 from '../../data/reports/scenario-003.json';
import {
  parseBundle,
  ScenarioIdSchema,
  type Bundle,
  type Artifact,
  type ScenarioId,
} from '../lib/contracts';
import { validateArtifact } from '../lib/integrity';
export interface ScenarioView {
  id: ScenarioId;
  title: string;
  category: string;
  description: string;
  bundle: Bundle;
  artifact: Artifact;
}
const catalogue = [
  {
    id: 'scenario-001',
    category: 'Failed deployment',
    title: 'Checkout errors after a release',
    description:
      'A new endpoint, a queued rollback, and a health check that tells only part of the story.',
  },
  {
    id: 'scenario-002',
    category: 'Database outage',
    title: 'Connection slots under pressure',
    description:
      'Application queries fail while the database control plane still reports a running instance.',
  },
  {
    id: 'scenario-003',
    category: 'Expired credential',
    title: 'Authentication fails. Expiry is unclear.',
    description:
      'Repeated unauthorized responses leave a delivery queue growing, with key details missing.',
  },
] as const;
const rawBundles = [b1, b2, b3],
  rawReports = [r1, r2, r3];
export function loadBundle(id: unknown): Bundle {
  const sid = ScenarioIdSchema.parse(id);
  const raw = rawBundles.find((b) => b.id === sid);
  return parseBundle(raw);
}
export function loadScenarios(): ScenarioView[] {
  return catalogue.map((item, i) => {
    const bundle = parseBundle(rawBundles[i]);
    return { ...item, bundle, artifact: validateArtifact(rawReports[i], bundle) };
  });
}

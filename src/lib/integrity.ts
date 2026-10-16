import { createHash } from 'node:crypto';
import { ArtifactSchema, validateReport, type Bundle, type Artifact } from './contracts';
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => JSON.stringify(key) + ':' + canonical(item))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
export function evidenceHash(bundle: Bundle): string {
  return createHash('sha256')
    .update(
      canonical({
        ...bundle,
        evidence: [...bundle.evidence].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
      }),
    )
    .digest('hex');
}
export function validateArtifact(value: unknown, bundle: Bundle): Artifact {
  const artifact = ArtifactSchema.parse(value);
  if (artifact.scenarioId !== bundle.id || artifact.evidenceHash !== evidenceHash(bundle))
    throw new Error('Report does not match the current evidence bundle');
  validateReport(artifact.report, bundle);
  return artifact;
}

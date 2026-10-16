import { z } from 'zod';
export const SCENARIO_IDS = ['scenario-001', 'scenario-002', 'scenario-003'] as const;
export const ScenarioIdSchema = z.enum(SCENARIO_IDS);
export type ScenarioId = z.infer<typeof ScenarioIdSchema>;
const id = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const prose = z.string().trim().min(1).max(1600);
const citations = z.array(id).max(16);
export const TimestampSchema = z.iso
  .datetime({ offset: false })
  .refine((value) => Number.isFinite(Date.parse(value)), 'Timestamp must be a real UTC instant');
export const EvidenceSchema = z
  .object({
    id,
    scenarioId: ScenarioIdSchema,
    kind: z.enum(['log', 'deployment', 'metric', 'runbook']),
    source: z.string().min(1).max(100),
    text: z.string().min(1).max(6000),
    timestamp: TimestampSchema.nullable(),
    severity: z.enum(['info', 'warning', 'error', 'reference']),
  })
  .strict();
export const BundleSchema = z
  .object({
    id: ScenarioIdSchema,
    version: z.literal('1'),
    evidence: z.array(EvidenceSchema).min(1).max(48),
  })
  .strict();
export const FactSchema = z.object({ id, text: prose, evidenceIds: citations.min(1) }).strict();
export const HypothesisSchema = z
  .object({
    id,
    text: prose,
    evidenceIds: citations.min(1),
    uncertainty: z.enum(['low', 'medium']),
    gaps: z.array(prose).min(1).max(6),
    counterEvidenceIds: citations,
  })
  .strict();
export const MissingSchema = z
  .object({ id, text: prose, whyItMatters: prose, nextCheck: prose, evidenceIds: citations })
  .strict();
export const CheckSchema = z
  .object({ id, text: prose, rationale: prose, evidenceIds: citations })
  .strict();
export const ReportSchema = z
  .object({
    summary: z.array(FactSchema).min(1).max(4),
    impact: z.array(FactSchema).max(6),
    observations: z.array(FactSchema).min(1).max(12),
    hypotheses: z.array(HypothesisSchema).max(5),
    missingInformation: z.array(MissingSchema).min(1).max(8),
    nextChecks: z.array(CheckSchema).min(1).max(8),
  })
  .strict();
export const ArtifactSchema = z
  .object({
    schemaVersion: z.literal('1'),
    scenarioId: ScenarioIdSchema,
    evidenceHash: z.string().regex(/^[a-f0-9]{64}$/),
    promptVersion: z.literal('1'),
    reportVersion: z.literal('1'),
    origin: z.enum(['ai-authored-example', 'live-generated']),
    generatedAt: TimestampSchema.nullable(),
    model: z.string().min(1).max(100).nullable(),
    report: ReportSchema,
  })
  .strict()
  .superRefine((a, ctx) => {
    if (a.origin === 'live-generated' && (!a.generatedAt || !a.model))
      ctx.addIssue({ code: 'custom', message: 'Live reports need real generation metadata' });
    if (a.origin === 'ai-authored-example' && (a.generatedAt !== null || a.model !== null))
      ctx.addIssue({
        code: 'custom',
        message: 'Bundled examples must not fabricate provider metadata',
      });
  });
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Bundle = z.infer<typeof BundleSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
export type Statement = Report[keyof Report][number];
export function parseBundle(value: unknown): Bundle {
  const b = BundleSchema.parse(value);
  const seen = new Set<string>();
  for (const e of b.evidence) {
    if (seen.has(e.id)) throw new Error('Duplicate evidence ID: ' + e.id);
    seen.add(e.id);
    if (e.scenarioId !== b.id) throw new Error('Cross-scenario evidence: ' + e.id);
    if (e.kind === 'runbook' && e.timestamp !== null)
      throw new Error('Runbooks are untimed reference context');
  }
  if (new TextEncoder().encode(JSON.stringify(b)).byteLength > 65536)
    throw new Error('Evidence bundle exceeds 64 KiB');
  return b;
}
export function sortEvidence(items: readonly Evidence[]): Evidence[] {
  return [...items].sort((a, b) => {
    if (a.timestamp === null && b.timestamp !== null) return 1;
    if (b.timestamp === null && a.timestamp !== null) return -1;
    return (
      (a.timestamp ? Date.parse(a.timestamp) : 0) - (b.timestamp ? Date.parse(b.timestamp) : 0) ||
      a.id.localeCompare(b.id)
    );
  });
}
export function statements(report: Report): Statement[] {
  return [
    ...report.summary,
    ...report.impact,
    ...report.observations,
    ...report.hypotheses,
    ...report.missingInformation,
    ...report.nextChecks,
  ];
}
export function validateReport(value: unknown, bundle: Bundle): Report {
  const report = ReportSchema.parse(value),
    known = new Set(bundle.evidence.map((e) => e.id)),
    seen = new Set<string>();
  for (const s of statements(report)) {
    if (seen.has(s.id)) throw new Error('Duplicate statement ID: ' + s.id);
    seen.add(s.id);
    for (const refs of [
      s.evidenceIds,
      ...('counterEvidenceIds' in s ? [s.counterEvidenceIds] : []),
    ]) {
      if (new Set(refs).size !== refs.length) throw new Error('Duplicate citation in ' + s.id);
      for (const ref of refs)
        if (!known.has(ref)) throw new Error('Unknown or cross-scenario evidence ID: ' + ref);
    }
  }
  return report;
}

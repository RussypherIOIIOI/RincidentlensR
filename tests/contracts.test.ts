import { describe, it, expect } from 'vitest';
import { parseBundle, validateReport, sortEvidence } from '@/lib/contracts';
import { evidenceHash, validateArtifact } from '@/lib/integrity';
import { bundle, report } from './fixtures';
describe('evidence contracts', () => {
  it('accepts a bounded bundle with untimed runbook context', () => {
    expect(() => parseBundle(bundle)).not.toThrow();
  });
  it.each(['2026-02-30T10:00:00Z', '2026-02-18T10:00:00+01:00', 'yesterday'])(
    'rejects invalid or non-UTC timestamp %s',
    (timestamp) => {
      const b = structuredClone(bundle);
      b.evidence[0].timestamp = timestamp;
      expect(() => parseBundle(b)).toThrow();
    },
  );
  it('rejects duplicate evidence IDs', () => {
    const b = structuredClone(bundle);
    b.evidence.push(b.evidence[0]);
    expect(() => parseBundle(b)).toThrow();
  });
  it('rejects evidence belonging to another scenario', () => {
    const b = structuredClone(bundle);
    b.evidence[0].scenarioId = 'scenario-002';
    expect(() => parseBundle(b)).toThrow();
  });
  it('does not let runbooks masquerade as timed events', () => {
    const b = structuredClone(bundle);
    b.evidence[2].timestamp = '2026-02-18T10:00:00Z';
    expect(() => parseBundle(b)).toThrow();
  });
  it('orders equal instants by ID and leaves references last without mutation', () => {
    const b = structuredClone(bundle);
    b.evidence[0].timestamp = b.evidence[1].timestamp;
    expect(sortEvidence(parseBundle(b).evidence).map((e) => e.id)).toEqual([
      's001-e01',
      's001-e02',
      's001-r01',
    ]);
    expect(b.evidence[0].id).toBe('s001-e02');
  });
  it('ignores JSON object property order in evidence fingerprints', () => {
    const b = parseBundle(bundle);
    const reordered = {
      evidence: b.evidence.map((e) => Object.fromEntries(Object.entries(e).reverse())),
      version: b.version,
      id: b.id,
    };
    expect(evidenceHash(b)).toBe(evidenceHash(reordered as typeof b));
  });
  it('hashes evidence canonically and detects changed content', () => {
    const b = structuredClone(bundle);
    b.evidence.reverse();
    expect(evidenceHash(parseBundle(bundle))).toBe(evidenceHash(parseBundle(b)));
    b.evidence[0].text = 'Changed guidance';
    expect(evidenceHash(parseBundle(bundle))).not.toBe(evidenceHash(parseBundle(b)));
  });
});
describe('report grounding contracts', () => {
  it('accepts factual claims, tentative hypotheses and an uncited explicit unknown', () => {
    expect(() => validateReport(report, parseBundle(bundle))).not.toThrow();
  });
  it.each(['summary', 'impact', 'observations'])('rejects an uncited factual %s', (section) => {
    const r = structuredClone(report);
    r[section as 'summary'][0].evidenceIds = [];
    expect(() => validateReport(r, parseBundle(bundle))).toThrow();
  });
  it('rejects dangling and cross-scenario citations', () => {
    const r = structuredClone(report);
    r.summary[0].evidenceIds = ['s002-e01'];
    expect(() => validateReport(r, parseBundle(bundle))).toThrow();
  });
  it('rejects duplicate IDs inside a citation but allows source reuse across claims', () => {
    const r = structuredClone(report);
    r.summary[0].evidenceIds = ['s001-e02', 's001-e02'];
    expect(() => validateReport(r, parseBundle(bundle))).toThrow();
    expect(() => validateReport(report, parseBundle(bundle))).not.toThrow();
  });
  it('rejects statement ID reuse across sections', () => {
    const r = structuredClone(report);
    r.impact[0].id = r.summary[0].id;
    expect(() => validateReport(r, parseBundle(bundle))).toThrow();
  });
  it('rejects model HTML/url reference fields and unbounded prose', () => {
    expect(() =>
      validateReport({ ...report, html: '<script>alert(1)</script>' }, parseBundle(bundle)),
    ).toThrow();
    const r = structuredClone(report);
    r.summary[0].text = 'x'.repeat(1601);
    expect(() => validateReport(r, parseBundle(bundle))).toThrow();
  });
  it('invalidates a saved artifact when the evidence changes', () => {
    const b = parseBundle(bundle);
    const artifact = {
      schemaVersion: '1',
      scenarioId: b.id,
      evidenceHash: evidenceHash(b),
      promptVersion: '1',
      reportVersion: '1',
      origin: 'ai-authored-example',
      generatedAt: null,
      model: null,
      report,
    };
    expect(() => validateArtifact(artifact, b)).not.toThrow();
    expect(() => validateArtifact({ ...artifact, evidenceHash: '0'.repeat(64) }, b)).toThrow();
  });
});

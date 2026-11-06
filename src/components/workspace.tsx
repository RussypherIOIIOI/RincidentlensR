'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import {
  ArtifactSchema,
  sortEvidence,
  statements,
  validateReport,
  type Artifact,
  type Evidence,
  type Report,
} from '../lib/contracts';
import { citationLabel, clock, figure, kindLabel } from '../lib/format';
import type { ScenarioView } from '../server/scenarios';
import { Icon, type IconName } from './brand';

function EvidenceCard({
  evidence,
  selected,
  onSelect,
}: {
  evidence: Evidence;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      id={'evidence-' + evidence.id}
      className={'evidence-card' + (selected ? ' selected' : '')}
      tabIndex={-1}
      data-selected={selected}
      data-kind={evidence.kind}
      aria-label={evidence.source + ' evidence ' + evidence.id}
    >
      <div className="evidence-topline">
        <span className="kind-chip">{kindLabel(evidence.kind)}</span>
        <span className={'severity severity-' + evidence.severity}>
          <span className="severity-dot" aria-hidden="true" />
          {evidence.severity}
        </span>
        <button
          type="button"
          onClick={onSelect}
          className="source-id"
          aria-label={'Select source ' + evidence.id}
        >
          {evidence.id}
        </button>
      </div>
      <p className="source-name">{evidence.source}</p>
      <p className={evidence.kind === 'log' ? 'log-text' : 'evidence-text'}>{evidence.text}</p>
    </article>
  );
}

function Citations({
  ids,
  onCite,
}: {
  ids: string[];
  onCite: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <span className="citations">
      {ids.map((id) => (
        <a
          key={id}
          href={'#evidence-' + id}
          aria-label={'View source ' + id}
          title={id}
          onClick={(event) => onCite(id, event)}
        >
          {citationLabel(id)}
        </a>
      ))}
    </span>
  );
}

function SectionHeading({
  icon,
  children,
  aside,
}: {
  icon: IconName;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="section-head">
      <h3>
        <span className="section-icon">
          <Icon name={icon} size={16} />
        </span>
        {children}
      </h3>
      {aside}
    </div>
  );
}

function ReportContent({
  report,
  onCite,
}: {
  report: Report;
  onCite: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const facts = (items: Report['summary']) =>
    items.map((item) => (
      <div key={item.id} className="report-statement">
        <p>
          {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
        </p>
      </div>
    ));
  return (
    <>
      <section className="summary-section">
        <h3 className="eyebrow eyebrow-brand">What the evidence says</h3>
        {facts(report.summary)}
      </section>
      <section className="report-section">
        <SectionHeading icon="insight">Observed impact</SectionHeading>
        {report.impact.length ? (
          facts(report.impact)
        ) : (
          <p className="muted">
            Impact cannot be established from the supplied evidence. See the missing information
            below.
          </p>
        )}
      </section>
      <section className="report-section">
        <SectionHeading icon="record">Key observations</SectionHeading>
        <ol className="observation-list">
          {report.observations.map((item) => (
            <li key={item.id}>
              <p>
                {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="report-section">
        <SectionHeading
          icon="signal"
          aside={<span className="chip chip-caution">Hypotheses, not conclusions</span>}
        >
          Possible causes
        </SectionHeading>
        {report.hypotheses.length ? (
          report.hypotheses.map((item) => (
            <div className="hypothesis" key={item.id}>
              <span className="confidence">
                {item.uncertainty === 'medium' ? 'Moderate' : 'Low'} confidence · uncalibrated
              </span>
              <p>
                {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
              </p>
              <ul className="gap-list" aria-label="Gaps in the evidence">
                {item.gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
              {item.counterEvidenceIds.length > 0 && (
                <p className="muted counter">
                  Potential counterevidence{' '}
                  <Citations ids={item.counterEvidenceIds} onCite={onCite} />
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="muted">The evidence does not support a useful causal hypothesis.</p>
        )}
      </section>
      <section className="report-section">
        <SectionHeading icon="reconcile">What we still don’t know</SectionHeading>
        <div className="unknowns">
          {report.missingInformation.map((item) => (
            <div className="unknown" key={item.id}>
              <p className="unknown-title">
                {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
              </p>
              <p className="muted">{item.whyItMatters}</p>
              <p className="followup">
                <span>To establish this</span> {item.nextCheck}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="report-section next-section">
        <SectionHeading icon="trust">Suggested next checks</SectionHeading>
        <p className="muted section-intro">
          Investigation suggestions only. No actions have been executed.
        </p>
        <ol className="next-list">
          {report.nextChecks.map((item) => (
            <li key={item.id}>
              <div>
                <p className="next-title">{item.text}</p>
                <p className="muted">
                  {item.rationale} <Citations ids={item.evidenceIds} onCite={onCite} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function citationCount(report: Report) {
  return statements(report).reduce(
    (total, item) =>
      total +
      item.evidenceIds.length +
      ('counterEvidenceIds' in item ? item.counterEvidenceIds.length : 0),
    0,
  );
}

export function Workspace({
  scenarios,
  liveEnabled,
}: {
  scenarios: ScenarioView[];
  liveEnabled: boolean;
}) {
  const [activeId, setActiveId] = useState(scenarios[0]?.id);
  const scenario = scenarios.find((item) => item.id === activeId);
  const [artifact, setArtifact] = useState<Artifact | null>(scenarios[0]?.artifact ?? null);
  const [activeEvidence, setActiveEvidence] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const pendingRequest = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      requestVersion.current++;
      controller.current?.abort();
    },
    [],
  );

  function selectScenario(item: ScenarioView) {
    requestVersion.current++;
    controller.current?.abort();
    pendingRequest.current = false;
    setPending(false);
    setError('');
    setActiveId(item.id);
    setArtifact(item.artifact);
    setActiveEvidence('');
  }

  function focusEvidence(id: string) {
    setActiveEvidence(id);
    const element = document.getElementById('evidence-' + id);
    if (element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView?.({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'nearest',
      });
    }
  }

  function cite(id: string, event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    focusEvidence(id);
  }

  async function generate() {
    if (!scenario || !liveEnabled || pendingRequest.current) return;
    pendingRequest.current = true;
    const version = ++requestVersion.current;
    const active = scenario;
    controller.current = new AbortController();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: active.id }),
        signal: controller.current.signal,
      });
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error('Generation is unavailable. Your previous report is still available.');
      }
      if (!response.ok) {
        const body = (payload !== null && typeof payload === 'object' ? payload : {}) as {
          error?: { message?: unknown };
        };
        throw new Error(
          typeof body.error?.message === 'string'
            ? body.error.message
            : 'Generation is unavailable. Try again later.',
        );
      }
      let result: Artifact;
      try {
        result = ArtifactSchema.parse((payload as { artifact?: unknown }).artifact);
        validateReport(result.report, active.bundle);
        if (
          result.scenarioId !== active.id ||
          result.evidenceHash !== active.artifact.evidenceHash ||
          result.origin !== 'live-generated'
        )
          throw new Error('Mismatched report');
      } catch {
        throw new Error(
          'The generated report could not be validated. Your previous report is still available.',
        );
      }
      if (requestVersion.current === version) setArtifact(result);
    } catch (cause) {
      if (
        requestVersion.current === version &&
        !(cause instanceof DOMException && cause.name === 'AbortError')
      ) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Generation is unavailable. Your previous report is still available.',
        );
      }
    } finally {
      if (requestVersion.current === version) {
        pendingRequest.current = false;
        setPending(false);
      }
    }
  }

  if (!scenario || !artifact)
    return (
      <section className="band workspace-band empty-state" id="workspace">
        <div className="band-inner">
          <h1>No scenarios available</h1>
          <p>No evidence bundles could be loaded.</p>
        </div>
      </section>
    );
  const sorted = sortEvidence(scenario.bundle.evidence);
  const events = sorted.filter((item) => item.timestamp !== null);
  const untimed = sorted.filter((item) => item.timestamp === null && item.kind !== 'runbook');
  const runbooks = sorted.filter((item) => item.kind === 'runbook');
  const isLive = artifact.origin === 'live-generated';
  const card = (item: Evidence) => (
    <EvidenceCard
      key={item.id}
      evidence={item}
      selected={activeEvidence === item.id}
      onSelect={() => focusEvidence(item.id)}
    />
  );

  return (
    <section className="band workspace-band" id="workspace" aria-labelledby="scenario-title">
      <div className="band-inner">
        <div className="scenario-picker">
          <div className="picker-head">
            <p className="eyebrow" id="picker-label">
              Choose an incident
            </p>
            <p className="picker-note">Select any citation to jump to its original source.</p>
          </div>
          <nav aria-labelledby="picker-label">
            <ul className="scenario-list">
              {scenarios.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={'scenario-option' + (item.id === scenario.id ? ' active' : '')}
                    aria-pressed={item.id === scenario.id}
                    onClick={() => selectScenario(item)}
                  >
                    <span className="scenario-number">{figure(index + 1)}</span>
                    <span className="scenario-copy">
                      <span className="scenario-category">{item.category}</span>
                      <span className="scenario-title">{item.title}</span>
                    </span>
                    <span className="scenario-count">{item.bundle.evidence.length} sources</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="investigation-heading">
          <div>
            <p className="breadcrumb">
              Investigation <span aria-hidden="true">/</span>{' '}
              <span className="signal-inline">{scenario.id}</span>
            </p>
            <h1 id="scenario-title">{scenario.title}</h1>
            <p className="investigation-lead">{scenario.description}</p>
          </div>
          <dl className="ledger ledger-compact">
            <div>
              <dt>Sources</dt>
              <dd>{figure(scenario.bundle.evidence.length)}</dd>
            </div>
            <div>
              <dt>Timed events</dt>
              <dd>{figure(events.length)}</dd>
            </div>
            <div>
              <dt>Citations</dt>
              <dd>{figure(citationCount(artifact.report))}</dd>
            </div>
            <div>
              <dt>Open questions</dt>
              <dd>{figure(artifact.report.missingInformation.length)}</dd>
            </div>
          </dl>
        </div>

        <div className="workspace-grid">
          <section className="pane evidence-pane" aria-labelledby="evidence-heading">
            <div className="pane-heading">
              <div>
                <p className="eyebrow">Source records</p>
                <h2 id="evidence-heading">Evidence timeline</h2>
              </div>
              <p className="pane-meta">
                <span>{events.length} timed events · UTC</span>
                <span className="date-label">
                  {events[0]?.timestamp?.slice(0, 10) ?? 'No timed events'}
                </span>
              </p>
            </div>
            <div className="pane-scroll evidence-scroll" key={scenario.id}>
              <ol className="timeline">
                {events.map((item) => (
                  <li key={item.id} className={'timeline-item timeline-' + item.severity}>
                    <div className="timeline-time">
                      <span className="timeline-dot" aria-hidden="true" />
                      <time dateTime={item.timestamp!}>{clock(item.timestamp)}</time>
                    </div>
                    {card(item)}
                  </li>
                ))}
              </ol>
              {untimed.length > 0 && (
                <div className="reference-group">
                  <h3>Without an event time</h3>
                  <p className="muted">These records cannot be placed reliably on the timeline.</p>
                  {untimed.map(card)}
                </div>
              )}
              <div className="reference-group runbook-group">
                <h3>Runbook reference</h3>
                <p className="muted">Recommended procedure, not a record of actions taken.</p>
                {runbooks.map(card)}
              </div>
            </div>
            <div className="pane-footer">
              <span className="status-dot" aria-hidden="true" />
              Original synthetic sources · No live ingestion
            </div>
          </section>

          <section
            className="pane report-pane"
            id="report"
            aria-labelledby="report-heading"
            aria-busy={pending}
          >
            <div className="pane-heading">
              <div>
                <p className="eyebrow">Analysis with a source trail</p>
                <h2 id="report-heading">Investigation report</h2>
              </div>
              <button
                className={'btn btn-sm generate-button' + (liveEnabled ? ' btn-primary' : '')}
                type="button"
                disabled={!liveEnabled || pending}
                onClick={generate}
                aria-label="Generate live report"
                aria-describedby="live-status"
              >
                <Icon name={liveEnabled ? 'action' : 'lock'} size={16} />
                {pending ? 'Generating…' : 'Generate live'}
              </button>
            </div>
            <div className={'provenance-bar' + (isLive ? ' live-provenance' : '')}>
              <span className="provenance-icon">
                <Icon name={isLive ? 'signal' : 'document'} size={20} />
              </span>
              <div>
                <strong>{isLive ? 'Live-generated report' : 'Bundled report'}</strong>
                <span>
                  {isLive
                    ? 'Generated on request · ' + artifact.model
                    : 'AI-authored example · No live request'}
                </span>
              </div>
              <span className={'chip ' + (isLive ? 'chip-approved' : 'chip-review')}>
                {isLive ? 'Live' : 'Example'}
              </span>
            </div>
            <p id="live-status" className="live-status">
              {pending
                ? 'Reading this evidence bundle. Your current report remains available.'
                : liveEnabled
                  ? 'Live generation is enabled for this local session.'
                  : 'Live generation is unavailable in this demo. Explore the bundled report.'}
            </p>
            {error && (
              <div role="alert" className="error-message">
                {error}
              </div>
            )}
            <div className="pane-scroll report-scroll" key={scenario.id + artifact.origin}>
              <ReportContent report={artifact.report} onCite={cite} />
              <footer className="report-disclaimer">
                <strong>Evidence-linked, not independently verified.</strong>
                <p>
                  References make the analysis inspectable. They do not prove a claim is correct.
                  Possible causes require further investigation.
                </p>
                <span className="readout">
                  Prompt v{artifact.promptVersion} · Bundle {scenario.bundle.version} · Hash{' '}
                  {artifact.evidenceHash.slice(0, 10)}
                </span>
              </footer>
            </div>
          </section>
        </div>

        <div className="workspace-notes">
          <p>
            <Icon name="document" size={16} />
            <span>
              <strong>A report you can inspect.</strong> Observations and hypotheses stay distinct,
              and missing information is named rather than guessed.
            </span>
          </p>
          <details>
            <summary>About this demo</summary>
            <p>
              All evidence is synthetic. Bundled reports are AI-authored examples, not live provider
              responses. Citation checks verify references, not the truth of every claim.
            </p>
          </details>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {pending
          ? 'Generating report'
          : 'Selected ' +
            scenario.title +
            '. ' +
            (isLive ? 'Live-generated report.' : 'Bundled report available.')}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  ArtifactSchema,
  sortEvidence,
  validateReport,
  type Artifact,
  type Evidence,
  type Report,
} from '../lib/contracts';
import type { ScenarioView } from '../server/scenarios';

function Mark({ kind = 'lens' }: { kind?: 'lens' | 'arrow' | 'spark' | 'file' | 'check' }) {
  const paths = {
    lens: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5M8 10.5h5M10.5 8v5" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    spark: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z" />
        <path d="M20 2v4m-2-2h4" />
      </>
    ),
    file: (
      <>
        <path d="M14 3H5v18h14V8Z" />
        <path d="M14 3v5h5M8 12h8M8 16h6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}

function time(timestamp: string | null) {
  return timestamp ? timestamp.slice(11, 19) : 'Untimed';
}

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
      className={'evidence-card ' + (selected ? 'selected' : '')}
      tabIndex={-1}
      data-selected={selected}
      aria-label={evidence.source + ' evidence ' + evidence.id}
    >
      <div className="evidence-topline">
        <span className={'source-kind kind-' + evidence.kind}>
          {evidence.kind === 'deployment' ? 'Deploy event' : evidence.kind}
        </span>
        <span className={'severity severity-' + evidence.severity}>{evidence.severity}</span>
        <button
          type="button"
          onClick={onSelect}
          className="source-id"
          aria-label={'Select source ' + evidence.id}
        >
          {evidence.id}
        </button>
      </div>
      <div className="source-name">{evidence.source}</div>
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
          {id.split('-').at(-1)?.replace('e', '').replace('r', 'R')}
        </a>
      ))}
    </span>
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
        <h3>What the evidence says</h3>
        {facts(report.summary)}
      </section>
      <section className="report-section">
        <h3>
          <span className="section-symbol impact-symbol">↗</span>Observed impact
        </h3>
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
        <h3>
          <span className="section-symbol">≡</span>Key observations
        </h3>
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
        <h3>
          <span className="section-symbol hypothesis-symbol">?</span>Possible causes{' '}
          <span className="section-note">Hypotheses, not conclusions</span>
        </h3>
        {report.hypotheses.length ? (
          report.hypotheses.map((item) => (
            <div className="hypothesis" key={item.id}>
              <span className="confidence">
                {item.uncertainty === 'medium' ? 'Moderate' : 'Low'} confidence · uncalibrated
              </span>
              <p>
                {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
              </p>
              <ul className="gap-list">
                {item.gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
              {item.counterEvidenceIds.length > 0 && (
                <p className="muted">
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
        <h3>
          <span className="section-symbol missing-symbol">…</span>What we still don’t know
        </h3>
        <div className="unknowns">
          {report.missingInformation.map((item) => (
            <div className="unknown" key={item.id}>
              <p className="unknown-title">
                {item.text} <Citations ids={item.evidenceIds} onCite={onCite} />
              </p>
              <p className="muted">{item.whyItMatters}</p>
              <p className="followup">
                <span>To establish this:</span> {item.nextCheck}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="report-section next-section">
        <h3>
          <Mark kind="check" />
          Suggested next checks
        </h3>
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
      <main className="empty-state">
        <h1>No scenarios available</h1>
        <p>No evidence bundles could be loaded.</p>
      </main>
    );
  const sorted = sortEvidence(scenario.bundle.evidence);
  const events = sorted.filter((item) => item.timestamp !== null);
  const untimed = sorted.filter((item) => item.timestamp === null && item.kind !== 'runbook');
  const runbooks = sorted.filter((item) => item.kind === 'runbook');
  const isLive = artifact.origin === 'live-generated';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#report">
        Skip to investigation report
      </a>
      <header className="app-header">
        <a className="brand" href="/" aria-label="IncidentLens home">
          <span className="brand-mark">
            <Mark />
          </span>
          <span>
            Incident<span className="brand-light">Lens</span>
          </span>
        </a>
        <span className="header-description">JARVIS / Evidence first. Conclusions second.</span>
        <div className="demo-label">
          <span />
          Synthetic incident lab
        </div>
      </header>
      <div className="app-body">
        <aside className="scenario-sidebar" aria-label="Incident scenarios">
          <div className="sidebar-heading">
            <h2>Investigations</h2>
            <span>03</span>
          </div>
          <p className="sidebar-intro">
            Three incidents.
            <br />
            Follow what the evidence supports.
          </p>
          <nav aria-label="Choose a scenario">
            {scenarios.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={'scenario-option ' + (item.id === scenario.id ? 'active' : '')}
                aria-pressed={item.id === scenario.id}
                onClick={() => selectScenario(item)}
              >
                <span className="scenario-number">0{index + 1}</span>
                <span className="scenario-copy">
                  <span className="scenario-category">{item.category}</span>
                  <span className="scenario-title">{item.title}</span>
                  <span className="scenario-count">
                    {item.bundle.evidence.length} sources <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footnote">
            <span className="small-icon">
              <Mark kind="file" />
            </span>
            <h3>A report you can inspect</h3>
            <p>
              Select any citation to jump to its original source. Observations and hypotheses stay
              distinct.
            </p>
            <details>
              <summary>About this demo</summary>
              <p>
                All evidence is synthetic. Bundled reports are AI-authored examples, not live
                provider responses. Citation checks verify references, not the truth of every claim.
              </p>
            </details>
          </div>
        </aside>
        <main className="main-workspace">
          <div className="investigation-heading">
            <div>
              <div className="breadcrumb">
                Investigations <span>/</span> {scenario.id}
              </div>
              <h1>{scenario.title}</h1>
              <p>{scenario.description}</p>
            </div>
            <span className="evidence-count">
              <Mark kind="file" />
              {scenario.bundle.evidence.length} evidence sources
            </span>
          </div>
          <div className="workspace-grid">
            <section className="evidence-pane" aria-labelledby="evidence-heading">
              <div className="pane-heading">
                <div>
                  <h2 id="evidence-heading">Evidence timeline</h2>
                  <p>{events.length} timed events · UTC</p>
                </div>
                <span className="date-label">
                  {events[0]?.timestamp?.slice(0, 10) ?? 'No timed events'}
                </span>
              </div>
              <div className="evidence-scroll">
                <ol className="timeline">
                  {events.map((item) => (
                    <li
                      key={item.id}
                      className={
                        'timeline-item ' + (item.severity === 'error' ? 'timeline-error' : '')
                      }
                    >
                      <div className="timeline-time">
                        <time dateTime={item.timestamp!}>{time(item.timestamp)}</time>
                        <span className="timeline-dot" />
                      </div>
                      <EvidenceCard
                        evidence={item}
                        selected={activeEvidence === item.id}
                        onSelect={() => focusEvidence(item.id)}
                      />
                    </li>
                  ))}
                </ol>
                {untimed.length > 0 && (
                  <div className="reference-group">
                    <h3>Without an event time</h3>
                    <p className="muted">
                      These records cannot be placed reliably on the timeline.
                    </p>
                    {untimed.map((item) => (
                      <EvidenceCard
                        key={item.id}
                        evidence={item}
                        selected={activeEvidence === item.id}
                        onSelect={() => focusEvidence(item.id)}
                      />
                    ))}
                  </div>
                )}
                <div className="reference-group runbook-group">
                  <h3>Runbook reference</h3>
                  <p className="muted">Recommended procedure, not a record of actions taken.</p>
                  {runbooks.map((item) => (
                    <EvidenceCard
                      key={item.id}
                      evidence={item}
                      selected={activeEvidence === item.id}
                      onSelect={() => focusEvidence(item.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="pane-footer">
                <span className="status-dot" />
                Original synthetic sources · No live ingestion
              </div>
            </section>
            <section
              className="report-pane"
              id="report"
              aria-labelledby="report-heading"
              aria-busy={pending}
            >
              <div className="pane-heading report-heading">
                <div>
                  <h2 id="report-heading">Investigation report</h2>
                  <p>Analysis with a source trail</p>
                </div>
                <button
                  className="generate-button"
                  type="button"
                  disabled={!liveEnabled || pending}
                  onClick={generate}
                  aria-label="Generate live report"
                  aria-describedby="live-status"
                >
                  <Mark kind="spark" />
                  {pending ? 'Generating…' : 'Generate live'}
                </button>
              </div>
              <div className={'provenance-bar ' + (isLive ? 'live-provenance' : '')}>
                <span className="provenance-icon">
                  <Mark kind={isLive ? 'spark' : 'file'} />
                </span>
                <div>
                  <strong>{isLive ? 'Live-generated report' : 'Bundled report'}</strong>
                  <span>
                    {isLive
                      ? 'Generated on request · ' + artifact.model
                      : 'AI-authored example · No live request'}
                  </span>
                </div>
                <span className="provenance-tag">{isLive ? 'Live' : 'Example'}</span>
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
              <div className="report-scroll">
                <ReportContent report={artifact.report} onCite={cite} />
                <footer className="report-disclaimer">
                  <strong>Evidence-linked, not independently verified.</strong>
                  <p>
                    References make the analysis inspectable. They do not prove a claim is correct.
                    Possible causes require further investigation.
                  </p>
                  <span>
                    Prompt v{artifact.promptVersion} · Bundle {scenario.bundle.version} ·{' '}
                    {artifact.evidenceHash.slice(0, 10)}
                  </span>
                </footer>
              </div>
            </section>
          </div>
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {pending
          ? 'Generating report'
          : 'Selected ' +
            scenario.title +
            '. ' +
            (isLive ? 'Live-generated report.' : 'Bundled report available.')}
      </div>
    </div>
  );
}

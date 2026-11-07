import type { CSSProperties } from 'react';
import { CompactMark, Icon, type IconName } from './brand';
import { citationLabel, clock, figure, kindLabel } from '../lib/format';
import type { LedgerFigures } from '../lib/ledger';
import type { ScenarioView } from '../server/scenarios';

export const REPOSITORY_URL = 'https://github.com/RussypherIOIIOI/RincidentlensR';
const docs = (file: string) => REPOSITORY_URL + '/blob/main/docs/' + file;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href="/" aria-label="IncidentLens home">
          <CompactMark size={32} />
          <span className="brand-name">IncidentLens</span>
        </a>
        <span className="brand-by">
          by The Meredith Collective<span className="tm">™</span>
        </span>
        <nav className="site-nav" aria-label="Site">
          <a href="/#workspace">Investigations</a>
          <a href="/#method">Method</a>
          <a href={REPOSITORY_URL}>Source</a>
        </nav>
        <span className="status-chip">
          <span className="status-dot" aria-hidden="true" />
          Synthetic lab
        </span>
      </div>
    </header>
  );
}

export interface TracePreview {
  incident: string;
  statement: string;
  sources: { id: string; label: string; kind: string; source: string; time: string }[];
}

/** Builds the hero preview from the first bundled report so it shows real content. */
export function tracePreview(scenario: ScenarioView | undefined): TracePreview | null {
  const fact = scenario?.artifact.report.summary[0];
  if (!scenario || !fact) return null;
  const sources = fact.evidenceIds
    .map((id) => scenario.bundle.evidence.find((item) => item.id === id))
    .filter((item) => item !== undefined)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      label: citationLabel(item.id),
      kind: kindLabel(item.kind),
      source: item.source,
      time: clock(item.timestamp),
    }));
  return { incident: scenario.title, statement: fact.text, sources };
}

/**
 * The preview stays readable by assistive technology: the statement and each cited record
 * are real text. Only the citation chips, which repeat the record IDs below, are hidden.
 */
function TraceFigure({ trace }: { trace: TracePreview }) {
  return (
    <figure className="trace" aria-label={'Preview from the report on “' + trace.incident + '”'}>
      <div className="trace-statement">
        <span className="trace-eyebrow">Report · What the evidence says</span>
        <p>{trace.statement}</p>
        <span className="trace-chips" aria-hidden="true">
          {trace.sources.map((item, index) => (
            <span key={item.id} className="trace-chip" style={{ '--i': index } as CSSProperties}>
              {item.label}
            </span>
          ))}
        </span>
      </div>
      <ol className="trace-sources" aria-label="Cited source records">
        {trace.sources.map((item, index) => (
          <li key={item.id} style={{ '--i': index } as CSSProperties}>
            <span className="trace-time">{item.time}</span>{' '}
            <span className="trace-kind">{item.kind}</span>{' '}
            <span className="trace-source">{item.source}</span>{' '}
            <span className="trace-id">{item.id}</span>
          </li>
        ))}
      </ol>
      <p className="trace-caption">
        <span className="status-dot" aria-hidden="true" />
        Resolved to source
      </p>
    </figure>
  );
}

function Ledger({ items, className }: { items: [string, string, boolean?][]; className?: string }) {
  return (
    <dl className={'ledger ' + (className ?? '')}>
      {items.map(([term, value, ok]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd className={ok ? 'is-ok' : undefined}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Hero({ figures, trace }: { figures: LedgerFigures; trace: TracePreview | null }) {
  return (
    <section className="hero band" aria-label="About IncidentLens">
      <div className="band-inner hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Portfolio project · Synthetic incident lab</p>
          <h1 className="display">
            Trace every claim back to <span className="display-accent">its evidence.</span>
            <span className="display-cite" aria-hidden="true">
              01
            </span>
          </h1>
          <p className="hero-lead">
            IncidentLens turns small incident bundles into reports you can check line by line. Every
            statement links to the record behind it, and facts, possible causes and open questions
            stay separate.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#workspace">
              Open the investigation
            </a>
            <a className="btn" href={REPOSITORY_URL}>
              <Icon name="document" size={16} />
              Source on GitHub
            </a>
          </div>
          <Ledger
            className="hero-ledger"
            items={[
              ['Incidents', figure(figures.incidents)],
              ['Evidence records', figure(figures.sources)],
              ['Citations', figure(figures.citations)],
              ['Open questions', figure(figures.unknowns)],
              ['Unresolved citations', figure(figures.unresolved), figures.unresolved === 0],
            ]}
          />
          <p className="ledger-note">
            Counted from the bundled reports when this page was built. Every citation is checked
            against its own bundle.
          </p>
        </div>
        {trace && (
          <div className="hero-art">
            <TraceFigure trace={trace} />
          </div>
        )}
      </div>
    </section>
  );
}

export function PatternStrip() {
  return <div className="pattern-strip" aria-hidden="true" />;
}

const principles: { icon: IconName; eyebrow: string; title: string; body: string }[] = [
  {
    icon: 'record',
    eyebrow: 'Contracts',
    title: 'One schema for every report',
    body: 'Shared Zod contracts bound each report: unique statement IDs, scenario-scoped citations and strict fields. Saved and live reports pass the same checks.',
  },
  {
    icon: 'trust',
    eyebrow: 'Integrity',
    title: 'Citations that resolve',
    body: 'Every citation must name a record in the same bundle. A canonical SHA-256 hash of the evidence rejects a saved report written against different data.',
  },
  {
    icon: 'insight',
    eyebrow: 'Reasoning',
    title: 'Facts, causes and gaps stay apart',
    body: 'Observed facts, possible causes with their gaps and counterevidence, missing information and next checks are separate parts of each report, with their own sources.',
  },
  {
    icon: 'lock',
    eyebrow: 'Boundaries',
    title: 'Live generation stays local',
    body: 'This public demo makes no AI request. Optional live generation runs only in local development, accepts only a scenario ID, and caps time, tokens and retries.',
  },
];

const stack = [
  'Next.js 16',
  'React 19',
  'TypeScript (strict)',
  'Zod 4',
  'Vitest',
  'Playwright + axe',
];

export function MethodBand() {
  return (
    <section
      className="band band-light"
      data-theme="light"
      id="method"
      tabIndex={-1}
      aria-labelledby="method-heading"
    >
      <div className="band-inner method-grid">
        <div className="method-intro">
          <p className="eyebrow">Method</p>
          <h2 id="method-heading">How every report stays checkable</h2>
          <p className="method-lead">
            The demo runs on bundled data, so you can judge the reasoning without an API key or a
            wait. These are the controls behind it.
          </p>
          <ul className="stack" aria-label="Built with">
            {stack.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
          <div className="method-links">
            <a className="btn btn-primary" href={docs('portfolio-case-study.md')}>
              Read the case study
            </a>
            <a className="btn" href={docs('architecture.md')}>
              Architecture
            </a>
          </div>
        </div>
        <div className="principles">
          {principles.map((item) => (
            <article key={item.title} className="panel principle">
              <span className="principle-icon">
                <Icon name={item.icon} size={24} />
              </span>
              <p className="eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
          <aside className="panel principle-limits" aria-labelledby="limits-heading">
            <h3 id="limits-heading">What this demo does not claim</h3>
            <p>
              Saved reports are AI-authored examples, not captured model output. Citation checks
              confirm that references resolve, not that every claim is true. No figures on incident
              speed, model accuracy or savings were measured.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="band-inner footer-grid">
        <div className="footer-brand">
          <img
            src="/brand/tmc-lockup-horizontal-dark.svg"
            width={217}
            height={80}
            alt="The Meredith Collective"
          />
          <p>
            IncidentLens is a portfolio project from The Meredith Collective
            <span className="tm">™</span>. All incident data is synthetic.
          </p>
        </div>
        <nav className="footer-nav" aria-label="Project links">
          <a href={REPOSITORY_URL}>Source code</a>
          <a href={docs('portfolio-case-study.md')}>Case study</a>
          <a href={docs('README.md')}>Documentation</a>
          <a href="/#method">Method</a>
          <a href="/#workspace">Back to the investigation</a>
        </nav>
        <p className="fine-print">
          Source licensed under GPL-3.0 · Poppins, Lora, Space Grotesk and Matrix Sans under SIL OFL
          1.1
        </p>
      </div>
    </footer>
  );
}

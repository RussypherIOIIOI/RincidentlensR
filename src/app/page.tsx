import { Workspace } from '../components/workspace';
import {
  Hero,
  MethodBand,
  PatternStrip,
  SiteFooter,
  SiteHeader,
  tracePreview,
} from '../components/site';
import { ledgerFigures } from '../lib/ledger';
import { loadScenarios } from '../server/scenarios';

export default function Home() {
  const liveEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.INCIDENTLENS_LIVE_MODE === 'local' &&
    !process.env.VERCEL &&
    !process.env.CI;
  const scenarios = loadScenarios();
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to the investigation
      </a>
      <SiteHeader />
      <main id="main">
        <Hero figures={ledgerFigures(scenarios)} trace={tracePreview(scenarios[0])} />
        <PatternStrip />
        <Workspace scenarios={scenarios} liveEnabled={liveEnabled} />
        <MethodBand />
      </main>
      <SiteFooter />
    </>
  );
}

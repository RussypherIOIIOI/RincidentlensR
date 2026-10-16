import { Workspace } from '../components/workspace';
import { loadScenarios } from '../server/scenarios';
export default function Home() {
  const liveEnabled =
    process.env.NODE_ENV === 'development' &&
    process.env.INCIDENTLENS_LIVE_MODE === 'local' &&
    !process.env.VERCEL &&
    !process.env.CI;
  return <Workspace scenarios={loadScenarios()} liveEnabled={liveEnabled} />;
}

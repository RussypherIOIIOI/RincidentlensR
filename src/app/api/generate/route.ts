import { handleGenerate } from '../../../server/generation';
import { makeOpenAIProvider } from '../../../server/openai-provider';
import { loadBundle } from '../../../server/scenarios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const response = await handleGenerate(request, {
    env: process.env,
    provider: (input) => makeOpenAIProvider(process.env.OPENAI_API_KEY ?? '')(input),
    loadBundle,
  });
  if (response.status >= 500)
    console.warn('[IncidentLens] generation unavailable; HTTP ' + response.status);
  return response;
}

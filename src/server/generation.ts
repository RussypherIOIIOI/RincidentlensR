import 'server-only';

import { z, ZodError } from 'zod';
import {
  parseBundle,
  ScenarioIdSchema,
  validateReport,
  type Artifact,
  type Bundle,
} from '../lib/contracts';
import { evidenceHash } from '../lib/integrity';
import { PROMPT_VERSION } from './prompt';

export const LIMITS = {
  requestBytes: 512,
  bodyTimeoutMs: 2000,
  generationMs: 20_000,
  outputTokensPerCall: 2500,
  totalOutputTokens: 5000,
  reportBytes: 65536,
} as const;
export interface ProviderInput {
  bundle: Bundle;
  model: string;
  signal: AbortSignal;
  maxOutputTokens: number;
  timeoutMs: number;
  corrective: boolean;
}
export type ProviderResult =
  | { status: 'completed'; data: unknown; model: string }
  | { status: 'refused' }
  | { status: 'incomplete' };
export type ProviderCall = (input: ProviderInput) => Promise<ProviderResult>;
export type ErrorCode =
  | 'INVALID_OUTPUT'
  | 'REFUSED'
  | 'INCOMPLETE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'CANCELLED';

const MESSAGES: Record<ErrorCode, string> = {
  INVALID_OUTPUT:
    'The generated report could not be validated. Your previous report is still available.',
  REFUSED: 'The provider declined this request. Your previous report is still available.',
  INCOMPLETE:
    'The provider returned an incomplete report. Your previous report is still available.',
  TIMEOUT: 'Generation timed out. Your previous report is still available.',
  RATE_LIMITED: 'The provider is rate limited. Wait before trying again.',
  QUOTA_EXHAUSTED: 'Provider quota is unavailable. Check the local operator configuration.',
  UPSTREAM_UNAVAILABLE: 'Generation is unavailable. Try again later.',
  CANCELLED: 'Generation was cancelled. Your previous report is still available.',
};
export class GenerationError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(MESSAGES[code]);
    this.name = 'GenerationError';
  }
}
class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
function classify(cause: unknown): GenerationError {
  if (cause instanceof GenerationError) return cause;
  const upstream = cause as { status?: unknown; code?: unknown; name?: unknown };
  if (upstream?.code === 'insufficient_quota') return new GenerationError('QUOTA_EXHAUSTED');
  if (upstream?.status === 429) return new GenerationError('RATE_LIMITED');
  if (upstream?.name === 'AbortError' || upstream?.name === 'APIUserAbortError')
    return new GenerationError('CANCELLED');
  if (upstream?.name === 'APIConnectionTimeoutError') return new GenerationError('TIMEOUT');
  return new GenerationError('UPSTREAM_UNAVAILABLE');
}

export async function generateReport(
  bundleInput: Bundle,
  options: { provider: ProviderCall; model: string; timeoutMs?: number; signal?: AbortSignal },
): Promise<Artifact> {
  const bundle = parseBundle(bundleInput);
  const timeoutMs = options.timeoutMs ?? LIMITS.generationMs;
  const deadline = Date.now() + timeoutMs;
  const controller = new AbortController();
  let rejectStop: (reason: GenerationError) => void = () => {};
  const stopped = new Promise<never>((_, reject) => {
    rejectStop = reject;
  });
  const onAbort = () => {
    controller.abort();
    rejectStop(new GenerationError('CANCELLED'));
  };
  options.signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => {
    controller.abort();
    rejectStop(new GenerationError('TIMEOUT'));
  }, timeoutMs);
  let reservedTokens = 0;
  try {
    if (options.signal?.aborted) throw new GenerationError('CANCELLED');
    for (let attempt = 0; attempt < 2; attempt++) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new GenerationError('TIMEOUT');
      const maxOutputTokens = Math.min(
        LIMITS.outputTokensPerCall,
        LIMITS.totalOutputTokens - reservedTokens,
      );
      reservedTokens += maxOutputTokens;
      let result: ProviderResult;
      try {
        result = await Promise.race([
          options.provider({
            bundle,
            model: options.model,
            signal: controller.signal,
            maxOutputTokens,
            timeoutMs: remainingMs,
            corrective: attempt === 1,
          }),
          stopped,
        ]);
      } catch (cause) {
        if (cause instanceof SyntaxError || cause instanceof ZodError) {
          if (attempt === 0) continue;
          throw new GenerationError('INVALID_OUTPUT');
        }
        throw classify(cause);
      }
      if (result.status === 'refused') throw new GenerationError('REFUSED');
      if (result.status === 'incomplete') throw new GenerationError('INCOMPLETE');
      try {
        if (new TextEncoder().encode(JSON.stringify(result.data)).byteLength > LIMITS.reportBytes)
          throw new Error('Oversized result');
        const report = validateReport(result.data, bundle);
        return {
          schemaVersion: '1',
          scenarioId: bundle.id,
          evidenceHash: evidenceHash(bundle),
          promptVersion: PROMPT_VERSION,
          reportVersion: '1',
          origin: 'live-generated',
          generatedAt: new Date().toISOString(),
          model: result.model,
          report,
        };
      } catch {
        if (attempt === 1) throw new GenerationError('INVALID_OUTPUT');
      }
    }
    throw new GenerationError('INVALID_OUTPUT');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

function isLocal(request: Request, env: Record<string, string | undefined>): boolean {
  if (
    env.NODE_ENV !== 'development' ||
    env.INCIDENTLENS_LIVE_MODE !== 'local' ||
    env.VERCEL ||
    env.CI
  )
    return false;
  const url = new URL(request.url);
  const loopback = (host: string) => ['localhost', '127.0.0.1', '[::1]'].includes(host);
  if (!loopback(url.hostname)) return false;
  const host = request.headers.get('host');
  if (host && !loopback(new URL('http://' + host).hostname)) return false;
  const origin = request.headers.get('origin');
  return !origin || origin === url.origin;
}
async function readBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json')
    throw new RequestError(415, 'UNSUPPORTED_MEDIA', 'Send application/json.');
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > LIMITS.requestBytes))
    throw new RequestError(413, 'BODY_TOO_LARGE', 'The generation request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'INVALID_REQUEST', 'A scenario ID is required.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const read = async () => {
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > LIMITS.requestBytes)
          throw new RequestError(413, 'BODY_TOO_LARGE', 'The generation request is too large.');
        chunks.push(value);
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      try {
        return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown;
      } catch {
        throw new RequestError(400, 'INVALID_REQUEST', 'Send valid JSON with only a scenario ID.');
      }
    };
    return await Promise.race([
      read(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new RequestError(408, 'BODY_TIMEOUT', 'The request body timed out.')),
          LIMITS.bodyTimeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
  }
}

export interface GenerationDependencies {
  env: Record<string, string | undefined>;
  provider: ProviderCall;
  loadBundle: (id: string) => Bundle;
}
const responseHeaders = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
export async function handleGenerate(
  request: Request,
  deps: GenerationDependencies,
): Promise<Response> {
  try {
    if (!isLocal(request, deps.env))
      throw new RequestError(
        403,
        'LIVE_DISABLED',
        'Live generation is disabled. Explore the bundled report.',
      );
    const input = z
      .object({ scenarioId: ScenarioIdSchema })
      .strict()
      .safeParse(await readBody(request));
    if (!input.success)
      throw new RequestError(
        400,
        'INVALID_REQUEST',
        'Choose one of the three included scenarios. No other request fields are accepted.',
      );
    if (!deps.env.OPENAI_API_KEY || !deps.env.OPENAI_MODEL)
      throw new RequestError(
        503,
        'NOT_CONFIGURED',
        'Live generation needs local provider configuration. The bundled report remains available.',
      );
    const bundle = deps.loadBundle(input.data.scenarioId);
    const artifact = await generateReport(bundle, {
      provider: deps.provider,
      model: deps.env.OPENAI_MODEL,
      signal: request.signal,
    });
    return Response.json({ artifact }, { headers: responseHeaders });
  } catch (cause) {
    if (cause instanceof RequestError)
      return Response.json(
        { error: { code: cause.code, message: cause.message } },
        { status: cause.status, headers: responseHeaders },
      );
    const error = classify(cause);
    const status =
      error.code === 'TIMEOUT'
        ? 504
        : error.code === 'RATE_LIMITED'
          ? 429
          : error.code === 'QUOTA_EXHAUSTED'
            ? 503
            : error.code === 'CANCELLED'
              ? 408
              : 502;
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status, headers: responseHeaders },
    );
  }
}

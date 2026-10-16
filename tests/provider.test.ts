import { describe, it, expect, vi } from 'vitest';
import { makeOpenAIProvider } from '@/server/openai-provider';
import { parseBundle } from '@/lib/contracts';
import { generateReport } from '@/server/generation';
import { bundle, report } from './fixtures';
const envelope = (status: string, content: unknown[]) => ({
  id: 'resp_MOCK',
  object: 'response',
  created_at: 0,
  status,
  model: 'MOCK-MODEL',
  output: [
    {
      id: 'msg_MOCK',
      type: 'message',
      status: status === 'completed' ? 'completed' : 'incomplete',
      role: 'assistant',
      content,
    },
  ],
  error: null,
  incomplete_details: status === 'incomplete' ? { reason: 'max_output_tokens' } : null,
});
const args = () => ({
  bundle: parseBundle(bundle),
  model: 'MOCK-MODEL',
  signal: new AbortController().signal,
  maxOutputTokens: 2500,
  timeoutMs: 1000,
  corrective: false,
});
describe('official OpenAI adapter with mocked HTTP', () => {
  it('uses Responses structured outputs without tool access or response storage', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json(
        envelope('completed', [
          { type: 'output_text', text: JSON.stringify(report), annotations: [] },
        ]),
      ),
    );
    const result = await makeOpenAIProvider('FAKE_TEST_KEY', fetcher)(args());
    expect(result).toMatchObject({ status: 'completed', data: report });
    const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(body.text.format.type).toBe('json_schema');
    expect(body.text.format.strict).toBe(true);
    expect(body.store).toBe(false);
    expect(body.tools).toEqual([]);
    expect(body.max_output_tokens).toBe(2500);
    expect(body.input[0].content).not.toContain('Failed deployment');
  });
  it('recognizes a refusal without treating it as malformed report JSON', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json(envelope('completed', [{ type: 'refusal', refusal: 'MOCK refusal' }])),
    );
    expect(await makeOpenAIProvider('FAKE_TEST_KEY', fetcher)(args())).toEqual({
      status: 'refused',
    });
  });
  it('recognizes truncation before attempting to parse incomplete JSON', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json(
        envelope('incomplete', [{ type: 'output_text', text: '{"summary":[', annotations: [] }]),
      ),
    );
    expect(await makeOpenAIProvider('FAKE_TEST_KEY', fetcher)(args())).toEqual({
      status: 'incomplete',
    });
  });
  it('does not perform hidden SDK retries on HTTP failures', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json(
        { error: { message: 'MOCK upstream', type: 'server_error', code: 'server_error' } },
        { status: 500 },
      ),
    );
    await expect(makeOpenAIProvider('FAKE_TEST_KEY', fetcher)(args())).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects a structurally valid but dangling citation after SDK parsing', async () => {
    const bad = structuredClone(report);
    bad.summary[0].evidenceIds = ['s002-e01'];
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json(
        envelope('completed', [
          { type: 'output_text', text: JSON.stringify(bad), annotations: [] },
        ]),
      ),
    );
    await expect(
      generateReport(parseBundle(bundle), {
        provider: makeOpenAIProvider('FAKE_TEST_KEY', fetcher),
        model: 'MOCK-MODEL',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

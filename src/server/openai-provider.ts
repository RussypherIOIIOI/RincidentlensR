import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { ReportSchema } from '../lib/contracts';
import { buildModelInput } from './prompt';
import type { ProviderCall } from './generation';

// Construction is lazy: importing this module never requires credentials.
export function makeOpenAIProvider(apiKey: string, fetcher?: typeof fetch): ProviderCall {
  return async (input) => {
    const client = new OpenAI({
      apiKey,
      maxRetries: 0,
      timeout: input.timeoutMs,
      ...(fetcher ? { fetch: fetcher } : {}),
    });
    const prompt = buildModelInput(input.bundle, input.corrective);
    const response = await client.responses.parse(
      {
        model: input.model,
        instructions: prompt.instructions,
        input: [{ role: 'user', content: prompt.input }],
        text: { format: zodTextFormat(ReportSchema, 'incident_report') },
        max_output_tokens: input.maxOutputTokens,
        tools: [],
        store: false,
      },
      { signal: input.signal, timeout: input.timeoutMs, maxRetries: 0 },
    );
    if (
      response.output.some(
        (item) => item.type === 'message' && item.content.some((part) => part.type === 'refusal'),
      )
    )
      return { status: 'refused' };
    if (response.status !== 'completed') return { status: 'incomplete' };
    return { status: 'completed', data: response.output_parsed, model: response.model };
  };
}

import { mkdirSync, writeFileSync } from 'node:fs';
import { loadEvaluationCases, evaluateReport } from '../evaluation/runner';
import { generateReport, GenerationError } from '../src/server/generation';
import { makeOpenAIProvider } from '../src/server/openai-provider';

async function main() {
  if (!process.argv.includes('--allow-paid'))
    throw new Error(
      'No requests made. Re-run explicitly with --allow-paid only after authorizing provider charges.',
    );
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
    throw new Error(
      'No requests made. OPENAI_API_KEY and a structured-output-compatible OPENAI_MODEL are required.',
    );
  const countArg = process.argv.find((arg) => arg.startsWith('--runs='));
  const runs = countArg ? Number(countArg.slice(7)) : 2;
  if (![1, 2].includes(runs)) throw new Error('No requests made. --runs must be 1 or 2.');
  const cases = loadEvaluationCases().filter(
    (item) =>
      item.id.startsWith('saved-') ||
      ['incomplete-auth-evidence', 'adversarial-log'].includes(item.id),
  );
  const provider = makeOpenAIProvider(process.env.OPENAI_API_KEY);
  const results: unknown[] = [];
  const file = new URL(
    '../reports/live-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json',
    import.meta.url,
  );
  mkdirSync(new URL('../reports', import.meta.url), { recursive: true });
  const save = () =>
    writeFileSync(
      file,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          model: process.env.OPENAI_MODEL,
          scope: 'Live observations; novel semantic support requires review.',
          results,
        },
        null,
        2,
      ) + '\n',
    );
  for (const item of cases)
    for (let run = 1; run <= runs; run++) {
      try {
        // Only neutral bundle data enters generation. Rubrics are used afterwards.
        const artifact = await generateReport(item.bundle, {
          provider,
          model: process.env.OPENAI_MODEL,
        });
        results.push({
          case: item.id,
          run,
          artifact,
          evaluation: evaluateReport(artifact.report, item.bundle, item.rubric),
        });
      } catch (cause) {
        results.push({
          case: item.id,
          run,
          errorCode: cause instanceof GenerationError ? cause.code : 'UNEXPECTED_FAILURE',
          bundle: item.bundle,
        });
      }
      save();
      console.log(item.id + ' run ' + run + ' recorded.');
    }
  console.log(
    'Saved observations and failure examples to ' +
      file.pathname +
      '. Review novel claims against sources; fixture matching is not a live semantic judge.',
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Live evaluation failed.');
  process.exitCode = 1;
});

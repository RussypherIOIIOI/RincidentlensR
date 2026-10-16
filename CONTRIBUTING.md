# Contributing and maintenance

Keep IncidentLens focused on three fixed incident bundles and an inspectable report-to-source journey. Read the [architecture](docs/architecture.md), [contracts](docs/contracts-and-api.md), and [evaluation limits](docs/testing-and-evaluation.md) before changing them.

## Development checks

Use the runtime/setup in [README.md](README.md), then:

```bash
npm run check
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Default checks must work without a provider credential. Mock the provider boundary; never introduce paid requests into CI or page load. The current workflow does not run the separate formatter command, so run it locally.

## Changing evidence or saved reports

1. Preserve stable IDs for the same source record. Add only synthetic material and unmistakably fake credentials.
2. Keep descriptive teaching labels in the display catalogue, outside model-visible bundles.
3. Review every changed claim against sources, including scope, contradictions, proposed actions, and missing facts.
4. Update the matching saved report and its canonical evidence hash using [evidenceHash](src/lib/integrity.ts). There is no bulk “approve” command; do not merely replace the digest to suppress a mismatch.
5. For AI-authored bundled examples, keep `origin: ai-authored-example`, `model: null`, and `generatedAt: null`.
6. Update the separate evaluation cases/rubrics deliberately. Record who or what reviewed the statements and why; regenerate signatures with [statementSignature](evaluation/runner.ts) only after review.
7. Run data validation, tests, and evaluation; inspect expected negative outcomes as well as saved-example results.

Use the [tested, read-only metadata recipe](docs/fixture-maintenance.md) to compute bundle hashes and statement signatures.

Evaluation cases contain independent bundle/report copies. Changing a runtime bundle does not automatically update its evaluation copy. Do not import annotations or expected answers into runtime source or model input.

## Contract, provider, and UI changes

Write a failing regression test first for high-risk validation, citation, request, and failure behavior. Keep the Zod schema as the type source. Contract changes may require provider schema, renderer, saved envelopes, mocks, and review-signature updates.

Maintain disabled-by-default production generation, server-only credentials, one bounded correction, safe typed errors, and scenario/request matching. A UI flag is not an authorization boundary. Validate model/schema compatibility with current official documentation before an explicitly authorized paid smoke test.

For UI changes, verify keyboard citation focus, visible selected states, reduced motion, narrow viewports, and honest provenance. Update [design tokens](docs/design-system.md) and [verification history](docs/verification.md) without replacing old results with new claims.

## Documentation and publication

Keep Mermaid source files synchronized with their embedded copies and validate local links after moving files. Update [CHANGELOG.md](CHANGELOG.md) for material changes. Never add invented usage statistics, unexecuted CI badges, human review, or live-model scores.

The owner’s repository includes the [GNU General Public License v3.0](LICENSE). Preserve that license when maintaining this checkout. Matrix Sans retains its own included license; see [third-party notices](THIRD_PARTY_NOTICES.md).

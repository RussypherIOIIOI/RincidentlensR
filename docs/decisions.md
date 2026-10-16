# Architecture decisions

These short records explain the implemented tradeoffs as of 2026-10-15. They describe the current code, rather than proposing unimplemented infrastructure.

## 1. One application, bundled JSON, no database

**Decision:** use a Next.js App Router app with three fixed evidence bundles and saved report envelopes.

**Reason:** the portfolio needs immediate scenario exploration, not ingestion or persistence. Deterministic assets permit installation, build, tests, and demonstration without an AI credential.

**Consequence:** adding evidence is a source change and requires coordinated report/review updates. There is no upload, editing, history, or multi-user workflow.

## 2. Shared structured contracts

**Decision:** infer TypeScript types from Zod schemas and render structured statements rather than unrestricted Markdown.

**Reason:** runtime provider data needs bounds and explicit citation-bearing factual fields. Shared contracts keep server, client validation, saved examples, and tests aligned.

**Consequence:** schema changes touch multiple fixtures and provider formatting. Structure/reference checks still cannot determine whether prose is true.

## 3. Canonical bundle hashes

**Decision:** validate a SHA-256 bundle digest in each saved artifact.

**Reason:** a saved report must not quietly survive a source-content change with misleading citations.

**Consequence:** a digest update is a deliberate maintenance step after semantic review. The hash neither authenticates an author nor validates claim support.

## 4. One official provider adapter

**Decision:** use the OpenAI SDK’s Responses structured-output path behind a thin injected provider boundary.

**Reason:** a single implemented provider and direct HTTP mocks make error handling and schema compatibility inspectable. A multi-provider framework is unnecessary for this scope.

**Consequence:** operators select a compatible available model server-side. Model-specific behavior and actual live quality remain unverified until an authorized request is made.

## 5. Local live generation; production examples only

**Decision:** production always rejects generation. Development requires opt-in and loopback checks.

**Reason:** an unauthenticated public demonstration should not expose an operator’s provider spend. Accounts, Redis, and distributed quotas would expand the MVP without improving the core evidence review.

**Consequence:** the shipped demo uses examples publicly. Host/Origin checks support a trusted local workflow; they are not authentication or public spending enforcement.

## 6. One bounded correction and preserved UI state

**Decision:** permit at most one structural/citation correction under one deadline and token reservation budget. Preserve the last valid report and ignore stale requests.

**Reason:** open-ended retries obscure costs and failures. A scenario switch must never receive a result belonging to a different selection.

**Consequence:** refusal/truncation/upstream errors can leave the example visible with a safe error. Cancellation cannot guarantee provider cancellation or prevent billing.

## 7. Separate evaluation dimensions

**Decision:** assess reference validity, signal-group coverage, uncertainty, and exact-fixture support separately.

**Reason:** a real source ID can still be irrelevant. Explicit negative examples expose this difference without pretending to solve general entailment.

**Consequence:** new prose requires review. Offline expected-outcome matches do not measure live model quality.

## 8. JARVIS styling and self-hosted typography

**Decision:** use the owner-supplied Void/Iris/NVIDIA Green palette and Matrix Sans package, with readable soft-Iris links.

**Reason:** the workspace should match the project owner’s portfolio identity and work without external font requests.

**Consequence:** the font license must ship with the asset. Color-pair calculations support contrast choices, while full post-theme browser/accessibility verification remains a separate outstanding check.

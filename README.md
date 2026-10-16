# IncidentLens

**Trace an incident report back to its evidence.**

IncidentLens turns small synthetic incident bundles into inspectable investigation reports. A visitor selects an incident, reads chronological source records, and follows report citations to the exact source. Facts, possible causes, missing information, and suggested checks remain distinct.

Built as an AI-assisted personal portfolio project with **Next.js, strict TypeScript, React, Zod, and a server-side OpenAI integration**. The public-demo path uses bundled reports and requires no API key or AI request.

## See the project in 90 seconds

1. Open **Failed deployment** and follow a summary citation. Compare rollout completion, checkout errors, and the cached health response.
2. Open **Database outage**. A running database instance does not establish successful application queries.
3. Open **Expired credential**. HTTP 401 establishes an authentication failure; the bundle cannot establish expiry.
4. Follow a runbook citation. It reveals reference guidance rather than an invented action.
5. Inspect **What we still don’t know**. Recovery, user counts, and incident duration remain unknown when unsupported.

[Full demo script](docs/demo-guide.md) · [Portfolio case study](docs/portfolio-case-study.md) · [Architecture and diagrams](docs/architecture.md)

## Run locally

Use **Node.js 24 LTS** and npm. The lockfile pins dependencies; the package engine permits Node 24–26. Recorded local checks used Node 25.9.0 and npm 11.12.1; CI targets Node 24.

For this Windows checkout:

```powershell
Set-Location -LiteralPath 'C:\Users\david\.vscode\[personal_projects]\.ppp-incidentlens'
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). After dependency installation, the bundled demo needs no database, environment file, font CDN, or AI-provider network access. Keep the terminal running.

For a production preview on the port used in this workspace:

```bash
npm run build
npm run start -- --port 3100
```

Open [http://127.0.0.1:3100](http://127.0.0.1:3100). Both scripts bind to loopback by default. Production rejects live generation, including when the local-mode environment toggle is set.

## What is included

| Scenario           | Sources | Investigation distinction                                                                      |
| ------------------ | ------: | ---------------------------------------------------------------------------------------------- |
| Failed deployment  |       9 | Release completion, endpoint changes, and sampled errors do not prove a root cause or recovery |
| Database outage    |       8 | Control-plane availability differs from application query health                               |
| Expired credential |       8 | Authentication failure differs from demonstrated expiry                                        |

Each scenario includes logs, deployment/change events, and an untimed runbook. The three saved reports are visibly labeled **AI-authored examples**. They were created by an AI coding assistant; they are not captured live-provider outputs or human-reviewed reports. Their model and generation-time fields are null.

The JARVIS interface uses **Void #08070D**, **Iris #7F00FF**, **NVIDIA Green #76B900**, and locally bundled **Matrix Sans**.

## Engineering highlights

- Shared Zod contracts enforce bounded structured reports, unique statement IDs, and scenario-scoped citation references.
- A canonical SHA-256 bundle hash rejects stale saved-report envelopes.
- Citation links reveal, scroll to, highlight, and focus displayed evidence, including runbook material.
- The optional local generation boundary accepts only a scenario ID, loads allowlisted evidence server-side, and limits deadlines, output tokens, and correction attempts.
- A small evaluation harness distinguishes citation integrity, required-evidence coverage, uncertainty, and reviewed citation support. Valid IDs alone do not prove a claim.

## Verify

```bash
npm run check
npm run format:check
npx playwright install chromium
npm run test:e2e
```

`check` runs type checking, lint, 60 current unit/component tests, 14 offline evaluation cases, and a production build. Browser tests start a separate production server on port 3107.

**Recorded evidence:** the initial implementation passed four Chromium tests. After the JARVIS theme change, static checks, 60 tests, 14 evaluation cases, production build, and selected text-color contrast calculations passed. Browser checks were not rerun after that change because browser automation was blocked. These are dated local observations, not remote CI results or a live-model accuracy score. [Verification record and remaining checks](docs/verification.md).

## Optional live mode

Live generation is explicitly opt-in, development-only, and loopback-only. It requires server-side provider configuration and can incur charges. No paid request has been executed for the recorded delivery. See [operations](docs/operations.md) before enabling it.

The integration uses the official OpenAI SDK and Responses structured outputs, with independent validation. The selected model must support the schema; live model compatibility and output quality still require an authorized smoke test.

## Documentation

Start with the [documentation index](docs/README.md) for contracts/API, evaluation, architecture decisions, security, operations, and the design system. Contributors should read [CONTRIBUTING.md](CONTRIBUTING.md); deployment boundaries are summarized in [SECURITY.md](SECURITY.md).

Live ingestion, arbitrary uploads, autonomous remediation, vector search, accounts, and chat/report history are deliberately outside this release. The source is published at [RussypherIOIIOI/RincidentlensR](https://github.com/RussypherIOIIOI/RincidentlensR). No public application deployment is recorded.

## License

This repository includes the [GNU General Public License v3.0](LICENSE), retained from the owner’s repository initialization. Matrix Sans remains covered by its included SIL Open Font License; see [third-party notices](THIRD_PARTY_NOTICES.md).

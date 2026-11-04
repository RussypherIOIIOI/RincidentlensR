# Portfolio release

## Current status — 2026-11-03

Release preparation is in progress. The application has not yet been verified on a public production origin. The connected Vercel account is `drmeredith3-1399`, but team-scoped project access returned HTTP 403 requiring account-owner consent. An empty unscoped project list does not prove that the team has no existing project.

The Windows execution backend was unavailable and the registered Desktop Commander device was offline. Work used an isolated copy of GitHub base `20f7769b94a70e05853467991687df1c96a27594`; the owner's local checkout and working prompts were not changed or inspected. Use the release PR/CI commit as the authoritative candidate, not an assumed local SHA.

## Reproduce the gates

Use Node 24 and the committed lockfile. No AI key is needed.

```bash
npm ci
npm run audit
npm run audit:prod
npm run typecheck
npm run lint
npm test
npm run eval
npm run format:check
npx playwright install --with-deps chromium
npm run test:e2e
```

The last command validates the saved bundles, builds production, starts a separate loopback server, and runs the browser suite. A separate `npm run build` is unnecessary when that command completes successfully. CI preserves evaluation, audit, and browser artifacts for 14 days. See [dependency triage](dependency-triage.md) for the temporary, tested minimatch override.

## Hosting settings and release sequence

1. In the authorized Vercel scope, find a project linked to `RussypherIOIIOI/RincidentlensR` before creating one.
2. Use the repository root, **Next.js** preset, **Node 24.x**, install `npm ci`, build `npm run build`, and the framework's default output directory. The committed `vercel.json` and `engines.node` make these choices reproducible.
3. Deploy the exact candidate whose CI passed. Record its commit, deployment ID, build URL, and runtime version from logs. Do not promote failed checks.
4. Keep `INCIDENTLENS_LIVE_MODE` disabled or absent. Do not add an OpenAI key or model for the bundled demo. The production server rejects generation even with forged client options.
5. Confirm anonymous HTTPS access, run the hosted smoke command below, and inspect desktop/mobile appearance. Then share the actual host-issued production URL and update the README/repository homepage.
6. Record the tested code SHA separately from any later documentation-only evidence commit. Never claim a previous green run verified changed code.

Runtime reference: [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Node's package engine overrides the project setting, so this project deliberately uses `24.x`.

## Test the actual deployed origin

After deployment, copy its production origin from Vercel. In PowerShell, from the checkout:

```powershell
$env:INCIDENTLENS_SMOKE_URL = Read-Host 'Paste the actual HTTPS production origin from Vercel'
try {
  npm run test:e2e
  if ($LASTEXITCODE -ne 0) { throw 'Hosted smoke checks failed; do not announce release.' }
} finally {
  Remove-Item Env:INCIDENTLENS_SMOKE_URL -ErrorAction SilentlyContinue
}
```

This uses a fresh anonymous browser context, no auth bypass token, and does not launch localhost. It checks all three scenarios, every citation's keyboard focus/highlight/viewport, runbook references, example provenance, loaded Matrix Sans, no unexpected cross-origin/provider requests, desktop/mobile overflow, reduced motion, selected automated accessibility checks, and valid/forged API requests returning `403 LIVE_DISABLED`. It is not proof of full WCAG compliance or model quality.

The **Smoke deployed IncidentLens** GitHub workflow provides the same command for an actual HTTPS origin. Select the tested code branch/commit when dispatching; verify the run's head SHA and URL input. A successful local CI journey alone is not hosted-release evidence.

## Owner-only hosting access

The account owner must approve Vercel's short-lived consent link when team access is denied. Open the link supplied in the release conversation, sign into `drmeredith3-1399`, review the requested team permissions, and approve. The link expires after 10 minutes; request a fresh link if needed. Success is Vercel confirming access, followed by successful team-scoped project listing. Do not share credentials or API tokens in chat. This blocks publishing, but not code verification. Codex resumes project discovery, deployment, anonymous smoke checks, and the demo link update after consent.

## Rollback and limitations

No previous verified production deployment is recorded, so no rollback target is claimed. Before replacing a later release, record the current good deployment ID/URL/SHA. If a candidate fails, retain that release; use Vercel's project-scoped rollback to the recorded ID and rerun hosted smoke. For a first release, keep a failing candidate unpublished.

Reports and semantic fixture annotations are AI-authored; no human review or live-model accuracy is asserted. Provider testing uses mocks. Paid smoke/evaluation is optional and requires separate explicit authorization; it is not required for this bundled portfolio release.

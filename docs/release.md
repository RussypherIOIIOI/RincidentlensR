# Portfolio release

## Current status — 2026-11-03

**READY BUT BLOCKED:** the release code passed [CI run 41771873599](https://github.com/RussypherIOIIOI/RincidentlensR/actions/runs/41771873599) at `bf8e83e9b43b2e16815fe0010f6d4f4db7a3c9cb` and was merged through [PR #1](https://github.com/RussypherIOIIOI/RincidentlensR/pull/1), merge commit `3b22f65c43407e875d612fd761e4b4154d5aebff`. This is a documentation-only evidence follow-up; no deployed SHA is claimed.

Vercel team access for `drmeredith3-1399` now works, and exact-repository/name searches found no project. Creation of a linked project failed with: “You need to add a Login Connection to your GitHub account first.” No project or public deployment was created, and hosted-origin smoke checks remain unperformed.

The Windows execution backend was unavailable and the registered Desktop Commander device was offline. Work used an isolated copy of GitHub base `20f7769b94a70e05853467991687df1c96a27594`; the owner's local checkout and working prompts were not changed or inspected. Use the release PR/CI commit as the authoritative candidate, not an assumed local SHA.

## Verified candidate

GitHub CI used Node 24.22.1 / npm 11.19.1 and passed clean installation, full and production audits (zero findings), formatting, type checking, lint, **60 unit/component tests**, **14 expected fixture outcomes**, production build/data validation, and **four Chromium tests**. [Machine-readable evidence](../reports/release/ci.json) distinguishes this exact candidate from later documentation commits. The initial candidate failed formatting because a transfer stripped final newlines; corrected bytes were committed and both push and PR workflows passed. No checks were disabled.

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

## Required owner action: connect GitHub to Vercel

Vercel requires an interactive account login connection that Codex cannot approve for the owner. Team consent is already resolved; do not repeat it. This step blocks publishing.

1. Sign into [Vercel](https://vercel.com/dashboard) as `drmeredith3-1399`, with access to GitHub account `RussypherIOIIOI`.
2. Open your profile picture → **Settings** → **Authentication**.
3. Add **GitHub**, sign in as `RussypherIOIIOI`, and approve Vercel's authorization. If repository permissions are requested, grant access to `RincidentlensR` only. If GitHub is already connected to a different Vercel account, stop and identify the intended account before transferring that connection.
4. Return to Authentication and confirm the GitHub connection is listed. Tell Codex it is connected; no token, password, screenshot of credentials, API key, or billing upgrade is needed.
5. Codex retries the linked-project creation, verifies the current candidate's CI, deploys the bundled app, runs anonymous hosted smoke, and updates the real demo link. The expected final result is a public HTTPS demo with generation disabled; connection alone does not establish a successful release.

Current navigation reference: [Vercel account management](https://vercel.com/docs/accounts).

## Rollback and limitations

No previous verified production deployment is recorded, so no rollback target is claimed. Before replacing a later release, record the current good deployment ID/URL/SHA. If a candidate fails, retain that release; use Vercel's project-scoped rollback to the recorded ID and rerun hosted smoke. For a first release, keep a failing candidate unpublished.

Reports and semantic fixture annotations are AI-authored; no human review or live-model accuracy is asserted. Provider testing uses mocks. Paid smoke/evaluation is optional and requires separate explicit authorization; it is not required for this bundled portfolio release.

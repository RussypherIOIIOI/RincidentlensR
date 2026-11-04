# Portfolio release

## Current status — 2026-11-04

**RELEASED AND VERIFIED:** [Open IncidentLens](https://incidentlens-rose.vercel.app). The production domain is public and credential-free. All three bundled scenarios work, and public generation is rejected server-side.

The first verified production deployment is `dpl_2HG73cVU45CQ2PuJLu1P4kKywRaD`, built from `283c5275932706498211ffbd9053bd494194ab0e`. [CI run 41772283764](https://github.com/RussypherIOIIOI/RincidentlensR/actions/runs/41772283764) passed on that exact commit. This document and the hosted evidence are a documentation-only follow-up. A later documentation deployment is a separate deployment; its SHA must not be substituted into the original evidence.

Project: `incidentlens` / `prj_IhtoWtrg78sBB1eSGWmOn7zm6Wp7`, scope `drmeredith3-1399`, linked to `RussypherIOIIOI/RincidentlensR`. The project uses Node `24.x`, Next.js, `npm ci`, and `npm run build`. No project environment variables or hidden production variables were present at release inspection. Preview and unique deployment URLs retain Vercel authentication; the production alias is anonymously accessible.

The Windows execution backend remained unavailable. Release work used GitHub and isolated tooling; the owner's local checkout and working prompts were not changed. GitHub is the authoritative release source.

## Verification evidence

- Exact-commit CI: clean install; zero full/production audit findings; formatting; type checking; lint; **60 unit/component tests**; **14 expected fixture outcomes**; production build/data validation; **four Chromium tests**.
- Vercel: successful clean install (zero reported vulnerabilities), all saved reports validated, production build and deployment completed. Node 24.x is verified from project configuration; the build log did not report its exact patch version.
- Hosted origin: **four tests passed**, no skips or retries, with Playwright 1.64.1 and Alpine Chromium 156.0.8078.79. All scenarios, every citation, keyboard focus/highlight/scroll, runbook references, provenance, font loading, desktop/mobile layout, reduced motion, selected axe checks, and valid/forged API rejection were checked anonymously.
- HTTP: page and Matrix Sans returned 200; both generation requests returned 403 with `LIVE_DISABLED`.
- Visual: the coding assistant inspected desktop 1440×1000 and mobile 390×844 screenshots. No human UX or semantic review is claimed.

[Hosted evidence](../reports/release/hosted.json) records deployment identity and results. [Candidate evidence](../reports/release/ci.json), [historical verification](verification.md), and [dependency triage](dependency-triage.md) preserve earlier stages. Four browser tests do not establish full WCAG compliance; fixture results are not live-model accuracy.

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

The last command validates the saved bundles, builds production, starts a separate loopback server, and runs the browser suite. CI preserves evaluation, audit, and browser artifacts for 14 days. No check was disabled to obtain a passing result.

## Verify the hosted origin

From the checkout in PowerShell:

```powershell
$env:INCIDENTLENS_SMOKE_URL = 'https://incidentlens-rose.vercel.app'
try {
  npm run test:e2e
  if ($LASTEXITCODE -ne 0) { throw 'Hosted smoke checks failed; investigate before sharing the release.' }
} finally {
  Remove-Item Env:INCIDENTLENS_SMOKE_URL -ErrorAction SilentlyContinue
}
```

With this variable set, Playwright starts no local server. It uses anonymous contexts and does not supply Vercel bypass credentials. The **Smoke deployed IncidentLens** GitHub workflow can run the same suite with this origin as its input. Match its checked-out code to the deployment being tested.

The recorded Alpine run used a temporary config that imported the committed config and set only `use.launchOptions.executablePath` to `/usr/bin/chromium-browser`, plus a JSON reporter. The committed browser tests were unchanged. Standard CI uses Playwright's installed Chromium.

## Future releases

1. Use this existing linked project. Keep the repository root, Next.js preset, Node 24.x, `npm ci`, `npm run build`, and default output directory.
2. Require CI success for the release SHA. Record the current good deployment ID before replacing it. Git pushes can trigger Vercel deployments; a successful Vercel build does not establish CI or browser success.
3. Keep public generation disabled. Do not add a provider key/model for the bundled demo.
4. Verify the actual production alias anonymously with hosted smoke after each deployment. Record the exact deployment SHA and ID separately from any evidence-only commit.
5. Retain the previous good deployment when a candidate fails. Publish only the tested URL.

References: [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [GitHub integration](https://vercel.com/docs/git/vercel-for-github), [Playwright web-server configuration](https://playwright.dev/docs/test-webserver).

## Completed owner setup

The owner completed Vercel team consent, connected GitHub account `RussypherIOIIOI` to Vercel account `drmeredith3-1399`, and installed the Vercel GitHub App with repository access. These are resolved prerequisites, not outstanding tasks.

User action required for this release: none.

## Rollback and limitations

The first verified deployment `dpl_2HG73cVU45CQ2PuJLu1P4kKywRaD` is a known-good reference for later releases. Its hostname is `incidentlens-cj7p4ynw6-drmeredith3-1399.vercel.app` (protected deployment URL). There was no earlier production deployment to roll back to. For a later failure, restore the recorded good deployment through Vercel's project-scoped rollback and rerun hosted smoke; retain its artifacts while rollback is needed.

Reports and semantic fixture annotations are AI-authored. Provider tests use mocks. Paid smoke/evaluation requires separate explicit authorization and remains unperformed. Those limits do not prevent use of this bundled portfolio demo.

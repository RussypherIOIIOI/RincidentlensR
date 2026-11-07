# Verification record

This document separates recorded implementation checks from the documentation update. It does not turn historical observations into current browser or provider guarantees.

## Recorded application checks: 2026-10-15

| Stage                       | Evidence                                                                                                     | Result and scope                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Initial delivery            | [verification.json](../reports/verification.json), [verification.log](../reports/verification.log)           | Clean `npm ci` and type check; full check; 60 unit/component tests; 14 expected evaluation outcomes; production build                    |
| Initial browser run         | Same initial record                                                                                          | Four Chromium tests covering journey/citations, production API refusal, desktop automated accessibility, and mobile layout/accessibility |
| Initial dependency snapshot | Same initial record                                                                                          | Audit reported zero vulnerabilities at that time; not a continuing security guarantee                                                    |
| Initial live-eval guard     | Same initial record                                                                                          | Invocation without paid opt-in rejected before provider use                                                                              |
| JARVIS theme update         | [theme-verification.json](../reports/theme-verification.json), [theme-check.log](../reports/theme-check.log) | Type checking, lint, 60 tests, 14 evaluation cases, production build, formatting, and eight selected contrast pairs passed               |

The initial verification timestamp is 2026-10-15T17:49:53.826Z. The theme record describes a later stage that day and has no independent timestamp field. Its browser field explicitly states that automated access was blocked and browser checks were not rerun.

## Documentation verification

The documentation update checks local file/section links, npm-script references, source examples, documentation/source counts, and synchronization between embedded diagrams and editable Mermaid files. Formatting and bundled-data validation are run again. The exact commands, outcomes, and reader review are recorded in [documentation-verification.json](../reports/documentation-verification.json) for this update.

Application source is unchanged by this documentation update. Historical application test results remain historical; rerunning a formatter or link checker is not a fresh browser or provider test.

## Remote CI: 2026-10-31

[Run 41211693995](https://github.com/RussypherIOIIOI/RincidentlensR/actions/runs/41211693995) completed successfully for `20f7769b94a70e05853467991687df1c96a27594`. Its logs record 60 unit/component tests, 14 expected fixture outcomes, and four Chromium tests; the browser command includes the production build. This closes the historical post-theme browser/remote-CI gap above. The install reported 11 moderate affected packages, subsequently traced to one tooling advisory; see [dependency triage](dependency-triage.md).

The original records above remain unchanged. New release evidence belongs in the [release guide](release.md), with the tested commit and actual deployment explicitly identified.

## Release candidate: 2026-11-03 (America/Denver)

[Run 41771873599](https://github.com/RussypherIOIIOI/RincidentlensR/actions/runs/41771873599) verified `bf8e83e9b43b2e16815fe0010f6d4f4db7a3c9cb` with clean installation, zero full/production audit findings, formatting, type checking, lint, 60 tests, 14 expected evaluation outcomes, production build, and four expanded Chromium tests. The parallel PR workflow also passed. [PR #1](https://github.com/RussypherIOIIOI/RincidentlensR/pull/1) merged the code as `3b22f65c43407e875d612fd761e4b4154d5aebff`. This dated evidence update is separate from that tested code commit. See [release evidence](../reports/release/ci.json) and [the hosting release record](release.md#completed-owner-setup).

## Public portfolio release: 2026-11-04

[IncidentLens](https://incidentlens-rose.vercel.app) was deployed from `283c5275932706498211ffbd9053bd494194ab0e` as Vercel deployment `dpl_2HG73cVU45CQ2PuJLu1P4kKywRaD`. [CI run 41772283764](https://github.com/RussypherIOIIOI/RincidentlensR/actions/runs/41772283764) passed on that exact commit. Vercel completed `npm ci` (zero reported vulnerabilities), saved-report validation, and the production build.

All four existing browser tests passed against the anonymous HTTPS production origin using Playwright 1.64.1 with Alpine Chromium 156.0.8078.79. The only temporary runner change was the browser executable path; no local server or authentication bypass was used. The run checked all three scenarios, every citation, provenance, font loading, desktop/mobile layout, keyboard focus, reduced motion, selected axe checks, and valid/forged API requests returning `403 LIVE_DISABLED`. Additional anonymous page/font requests returned HTTP 200. Desktop and mobile screenshots were visually inspected by the coding assistant; this is not a human UX review.

See [hosted evidence](../reports/release/hosted.json) and [the release guide](release.md). This evidence is a documentation-only follow-up to the deployed code; it does not retroactively claim that the evidence commit was deployed or tested.

## TMC brand redesign: 2026-11-06 (local, not deployed)

Local checks on Windows with Node 25.9.0 (the project pins Node 24.x for CI and Vercel): type checking, lint, 62 unit/component tests (60 existing plus 2 ledger tests), 14 expected evaluation outcomes, production build, formatting, and the four unchanged Chromium tests including their axe checks. A separate local axe scan with WCAG 2.2 AA and best-practice rules reported no violations on desktop 1440×900, mobile 390×844 and the 404 page; contrast items it could not decide automatically were checked as flat color pairs (see the [design system](design-system.md#contrast)). The coding assistant inspected the rendered desktop and mobile layouts. This stage is not yet in remote CI or deployed, and no human UX review is claimed.

Review follow-up on PR #2: automated review comments led to these changes.

- The hero line is now the page's only `h1`, and the workspace headings nest under it.
- Skip-link and in-page targets now take focus, and the 404 page has its own skip link.
- The footer gains a Method link, which the mobile header otherwise hides.
- The hero trace preview is now readable by assistive technology.
- The header status chip hides below 375px, so the header fits a 320px screen.

The two Chromium heading assertions now expect the incident title as an `h2` and the hero line as the `h1`. The cross-bundle ledger test now supplies both bundles.

After these changes, the local checks above passed again: 62 tests, 14 cases, the build and the four Chromium tests. The separate axe scan again reported no violations. A scripted browser check confirmed that each skip link moves focus to its target and that nothing scrolls sideways from 320px to 720px.

## Remaining work before stronger claims

- Verify each new release candidate in CI and visually inspect the actual public desktop/mobile deployment where browser access is permitted.
- Run an authorized paid smoke test for the chosen available model, checking structured-output/schema compatibility and error behavior.
- Independently review newly generated claims and repeated live outputs; no human semantic review or live-model accuracy result is recorded.

The model adapter has been exercised through mocked provider HTTP. No paid generation or real incident ingestion is claimed here. External bundled deployment is verified above. The source is published on GitHub, with remote CI evidence above. The evaluation corpus is AI-reviewed, closed-fixture regression rather than general entailment assessment.

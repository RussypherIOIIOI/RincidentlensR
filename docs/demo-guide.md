# Demo and interview guide

The default demo needs no provider key and makes no AI request. Use the locally running app or a separately verified public bundled deployment. The localhost URL works only on the machine running the server.

## Prepare

1. From the root, run `npm ci`, `npm run build`, and `npm run start -- --port 3100`.
2. Open [127.0.0.1:3100](http://127.0.0.1:3100) and keep the server terminal running.
3. Confirm the bundled-report label, all three scenario buttons, and a citation jump before presenting.
4. Leave **Generate live** disabled for the recruiter walkthrough. A live request is unnecessary to demonstrate the product.

## A 60–90 second walkthrough

| Time    | Action                                                             | Suggested narration                                                                                                                    |
| ------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 0–15 s  | Open Failed deployment                                             | “This converts a small synthetic evidence bundle into an investigation report. The default report is a clearly labeled saved example.” |
| 15–30 s | Activate a summary citation, then inspect the cached health source | “Each claim has a path back to evidence. A completed deployment and a cached health response do not prove checkout health.”            |
| 30–45 s | Scroll to possible causes and unknowns                             | “A plausible explanation remains a hypothesis. Recovery and rollback completion are still unknown.”                                    |
| 45–60 s | Select Database outage                                             | “The source distinguishes a running database instance from failed application queries.”                                                |
| 60–75 s | Select Expired credential                                          | “The report does not claim expiry: the sources show unauthorized responses without an expiry reason.”                                  |
| 75–90 s | Follow a runbook citation and mention evaluation                   | “Reference guidance stays separate from executed actions. Evaluation checks both reference integrity and known support failures.”      |

For a keyboard demonstration, Tab to a **View source** link and press Enter. The evidence card receives focus and a visible highlight. Reduced-motion preferences disable smooth scrolling.

## Five-minute engineering discussion

- **Contracts:** show [contracts.ts](../src/lib/contracts.ts). Explain why TypeScript alone cannot validate provider JSON.
- **Provenance:** show [integrity.ts](../src/lib/integrity.ts). Change detection ties the artifact to its evidence; it does not certify meaning.
- **Concurrency:** show the request version/ref guard in [workspace.tsx](../src/components/workspace.tsx). Switching scenarios invalidates stale responses.
- **Boundaries:** show the [architecture diagrams](architecture.md). The server loads allowlisted evidence and never accepts arbitrary prompts or client model selection.
- **Evaluation:** run `npm run eval` in a second terminal. The irrelevant-citation case should pass reference validity while failing reviewed support.

## Questions to be ready for

| Question                             | Honest answer                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Is this live AI output?              | The default reports are AI-authored bundled examples. Optional live integration was tested with mocked provider HTTP. |
| Does a valid citation prove a claim? | No. Source membership is deterministic; semantic support is assessed only for the annotated fixture corpus.           |
| Why no database?                     | The MVP has three immutable bundles and no history or accounts; file-based data is sufficient.                        |
| Can the demo spend money publicly?   | Production rejects generation server-side. The local development option is explicit and operator controlled.          |
| What was actually measured?          | Dated local check results, not production reliability, model accuracy, or user impact.                                |
| What comes next?                     | Live model compatibility/quality checks with authorized spending and independent semantic review.                     |

## Capture plan for a future portfolio page

Useful images would show the JARVIS workspace, a selected source after citation activation, and a report’s missing-information section. Include descriptive alt text and keep the synthetic/bundled labels visible. No new UI screenshots or demo video were produced for this documentation update; do not present the earlier light-theme screenshot as the current JARVIS interface.

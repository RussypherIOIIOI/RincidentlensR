# IncidentLens: portfolio case study

**An incident investigation workspace that makes AI-generated claims inspectable.**

Portfolio project · AI-assisted implementation · Synthetic evidence · No live production incident data

## Problem

An incident summary can sound convincing while overstating impact, treating a health check as proof of recovery, or converting a plausible explanation into a root cause. Reviewers need a short path from a report’s statement to the original record, plus a clear account of what the evidence cannot establish.

IncidentLens addresses that review problem through three deliberately small scenarios. A hiring viewer can explore the product immediately without supplying credentials or waiting for a provider.

## Delivered experience

A visitor selects a deployment failure, database outage, or authentication incident. The workspace separates timed events from untimed material and runbooks. The report separates factual observations, possible causes, missing information, and proposed next checks. Selecting a citation reveals and focuses the source.

Saved examples make the demo dependable. Optional live generation shares the report contract, while a local-only server gate, bounded attempts, and safe errors control its failure behavior. The JARVIS visual system uses Void, Iris, NVIDIA Green, and self-hosted Matrix Sans.

## Engineering decisions worth discussing

| Decision                              | Evidence in the repository                                                               | Skill demonstrated                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Zod as the shared contract            | [Contracts](../src/lib/contracts.ts), [contract tests](../tests/contracts.test.ts)       | Runtime validation and type design                  |
| Canonical evidence hashing            | [Integrity](../src/lib/integrity.ts)                                                     | Provenance and stale-artifact detection             |
| Evidence-only provider input          | [Prompt](../src/server/prompt.ts), [adapter](../src/server/openai-provider.ts)           | Server boundaries and controlled model integration  |
| Versioned UI requests                 | [Workspace](../src/components/workspace.tsx), [UI tests](../tests/workspace.test.tsx)    | React state, race handling, accessible interactions |
| Separate reference and support checks | [Evaluation runner](../evaluation/runner.ts), [negative cases](../evaluation/cases.json) | Evaluation design and honest measurement            |
| Offline-first public experience       | [Mode gate](../src/server/generation.ts), [CI](../.github/workflows/ci.yml)              | Scope control and operational judgment              |

The most revealing example is the “Expired credential” scenario: the viewer-facing label names the teaching scenario, while the model receives neutral source data. The saved report states that expiry is unknown because HTTP 401 and a redacted export do not prove it.

## Evidence of the result

The implementation contains 60 unit/component tests, 14 explicit evaluation cases, and four browser tests. Recorded execution and its limits are detailed in the [verification record](verification.md). The post-theme build and offline checks passed; browser checks after the theme change and an actual live-provider smoke test remain outstanding.

The project demonstrates a working review flow and contract/failure regression behavior. It does not establish faster incident resolution, production adoption, calibrated confidence, live-model accuracy, or financial savings. No such measurements were collected.

## Scope and tradeoffs

Bundled JSON avoids infrastructure that would distract from evidence correctness. A single provider adapter avoids a framework abstraction without a demonstrated need. Saved examples improve demo availability but are not live generation benchmarks. Exact-fixture semantic review is inspectable but cannot approve novel model prose.

The next substantive improvement is an authorized live smoke test followed by independent review of repeated outputs. Public live generation would need access control and spending enforcement first. Live ingestion and remediation remain separate future work.

## Portfolio copy to adapt

**Short project description**

> Built an AI-assisted incident investigation demo with Next.js and TypeScript, combining structured reports, source-linked evidence, explicit uncertainty, and a credential-free portfolio experience.

**Technical resume bullets**

- Implemented shared Zod contracts, scenario-scoped citations, and canonical bundle hashing to reject malformed or stale report artifacts.
- Built a server-only structured-output adapter with bounded generation, one corrective attempt, typed failures, and UI protection against stale responses.
- Created deterministic tests and a four-dimension evaluation harness that distinguishes citation integrity from reviewed claim support.

Adapt these statements to the work you can personally explain and substantiate. This project was implemented and documented with an AI coding assistant; the saved reports and review annotations are also AI-authored. Human review, professional incident-response experience, and independent model evaluation are not implied.

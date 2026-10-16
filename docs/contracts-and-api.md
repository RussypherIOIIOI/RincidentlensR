# Contracts and API

[contracts.ts](../src/lib/contracts.ts) is the authoritative runtime schema and inferred TypeScript model. Objects are strict: extra fields are rejected. Provider schema conformance is followed by independent deterministic validation.

## Evidence bundles

A bundle contains `id`, `version: "1"`, and 1–48 evidence records. Its parsed JSON representation is limited to 64 KiB. The allowlisted IDs are `scenario-001`, `scenario-002`, and `scenario-003`.

| Evidence field | Contract                                                                            |
| -------------- | ----------------------------------------------------------------------------------- |
| `id`           | 1–64 lowercase letters/digits separated by single hyphens; unique within the bundle |
| `scenarioId`   | Must equal its parent bundle ID                                                     |
| `kind`         | `log`, `deployment`, `metric`, or `runbook`                                         |
| `source`       | 1–100 characters; neutral source label                                              |
| `text`         | 1–6,000 characters of synthetic source text                                         |
| `timestamp`    | Valid ISO-8601 UTC timestamp ending in Z, or explicit `null`                        |
| `severity`     | `info`, `warning`, `error`, or `reference`                                          |

IDs are stable source identifiers by authoring convention; there is no mutable evidence-editing API. Timestamped records sort by instant, with ID as the tie-breaker. Null timestamps sort after timed records; the UI renders untimed records separately. Runbooks must have a null timestamp and are always reference context.

This is an actual excerpt from [scenario-001](../data/evidence/scenario-001.json), not a complete bundle:

```json
{
  "id": "s001-e03",
  "scenarioId": "scenario-001",
  "kind": "log",
  "source": "checkout-api",
  "timestamp": "2026-02-18T10:02:05.000Z",
  "text": "GET /checkout returned HTTP 503. Outbound connection to payments.internal:8081 failed with ECONNREFUSED. request_id=SYNTHETIC-REQ-01",
  "severity": "error"
}
```

Synthetic hostnames and credential labels are illustrative, not live endpoints or secrets.

## Structured report

All statement IDs share the same bounded ID syntax and must be unique across the whole report. Prose is trimmed, nonempty, and at most 1,600 characters per field. Each citation list contains at most 16 IDs.

| Section              | Count | Statement fields                                                                  |
| -------------------- | ----: | --------------------------------------------------------------------------------- |
| `summary`            |   1–4 | `id`, `text`, nonempty `evidenceIds`                                              |
| `impact`             |   0–6 | Same factual-claim shape                                                          |
| `observations`       |  1–12 | Same factual-claim shape                                                          |
| `hypotheses`         |   0–5 | `id`, `text`, nonempty `evidenceIds`, `uncertainty`, `gaps`, `counterEvidenceIds` |
| `missingInformation` |   1–8 | `id`, `text`, `whyItMatters`, `nextCheck`, `evidenceIds`                          |
| `nextChecks`         |   1–8 | `id`, `text`, `rationale`, `evidenceIds`                                          |

Hypotheses use `low` or `medium` qualitative confidence and 1–6 gaps. The UI labels confidence as uncalibrated. It is not a probability estimate.

Empty impact means the evidence cannot establish impact. Missing-information and recommendation records may have empty citations when no relevant context exists; the prompt/review policy still requires support for any incident-specific assertions in their prose. Schema validation does not prove that this semantic policy was followed.

Every reference, including hypothesis counterevidence, must resolve within the selected bundle. Duplicate IDs inside one citation list are rejected; reuse across different statements is valid. Runbook IDs are valid references to procedures, not evidence that those procedures occurred. The model never supplies citation URLs, HTML, or paths.

## Application-owned artifact

Saved and live reports use the same envelope:

| Field                                             | Meaning                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `schemaVersion`, `promptVersion`, `reportVersion` | Currently literal `"1"`                                                        |
| `scenarioId`                                      | Allowlisted bundle ID                                                          |
| `evidenceHash`                                    | 64 lowercase hexadecimal characters: canonical SHA-256 bundle digest           |
| `origin`                                          | `ai-authored-example` or `live-generated`                                      |
| `generatedAt`, `model`                            | Null for examples; actual UTC time and provider-returned model for live output |
| `report`                                          | The structured report                                                          |

[integrity.ts](../src/lib/integrity.ts) sorts evidence by ID and object keys recursively before hashing. Evidence-array order and object-key order do not change the hash. Text, timestamps, version, and other bundle content do. The digest binds a saved report to its sources; it is not a signature, authenticity guarantee, or semantic review.

The live-generation service limits serialized report output to 64 KiB before report validation. Saved reports are checked against their schemas, source references, provenance rules, and bundle digest by `npm run validate:data` and the server loader.

## POST /api/generate

The Node.js route accepts `Content-Type: application/json` and exactly:

```json
{ "scenarioId": "scenario-001" }
```

The other two allowlisted scenario IDs are accepted too. Evidence, prompts, model names, URLs, paths, and client enablement flags are rejected fields.

The server checks live-mode policy **before** reading the body. Therefore disabled/production requests return `403 LIVE_DISABLED` even if their bodies are malformed or oversized. Request-specific errors below apply after the local-mode gate passes.

Success is HTTP 200 with `{ artifact: Artifact }`. The returned envelope follows the contract above. All handled responses use `Cache-Control: no-store`.

Errors use this shape, with a safe, fixed application message:

```json
{
  "error": {
    "code": "LIVE_DISABLED",
    "message": "Live generation is disabled. Explore the bundled report."
  }
}
```

| HTTP | Code                    | Trigger                                                                              |
| ---: | ----------------------- | ------------------------------------------------------------------------------------ |
|  400 | `INVALID_REQUEST`       | Missing body, bad JSON/UTF-8, unknown scenario, or extra fields                      |
|  403 | `LIVE_DISABLED`         | Production/default mode, CI/Vercel, non-loopback target, or disallowed origin        |
|  408 | `BODY_TIMEOUT`          | Body not read within two seconds                                                     |
|  408 | `CANCELLED`             | Generation cancellation                                                              |
|  413 | `BODY_TOO_LARGE`        | Declared or streamed body exceeds 512 bytes; invalid content-length is also rejected |
|  415 | `UNSUPPORTED_MEDIA`     | Content type is not JSON                                                             |
|  429 | `RATE_LIMITED`          | Provider rate limit                                                                  |
|  502 | `INVALID_OUTPUT`        | Structural/citation checks fail after the allowed correction                         |
|  502 | `REFUSED`, `INCOMPLETE` | Provider refusal or incomplete/truncated response                                    |
|  502 | `UPSTREAM_UNAVAILABLE`  | Other upstream/unclassified failure                                                  |
|  503 | `NOT_CONFIGURED`        | Local live mode lacks a provider key or model                                        |
|  503 | `QUOTA_EXHAUSTED`       | Provider reports insufficient quota                                                  |
|  504 | `TIMEOUT`               | Generation deadline or provider timeout                                              |

A non-JSON intermediary failure also preserves the UI’s last valid report. See [operations](operations.md) for configuration and spending bounds, and [security](../SECURITY.md) for the local-only trust model.

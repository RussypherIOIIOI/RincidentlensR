# Security and trust boundaries

IncidentLens is a portfolio demonstration using synthetic bundled evidence. It is not a production incident response or remediation system.

## Supported operating model

- The default experience uses saved examples without provider requests.
- Production rejects live generation server-side, even when credentials or a local-mode toggle are present.
- Optional live use is restricted to an explicitly enabled, loopback-bound development process operated by a trusted local user.
- There are no accounts, authentication, distributed quotas, durable audit logs, or public paid-generation controls.

Host/Origin checks are defense in depth for that local workflow. A request without an Origin may be accepted locally. These checks cannot make a publicly exposed development server safe for shared provider spending. Do not tunnel local live mode publicly.

## Implemented controls

| Boundary              | Control                                                                      | Limit                                                  |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| Client input          | Strict scenario-only JSON, allowlisted server load, body/deadline bounds     | No arbitrary uploads or evidence text                  |
| Provider credential   | Lazy server-only SDK; no public environment variable                         | Operator still controls local secret hygiene           |
| Evidence instructions | Versioned policy, explicit untrusted-data serialization, no model tools      | Prompt separation is not guaranteed injection immunity |
| Model output          | Structured schema, independent references/IDs validation, bounded correction | Does not establish semantic truth                      |
| Rendering             | React text rendering; application-built citation anchors                     | No raw model HTML or model-provided navigation         |
| Saved example         | Canonical bundle digest and schema/provenance checks                         | Hash is not an authenticity signature                  |
| Logging               | Small status warnings; no full prompts/credentials                           | Not a durable audit system                             |

All scenario views are intentionally passed to the browser. They must remain synthetic; server-side loading is not a mechanism for hiding their evidence from visitors. Evaluation expected answers and review annotations are separate and must stay out of client bundles and model prompts.

The SDK sends `store: false`; that request setting is not a claim of zero provider retention or an exemption from provider policies.

## Handling suspected issues

Stop the affected local live process if credentials or spending may be exposed, rotate compromised credentials through the provider, and preserve a minimal sanitized reproduction. Share vulnerabilities with the project owner through a private channel you already trust. No dedicated reporting address is configured. Source is published at [RussypherIOIIOI/RincidentlensR](https://github.com/RussypherIOIIOI/RincidentlensR); do not put secrets in public issues.

Do not post real API keys, full private prompts, or incident data in public issues, logs, or screenshots. Review dependency advisories before publication; the recorded audit result is only a dated snapshot.

Public live generation needs a separate access-control and enforceable spending-limit design before implementation. See [operations](docs/operations.md) and [verification limits](docs/verification.md).

# Dependency triage — 2026-11-03

The release audit used Node 24.18.0 / npm 11.16.0 in an isolated Linux checkout of base commit `20f7769b94a70e05853467991687df1c96a27594`. These are registry observations at execution time, not a security guarantee.

## Finding and exposure

The full audit reported **11 moderate affected packages from one unique advisory**, [GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249). The installed vulnerable leaf was `minimatch@10.2.6`; the advisory identifies attacker-controlled glob patterns with `optimizationLevel >= 2` as the amplification precondition. This is tooling exposure: the paths below belong to development dependencies, and the production-only audit reported zero findings. No public request path to this glob parser was identified. Untrusted repository/configuration changes can still affect CI; dev-only does not mean harmless.

Each package below was reported moderate via that same advisory; all installed paths are `node_modules/<package>`.

| Affected package                     | Installed version before fix | Dependency path to affected leaf                                       |
| ------------------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| minimatch                            | 10.2.6                       | Leaf                                                                   |
| eslint                               | 10.12.0                      | Direct dev dependency → minimatch                                      |
| @eslint/config-array                 | 0.23.5                       | eslint → config-array → minimatch                                      |
| @typescript-eslint/typescript-estree | 8.71.2                       | typescript-eslint → typescript-estree → minimatch                      |
| @typescript-eslint/parser            | 8.71.2                       | typescript-eslint → parser → typescript-estree                         |
| @typescript-eslint/type-utils        | 8.71.2                       | typescript-eslint → eslint-plugin → type-utils → typescript-estree     |
| @typescript-eslint/utils             | 8.71.2                       | typescript-eslint → utils → typescript-estree                          |
| @typescript-eslint/eslint-plugin     | 8.71.2                       | typescript-eslint → eslint-plugin → parser / type-utils / utils        |
| typescript-eslint                    | 8.71.2                       | Direct dev dependency → packages above                                 |
| @eslint-community/eslint-utils       | 4.10.1                       | eslint / TypeScript utils → eslint-utils; affected through eslint peer |
| @eslint/js                           | 10.0.1                       | Direct dev dependency; affected through eslint peer                    |

## Fix and compatibility

The maintainer identifies 11.0.1 as patched. At inspection time, ESLint 10.14.0 and TypeScript ESLint 8.72.1 still declared minimatch 10 ranges, so simply upgrading those parents would retain the advisory. npm suggested incompatible downgrades; no force-fix or downgrade was applied.

A version-scoped npm override replaces `minimatch@>=10.2.2 <11` with exact `11.0.4`. This crosses a transitive major version and is an explicit compatibility tradeoff, not an upstream parent compatibility guarantee. All other dependency versions remain pinned. The lockfile changes only its root metadata, minimatch, and one new dependency, `@isaacs/nonrecursive-glob-match`. Node is pinned to `24.x` to align local, CI, and hosting runtimes.

Before/after lint selected the same 27 files. A deliberate unused TypeScript variable was still rejected with the configured error rule. Type checking, lint, all 60 tests, 14 expected fixture outcomes, and production build subsequently passed. The release workflow also exercises the browser journey. Revisit the override when parent packages natively adopt the patched major; remove it only with a clean audit and the same verification.

## Audit gate and residuals

Both full and production-only audits after the change reported **zero vulnerabilities**, exit 0. No risk exceptions or human acceptance are asserted. Raw snapshots are in [release evidence](../reports/release/).

CI runs both audits, prints both complete reports, preserves both as artifacts, and fails on any moderate-or-higher result or audit transport/error exit. It does not suppress development findings. Low findings remain visible and require triage; raising the threshold or accepting future findings requires an explicit policy decision.

Reproduce with `npm ci`, `npm run audit`, and `npm run audit:prod`. To inspect provenance, run `npm explain minimatch`. Audit behavior: [npm documentation](https://docs.npmjs.com/cli/v11/commands/npm-audit/).

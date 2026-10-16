# Operations

Run commands from the repository root. The installed lockfile and [package scripts](../package.json) define the supported workflow. No database, migration, container, or external service is required for bundled reports.

## Local setup

Use Node.js 24 LTS and npm. In this Windows checkout, brackets in the parent directory require literal-path handling:

```powershell
Set-Location -LiteralPath 'C:\Users\david\.vscode\[personal_projects]\.ppp-incidentlens'
node --version
npm --version
npm ci
npm run dev
```

The development URL is [127.0.0.1:3000](http://127.0.0.1:3000). Keep its terminal open. To use port 3100 instead:

```bash
npm run dev -- --port 3100
```

For the credential-free production preview:

```bash
npm run build
npm run start -- --port 3100
```

Refresh [127.0.0.1:3100](http://127.0.0.1:3100) after restarting. A production build is a snapshot; source changes require rebuilding. Do not run a new build against the same output directory while relying on an existing production server; stop the owned process, build, and restart.

## Optional local live generation

This mode is for a trusted operator’s local development process. Provider requests can cost money.

1. Copy the template without putting credentials in version control:
   ```powershell
   Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
   ```
2. In the local file, set `INCIDENTLENS_LIVE_MODE=local` and configure `OPENAI_API_KEY` and `OPENAI_MODEL`. Choose an available model supporting Responses structured outputs and the installed schema integration.
3. Restart `npm run dev` with its loopback binding.
4. Select **Generate live** deliberately. Review the result against evidence; structural validity is not a truth guarantee.

Do not overwrite an existing configured `.env.local` merely to refresh the template. The default UI and build require none of these values.

| Variable                    | Purpose                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `INCIDENTLENS_LIVE_MODE`    | Defaults to disabled behavior; only literal `local` opts into development live mode |
| `OPENAI_API_KEY`            | Server-only provider credential; never use a `NEXT_PUBLIC_` variant                 |
| `OPENAI_MODEL`              | Server-side model selection; no default model is guessed                            |
| `NEXT_TELEMETRY_DISABLED=1` | Disables Next.js telemetry; included in the template                                |

The server gate requires development mode, local opt-in, no truthy `CI`/`VERCEL`, a loopback URL/Host, and a matching Origin when one is present. Missing Origin is allowed for the local workflow. UI availability does not replace this gate.

Production always rejects generation, regardless of the toggle or credentials. Host/Origin checks are not authentication. Keep the development server off public bindings and tunnels. The separate live evaluation CLI is an explicitly paid operator command and is described in [testing and evaluation](testing-and-evaluation.md#optional-paid-evaluation).

## Cost and failure bounds

| Limit                  | Value                                                         |
| ---------------------- | ------------------------------------------------------------- |
| Incoming body          | 512 bytes, checked while streaming; two-second read deadline  |
| Evidence               | 64 KiB and at most 48 records                                 |
| Generation             | One 20-second service deadline across both attempts           |
| Corrective call        | At most one, only for structural/citation failure             |
| Output tokens          | At most 2,500 reserved per attempt; 5,000 across a generation |
| Serialized live report | 64 KiB, plus field and section limits                         |
| SDK retries            | Zero                                                          |

Input tokens can be billed on both attempts. Output accounting can include reasoning tokens for the selected model. These limits are not a currency cap or cross-request spending control. A browser abort may reach the server/provider but does not guarantee cancellation or avoid billing.

The UI preserves the active scenario’s last valid report on refusal, truncation, timeout, malformed output, quota, or network failure. It labels examples and live results distinctly. Server diagnostics log a small HTTP-status warning for 5xx responses, without full prompts or credentials. [API errors](contracts-and-api.md#post-apigenerate) list exact codes.

## Public bundled deployment

No public deployment has been performed. To deploy the existing bundled experience on a Next.js-compatible Node host:

1. Select the application root containing `package.json`; the extra nested `incidentlens` folder has been removed.
2. Install with `npm ci`, build with `npm run build`, and use the host’s Next.js runtime/start configuration.
3. On a platform such as Vercel, select the Next.js preset and confirm the repository root/build settings. No API key or model variable is required for the offline portfolio demo.
4. Verify all scenarios and citation targets, the bundled-example label, local font delivery, and server rejection of generation before sharing the URL.

The local `start` script binds to 127.0.0.1. A self-managed public server needs a deliberate host-compatible binding/reverse-proxy configuration; the bundled Vercel/Next runtime does not use a localhost browser URL as its public address.

Enabling public paid generation requires a future design with deployment-level access control and enforceable spending limits. It is not supported by this release.

## Troubleshooting

| Symptom                            | Check or action                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Connection refused                 | Start the app from this root; confirm the terminal says Ready and the URL/port matches               |
| Port already in use                | Choose another port, or stop the process you own; do not kill unrelated Node processes               |
| Old appearance                     | Stop the owned production server, rebuild, restart, and reload the browser                           |
| PowerShell cannot enter the folder | Use `Set-Location -LiteralPath` because the path contains brackets                                   |
| Live button disabled               | Expected for production/default mode; local opt-in requires a development restart                    |
| `NOT_CONFIGURED`                   | Configure both server key and compatible model locally; restart                                      |
| Saved bundle mismatch              | Review changed evidence/report content and update its envelope together; do not bypass the check     |
| Browser tests cannot launch        | Install Chromium; on Linux include its system dependencies                                           |
| Font not available                 | Confirm `public/fonts/MatrixSans-Regular.woff2` exists and is served; runtime does not read OneDrive |
| A live evaluation records failures | Read every result/error in the saved JSON; command completion is not a quality verdict               |

import { defineConfig, devices } from '@playwright/test';
const smokeURL = process.env.INCIDENTLENS_SMOKE_URL;
if (smokeURL) {
  const url = new URL(smokeURL);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('INCIDENTLENS_SMOKE_URL must be a credential-free HTTPS origin.');
  }
}
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: smokeURL ?? 'http://127.0.0.1:3107', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: smokeURL
    ? undefined
    : {
        command: 'npm run build && npm run start -- --port 3107',
        url: 'http://127.0.0.1:3107',
        reuseExistingServer: false,
        timeout: 180000,
        env: { INCIDENTLENS_LIVE_MODE: 'disabled', NEXT_TELEMETRY_DISABLED: '1' },
      },
});

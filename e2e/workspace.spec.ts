import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const scenarios = [
  ['Failed deployment', 'Checkout errors after a release'],
  ['Database outage', 'Connection slots under pressure'],
  ['Expired credential', 'Authentication fails. Expiry is unclear.'],
] as const;

test('credential-free recruiter journey across all scenarios and source references', async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  const unexpectedRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const origin = new URL(baseURL!).origin;
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin || url.pathname === '/api/generate') {
      unexpectedRequests.push(url.origin + url.pathname);
      return route.abort();
    }
    return route.continue();
  });
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe(origin);
  await expect(page.getByRole('button', { name: 'Generate live report' })).toBeDisabled();
  for (const [category, title] of scenarios) {
    await page.getByRole('button', { name: new RegExp(category) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const citations = page.getByRole('link', { name: /View source / });
    expect(await citations.count()).toBeGreaterThan(0);
    for (let i = 0; i < (await citations.count()); i++) {
      const link = citations.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#evidence-s00[1-3]-[er]\d+$/);
      const target = page.locator('[id="' + href!.slice(1) + '"]');
      await expect(target).toHaveCount(1);
      await link.focus();
      await page.keyboard.press('Enter');
      await expect(target).toBeFocused();
      await expect(target).toHaveAttribute('data-selected', 'true');
      await expect(target).toBeInViewport();
    }
    const runbookLink = page.getByRole('link', { name: /View source s00[1-3]-r01/ }).first();
    await expect(runbookLink).toBeVisible();
    await expect(page.getByText('AI-authored example · No live request')).toBeVisible();
  }
  await expect(page.getByText('Whether the credential expired is unknown.')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (font) => font.family.replace(/['"]/g, '') === 'Matrix Sans' && font.status === 'loaded',
      ),
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});

test('public API refuses valid and forged paid-generation requests', async ({ request }) => {
  for (const data of [
    { scenarioId: 'scenario-001' },
    { scenarioId: 'scenario-001', enableLive: true },
  ]) {
    const response = await request.post('/api/generate', { data });
    expect(response.status()).toBe(403);
    expect((await response.json()).error.code).toBe('LIVE_DISABLED');
    expect(response.headers()['cache-control']).toContain('no-store');
  }
});

test('desktop workspace has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  for (const [category] of scenarios) {
    await page.getByRole('button', { name: new RegExp(category) }).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
    ).toEqual([]);
  }
});

test('all mobile scenarios fit the viewport and citations move focus with reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  );
  for (const [category, title] of scenarios) {
    await page.getByRole('button', { name: new RegExp(category) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const link = page.getByRole('link', { name: /View source / }).first();
    const target = (await link.getAttribute('href'))!.slice(1);
    await link.click();
    await expect(page.locator('[id="' + target + '"]')).toBeFocused();
    await expect(page.locator('[id="' + target + '"]')).toBeInViewport();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(
      results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
    ).toEqual([]);
  }
});

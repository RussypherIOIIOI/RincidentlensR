import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('credential-free recruiter journey across all scenarios and source references', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Checkout errors after a release',
  );
  await expect(page.getByRole('button', { name: 'Generate live report' })).toBeDisabled();
  for (const [category, title] of [
    ['Failed deployment', 'Checkout errors after a release'],
    ['Database outage', 'Connection slots under pressure'],
    ['Expired credential', 'Authentication fails. Expiry is unclear.'],
  ]) {
    await page.getByRole('button', { name: new RegExp(category) }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const citations = page.getByRole('link', { name: /View source / });
    const hrefs = await citations.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href')),
    );
    for (const href of new Set(hrefs)) {
      expect(href).toMatch(/^#evidence-s00[1-3]-[er]\d+$/);
      await expect(page.locator('[id="' + href!.slice(1) + '"]')).toHaveCount(1);
    }
    const first = citations.first();
    const target = (await first.getAttribute('href'))!.slice(1);
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[id="' + target + '"]')).toBeFocused();
    await expect(page.locator('[id="' + target + '"]')).toHaveAttribute('data-selected', 'true');
    const runbookLink = page.getByRole('link', { name: /View source s00[1-3]-r01/ }).first();
    const runbookTarget = (await runbookLink.getAttribute('href'))!.slice(1);
    await runbookLink.click();
    await expect(page.locator('[id="' + runbookTarget + '"]')).toBeFocused();
    await expect(page.getByText('AI-authored example · No live request')).toBeVisible();
  }
  await expect(page.getByText('Whether the credential expired is unknown.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('public API refuses paid generation even with forged client options', async ({ request }) => {
  const response = await request.post('/api/generate', {
    data: { scenarioId: 'scenario-001', enableLive: true },
  });
  expect(response.status()).toBe(403);
  expect((await response.json()).error.code).toBe('LIVE_DISABLED');
  expect(response.headers()['cache-control']).toContain('no-store');
});

test('desktop workspace has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  for (const category of ['Failed deployment', 'Database outage', 'Expired credential']) {
    await page.getByRole('button', { name: new RegExp(category) }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
    ).toEqual([]);
  }
});

test('mobile workspace fits the viewport and citations still move focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const link = page.getByRole('link', { name: 'View source s001-e03' }).first();
  await link.click();
  await expect(page.locator('#evidence-s001-e03')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
  ).toEqual([]);
});

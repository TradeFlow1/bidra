import { test, expect } from '@playwright/test';

async function expectNoHorizontalOverflow(page: any) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);
}

test.describe('Public marketplace smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/Bidra|Marketplace|Buy|Sell/i);
  });

  test('homepage has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
  });

  test('public marketplace routes are reachable', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/categories/i);
    await expectNoHorizontalOverflow(page);

    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/listings/i);
    await expectNoHorizontalOverflow(page);
  });
});

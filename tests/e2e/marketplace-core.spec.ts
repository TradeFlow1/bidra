import { test, expect } from '@playwright/test';

async function expectNoHorizontalOverflow(page: any) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasOverflow).toBe(false);
}

test.describe('Marketplace public journeys', () => {
  test('Buy Now listings page is public and renders correctly', async ({ page }) => {
    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/listings/i);
    await expectNoHorizontalOverflow(page);
  });

  test('category browsing page is public and renders correctly', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/categories/i);
    await expectNoHorizontalOverflow(page);
  });
});

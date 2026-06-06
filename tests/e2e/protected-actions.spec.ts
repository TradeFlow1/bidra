import { test, expect } from '@playwright/test';

test.describe('Protected marketplace actions', () => {
  test('guest cannot access create listing page', async ({ page }) => {
    await page.goto('/sell/new');
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fsell%2Fnew/i);
    await expect(page.locator('body')).toBeVisible();
  });
});

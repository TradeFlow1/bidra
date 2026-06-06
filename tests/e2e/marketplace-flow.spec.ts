import { test, expect } from '@playwright/test';

const listingTitle = process.env.BIDRA_TEST_LISTING_TITLE || '';

test.describe('Marketplace public seeded listing checks', () => {
  test('seeded listing is present in public Buy Now feed content', async ({ page }) => {
    test.skip(!listingTitle, 'Missing .env.test listing title');
    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/listings/i);
    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain(listingTitle);
  });
});

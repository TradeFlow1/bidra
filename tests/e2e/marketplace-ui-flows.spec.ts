import { test, expect } from '@playwright/test';

const listingTitle = process.env.BIDRA_TEST_LISTING_TITLE || '';

test.describe('Marketplace UI flow anchors', () => {
  test('create listing page redirects guests to login instead of exposing the form', async ({ page }) => {
    await page.goto('/sell/new');
    await expect(page).toHaveURL(/\/auth\/login/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('seeded public listing detail page loads from feed', async ({ page }) => {
    test.skip(!listingTitle, 'Missing seeded listing title');
    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toContainText(listingTitle);
    const detailLink = page.locator('a[href^="/listings/"]').filter({ hasText: listingTitle }).first();
    await expect(detailLink).toHaveCount(1);
    const href = await detailLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href || '/listings');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(listingTitle);
  });

  test('messages page redirects guests to login instead of exposing inbox', async ({ page }) => {
    await page.goto('/messages');
    await expect(page).toHaveURL(/\/auth\/login/i);
    await expect(page.locator('body')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers';

const buyerEmail = process.env.BIDRA_TEST_BUYER_EMAIL || '';
const password = process.env.BIDRA_TEST_PASSWORD || '';
const listingTitle = process.env.BIDRA_TEST_LISTING_TITLE || '';

test.describe('Authenticated marketplace browser flows', () => {
  test('buyer can open a seller message thread from a seeded listing and send a message', async ({ page }) => {
    test.skip(!buyerEmail || !password || !listingTitle, 'Missing buyer credentials or seeded listing title');

    await loginViaUi(page, buyerEmail, password);
    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toContainText(listingTitle);

    const detailLink = page.locator('a[href^="/listings/"]').filter({ hasText: listingTitle }).first();
    await expect(detailLink).toHaveCount(1);
    const href = await detailLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href || '/listings');
    await expect(page.locator('body')).toContainText(listingTitle);

    const messageButton = page.getByRole('button', { name: /message seller/i });
    await expect(messageButton).toBeVisible();
    await messageButton.click();

    await expect(page).toHaveURL(/\/messages\//i);
    await expect(page.locator('body')).toContainText(listingTitle);

    const text = 'E2E message check ' + Date.now();
    const box = page.getByLabel('Message text');
    await expect(box).toBeVisible();
    await box.fill(text);
    await page.getByRole('button', { name: /^send$/i }).click();

    await expect(page.locator('body')).toContainText(/Message sent|E2E message check/i);
  });
});

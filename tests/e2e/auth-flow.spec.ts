import { test, expect } from '@playwright/test';
import { loginViaUi } from './helpers';

const sellerEmail = process.env.BIDRA_TEST_SELLER_EMAIL || '';
const buyerEmail = process.env.BIDRA_TEST_BUYER_EMAIL || '';
const password = process.env.BIDRA_TEST_PASSWORD || '';
const listingTitle = process.env.BIDRA_TEST_LISTING_TITLE || '';

test.describe('Authenticated marketplace journeys', () => {
  test('seeded seller can log in and access create listing page', async ({ page }) => {
    test.skip(!sellerEmail || !password, 'Missing .env.test seller credentials');
    await loginViaUi(page, sellerEmail, password);
    await page.goto('/sell/new');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/\/auth\/login/i);
    await expect(page).toHaveURL(/\/sell\/new/i);
    await expect(page.locator('form, input, textarea, select, button').first()).toBeAttached();
  });

  test('seeded buyer can log in and see seeded listing feed content', async ({ page }) => {
    test.skip(!buyerEmail || !password || !listingTitle, 'Missing .env.test buyer/listing credentials');
    await loginViaUi(page, buyerEmail, password);
    await page.goto('/listings?type=BUY_NOW');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/listings/i);
    const pageText = await page.locator('body').innerText();
    expect(pageText).toContain(listingTitle);
  });
});

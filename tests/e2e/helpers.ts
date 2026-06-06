import { expect } from '@playwright/test';

export async function loginViaUi(page: any, email: string, password: string) {
  await page.goto('/auth/login');
  await expect(page.locator('body')).toBeVisible();
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  await expect(page).not.toHaveURL(/\/auth\/login/i);
}

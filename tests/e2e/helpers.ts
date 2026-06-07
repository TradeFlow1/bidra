import { expect } from '@playwright/test';

export async function loginViaUi(page: any, email: string, password: string) {
  if (process.env.BIDRA_TEST_AUTH_ENABLED === '1') {
    const response = await page.request.post('/api/e2e/auth/login', {
      data: { email },
    });
    expect(response.ok()).toBeTruthy();
    await page.goto('/');
    return;
  }

  await page.goto('/auth/login');
  await expect(page.locator('body')).toBeVisible();
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  await expect(page).not.toHaveURL(/\/auth\/login/i);
}

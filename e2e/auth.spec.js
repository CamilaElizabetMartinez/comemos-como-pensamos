import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /iniciar sesión|log in|login/i })
    ).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|log in|login/i })).toBeVisible();
  });

  test('shows validation when submitting empty login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /entrar|log in|login/i }).click();
    await expect(page.getByRole('alert').or(page.locator('.field-error'))).toBeVisible({
      timeout: 3000,
    });
  });
});

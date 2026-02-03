import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('loads and shows main navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/comemos|como|pensamos/i);
    await expect(page.getByRole('link', { name: /productos|products/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /inicio|home/i })).toBeVisible();
  });

  test('navigates to products from nav', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /productos|products/i }).first().click();
    await expect(page).toHaveURL(/\/(products|productos)/);
  });
});

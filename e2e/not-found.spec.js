import { test, expect } from '@playwright/test';

test.describe('404', () => {
  test('shows not found page for unknown route', async ({ page }) => {
    await page.goto('/ruta-inexistente-12345');
    await expect(
      page.getByRole('heading', { name: /404|página no encontrada|not found/i })
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /inicio|home|ir al inicio/i })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flows', () => {
  test.skip('Verify metrics render successfully', async ({ page }) => {
    await page.goto('/admin');
    
    // Check elements exist
    await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
    await expect(page.getByText("Today's Revenue")).toBeVisible();
    await expect(page.getByText("Pending Orders")).toBeVisible();
    await expect(page.getByText("Low Stock Alerts")).toBeVisible();
  });
});

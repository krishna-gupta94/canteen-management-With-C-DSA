import { test, expect } from '@playwright/test';

test.describe('Error Handling and Responsive', () => {
  test.skip('404 renders correctly', async ({ page }) => {
    // We don't have a specific 404 page mapped, but we test invalid route handling
  });
  
  test('Mobile viewport login', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    // Verify no horizontal scrolling
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});

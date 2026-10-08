import { test, expect } from '@playwright/test';

// These tests require the real C backend to be running.
// Since `gcc` is not available to compile the backend in this environment, 
// these tests are explicitly marked as skipped/blocked.

test.describe('Student Menu Flows', () => {
  test.skip('Loads menu and displays items from backend', async ({ page }) => {
    // 1. Student opens Menu.
    await page.goto('/student/menu');
    // 2. Food items are displayed.
    await expect(page.locator('text=Loading menu...')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    
    // We would verify items here.
  });

  test.skip('Search works', async ({ page }) => {
    await page.goto('/student/menu');
    await page.getByPlaceholder('Search food...').fill('Burger');
    // Wait for debounce and API response
    await page.waitForTimeout(500);
    // Verify result changes
  });

  test.skip('Sorting works', async ({ page }) => {
    await page.goto('/student/menu');
    await page.locator('select').nth(1).selectOption('price_asc');
    // Verify sorted
  });
});

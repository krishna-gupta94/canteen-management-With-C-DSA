import { test, expect } from '@playwright/test';

// These tests require the real C backend to be running.
test.describe('Cart and Order Flows', () => {
  test.skip('Add to cart and checkout', async ({ page }) => {
    // 1. Open Menu
    await page.goto('/student/menu');
    
    // 2. Add to Cart
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    
    // 3. Open Cart
    await page.goto('/student/cart');
    
    // 4. Verify item appears
    await expect(page.getByText('Total Amount')).toBeVisible();
    
    // 5. Checkout
    await page.getByRole('button', { name: 'Place Order' }).click();
    
    // 6. Verify order placed (redirect to tracking)
    await expect(page).toHaveURL(/\/student\/orders\/\d+/);
  });

  test.skip('Cart empty state', async ({ page }) => {
    await page.goto('/student/cart');
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });
});

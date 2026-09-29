import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  const testId = Date.now();
  const testEmail = `e2e_auth_test_${testId}@test.com`;
  const testPassword = 'password123';

  test('Student Registration and Login flow', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    
    await page.getByLabel('Full Name').fill('E2E Test User');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    
    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/student', { timeout: 10000 });
    await expect(page.getByText('Ready to grab a bite?')).toBeVisible();
  });

  test('Admin Unified Login flow', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    await page.getByLabel('Email Address').fill('admin@canteen.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForURL('**/admin', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
  });
});

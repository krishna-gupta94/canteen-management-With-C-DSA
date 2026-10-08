import { test, expect } from '@playwright/test';

test.describe('Cross-Role Synchronization', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedOrderId: string | null = null;

  test.beforeAll(async ({ request }) => {
    // Clear cart via API before test starts
    const loginRes = await request.post('http://localhost:8080/api/student/login', {
      data: { email: 'aarav.demo@canteen.local', password: 'demo_pass123' }
    });
    const { token } = await loginRes.json();
    await request.delete('http://localhost:8080/api/cart', {
      headers: { Authorization: 'Bearer ' + token }
    });
  });

  test('Student places an order', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    await studentPage.goto('/login');
    await studentPage.getByLabel('Email Address').fill('aarav.demo@canteen.local');
    await studentPage.getByLabel('Password').fill('demo_pass123');
    await studentPage.getByRole('button', { name: 'Sign In' }).click();
    await studentPage.waitForURL('**/student');

    await studentPage.getByRole('link', { name: 'Menu' }).click();
    
    studentPage.on('dialog', async dialog => {
        await dialog.accept();
    });
    
    const burgerCard = studentPage.locator('.bg-surface', { hasText: 'Veg Burger' }).first();
    await burgerCard.getByRole('button', { name: 'Add to Cart' }).click();
    
    await studentPage.waitForTimeout(1000); // Give dialog and api time

    await studentPage.getByRole('link', { name: 'Cart' }).click();
    
    await studentPage.waitForTimeout(1000); // Give cart time to load

    await studentPage.getByRole('button', { name: 'Place Order' }).click();
    await studentPage.waitForURL(/\/orders\/\d+/);

    await expect(studentPage.getByText('Order #').first()).toBeVisible();
    const orderText = await studentPage.getByText(/Order #\d+/).first().textContent();
    if (orderText) {
      sharedOrderId = orderText.replace(/Track Order #|Order #/, '').trim();
    }
    expect(sharedOrderId).toBeTruthy();

    await studentContext.close();
  });

  test('Admin processes the order', async ({ browser }) => {
    expect(sharedOrderId).not.toBeNull();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/login');
    await adminPage.getByLabel('Email Address').fill('admin.demo@canteen.local');
    await adminPage.getByLabel('Password').fill('demo_admin123');
    await adminPage.getByRole('button', { name: 'Sign In' }).click();
    await adminPage.waitForURL('**/admin');

    await adminPage.getByRole('link', { name: 'Orders' }).click();
    
    // Find the specific order
    const orderRow = adminPage.getByRole('row').filter({ hasText: '#' + sharedOrderId }).first();
    await expect(orderRow).toBeVisible();
    await expect(orderRow).toContainText('Pending');

    await orderRow.getByRole('button', { name: 'Prepare' }).click();
    await expect(orderRow).toContainText('Preparing');

    await orderRow.getByRole('button', { name: 'Mark Ready' }).click();
    await expect(orderRow).toContainText('Ready');
    await orderRow.getByRole('button', { name: 'Complete' }).click();
    await expect(orderRow).toContainText('Completed');

    await adminContext.close();
  });

  test('Student sees updated order status', async ({ browser }) => {
    expect(sharedOrderId).not.toBeNull();

    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    await studentPage.goto('/login');
    await studentPage.getByLabel('Email Address').fill('aarav.demo@canteen.local');
    await studentPage.getByLabel('Password').fill('demo_pass123');
    await studentPage.getByRole('button', { name: 'Sign In' }).click();
    await studentPage.waitForURL('**/student');

    await studentPage.goto('/student/orders');
    
    const orderCard = studentPage.locator('.bg-surface', { hasText: new RegExp('Order #' + sharedOrderId) });
    await expect(orderCard).toBeVisible();
    await expect(orderCard).toContainText('Completed');

    await studentContext.close();
  });
});

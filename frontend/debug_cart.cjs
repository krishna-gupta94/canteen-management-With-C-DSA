const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/login');
  await page.getByLabel('Email Address').fill('aarav.demo@canteen.local');
  await page.getByLabel('Password').fill('demo_pass123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/student');

  await page.getByRole('link', { name: 'Menu' }).click();
  
  page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
  });
  
  const burgerCard = page.locator('.bg-surface', { hasText: 'Veg Burger' }).first();
  await burgerCard.getByRole('button', { name: 'Add to Cart' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.waitForTimeout(1000);
  
  const content = await page.content();
  console.log(content);
  
  await browser.close();
})();

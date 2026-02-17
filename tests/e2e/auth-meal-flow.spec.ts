import { expect, test } from '@playwright/test';

test('user can register and log a meal', async ({ page }) => {
  const unique = Date.now();
  const email = `user-${unique}@example.com`;
  const username = `user_${unique}`;

  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByLabel('Password').fill('supersecure123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Summary')).toBeVisible();

  await page.getByRole('link', { name: 'Add' }).click();
  await expect(page).toHaveURL('/add');

  await page.getByRole('textbox', { name: 'Item Name' }).fill('Chicken Bowl');
  await page.locator('input[name="quantityValue"]').fill('250');
  await page.locator('input[name="calories"]').fill('540');
  await page.locator('input[name="protein"]').fill('42');
  await page.locator('input[name="carbs"]').fill('35');
  await page.locator('input[name="fat"]').fill('22');
  await page.getByRole('button', { name: 'Save meal entry' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.locator('#sum-eaten')).not.toHaveText('0 kcal');
});

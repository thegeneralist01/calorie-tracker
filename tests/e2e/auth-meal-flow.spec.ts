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

  await page.goto('/add');
  await expect(page).toHaveURL('/add');

  await page.getByRole('tab', { name: 'Product' }).click();
  await expect(page).toHaveURL('/add?tab=product');

  await page.getByRole('textbox', { name: 'Name' }).fill('Chicken Bowl');
  await page.getByRole('textbox', { name: 'Brand' }).fill('Test Kitchen');
  await page.locator('input[name="calories"]').fill('216');
  await page.locator('input[name="protein"]').fill('16.8');
  await page.locator('input[name="carbs"]').fill('14');
  await page.locator('input[name="fat"]').fill('8.8');
  await page.locator('input[name="referenceValue"]').fill('100');
  await page.locator('select[name="referenceUnit"]').selectOption('g');
  await page.getByRole('button', { name: 'Save local product' }).click();

  await expect(page).toHaveURL('/profile');

  await page.goto('/add?tab=meal');
  await expect(page).toHaveURL('/add?tab=meal');
  await expect(page.getByRole('tab', { name: 'Existing Meal' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Manual' })).toHaveAttribute('aria-selected', 'false');

  await page.locator('#product-search').fill('chkn b');
  const firstProductValue = await page.locator('#meal-product-select option').first().getAttribute('value');
  await page.locator('#meal-product-select').selectOption(firstProductValue ?? '');
  await page.locator('input[name="quantityValue"]').fill('250');
  await page.locator('select[name="quantityUnit"]').selectOption('g');
  await page.getByRole('button', { name: 'Save meal entry' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.locator('#sum-eaten')).not.toHaveText('0 kcal');

  await page.goto('/history');
  await expect(page).toHaveURL('/history');

  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Meal removed. Undo?')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Meal removed. Undo?')).toBeVisible();
  await page.waitForTimeout(5300);

  await expect(page.getByText('No entries for this day yet.')).toBeVisible();

  await page.goto('/profile');
  await expect(page).toHaveURL('/profile');

  await expect(page.getByRole('button', { name: 'Remove product' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove product' }).click();
  await expect(page.getByText('Product removed. Undo?')).toBeVisible();

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Remove product' })).toBeVisible();

  await page.getByRole('button', { name: 'Remove product' }).click();
  await expect(page.getByText('Product removed. Undo?')).toBeVisible();
  await page.waitForTimeout(5300);

  await expect(page.getByText('No products yet. Add one from the Product tab.')).toBeVisible();
});

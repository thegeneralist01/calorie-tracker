import { expect, test } from '@playwright/test';

test('user can log a manual meal entry', async ({ page }) => {
  const unique = Date.now();
  const email = `manual-${unique}@example.com`;
  const username = `manual_${unique}`;

  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByLabel('Password').fill('supersecure123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/');

  await page.goto('/add?tab=meal');
  await expect(page).toHaveURL('/add?tab=meal');

  await page.getByRole('tab', { name: 'Manual' }).click();
  await expect(page.getByRole('tab', { name: 'Manual' })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('textbox', { name: 'Name (optional)' }).fill('Homemade soup');
  await page.locator('#meal-manual-form input[name="quantityValue"]').fill('350');
  await page.locator('#meal-manual-form select[name="quantityUnit"]').selectOption('ml');
  await page.locator('#meal-manual-form input[name="calories"]').fill('260');
  await page.locator('#meal-manual-form input[name="protein"]').fill('12');
  await page.locator('#meal-manual-form input[name="carbs"]').fill('28');
  await page.locator('#meal-manual-form input[name="fat"]').fill('11');
  await page.locator('#meal-manual-form button[type="submit"]').click();

  await expect(page).toHaveURL('/');
  await expect(page.locator('#sum-eaten')).not.toHaveText('0 kcal');
});

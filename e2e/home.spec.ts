import { test, expect } from '@playwright/test';

test('homepage has CTA links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Formulare ansehen' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kontakt aufnehmen' })).toBeVisible();
});


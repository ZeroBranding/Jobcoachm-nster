import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Jobcoach Münster', () => {
  test('homepage loads and has no critical a11y issues', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForSelector('#consent-banner');
    // Accept essentials only
    await page.getByRole('button', { name: 'Nur essenziell' }).click();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = accessibilityScanResults.violations.filter(v => (v.impact === 'critical' || v.impact === 'serious'));
    expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
  });

  test('light-language variant via URL', async ({ page }) => {
    await page.goto('http://localhost:8080/?lang=leicht');
    await page.waitForSelector('#consent-banner');
    await page.getByRole('button', { name: 'Nur essenziell' }).click();
    const h1 = await page.locator('h1').textContent();
    expect(h1?.toLowerCase()).toContain('wir helfen');
  });
});


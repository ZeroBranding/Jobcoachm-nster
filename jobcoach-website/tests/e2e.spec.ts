import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('JobCoach E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for 3D animations to load
    await page.waitForTimeout(2000)
  })

  test('Complete application flow with accessibility', async ({ page }) => {
    // Skip intro if present
    const skipButton = page.locator('[data-testid="skip-intro"]')
    if (await skipButton.isVisible()) {
      await skipButton.click()
    }

    // Test accessibility on homepage
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(accessibilityScanResults.violations).toEqual([])

    // Navigate to ALG service
    await page.getByRole('link', { name: /ALG/i }).click()
    await expect(page).toHaveURL('/services/alg')

    // Fill out form
    await page.fill('[name="firstName"]', 'Max')
    await page.fill('[name="lastName"]', 'Mustermann')
    await page.fill('[name="email"]', 'max@example.com')
    await page.fill('[name="phone"]', '+49123456789')
    await page.fill('[name="dateOfBirth"]', '1990-01-01')
    
    // Address
    await page.fill('[name="street"]', 'Musterstraße')
    await page.fill('[name="houseNumber"]', '123')
    await page.fill('[name="postalCode"]', '12345')
    await page.fill('[name="city"]', 'Berlin')
    
    // Employment info
    await page.fill('[name="lastEmployer"]', 'Musterfirma GmbH')
    await page.fill('[name="employmentEnd"]', '2024-01-01')
    await page.fill('[name="reasonForTermination"]', 'Betriebsbedingte Kündigung')
    await page.fill('[name="monthlyIncome"]', '3000')
    
    // Bank info
    await page.fill('[name="iban"]', 'DE89370400440532013000')
    await page.fill('[name="bic"]', 'COBADEFFXXX')

    // Digital signature
    const canvas = page.locator('canvas[data-testid="signature-pad"]')
    const box = await canvas.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * 3/4, box.y + box.height / 2)
      await page.mouse.up()
    }

    // GDPR consent
    await page.check('[name="gdprConsent"]')
    
    // Submit form
    await page.getByRole('button', { name: /Antrag einreichen/i }).click()
    
    // Check success message
    await expect(page.locator('[role="alert"]')).toContainText(/erfolgreich/i)
  })

  test('Form validation errors', async ({ page }) => {
    await page.goto('/services/alg')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /Antrag einreichen/i }).click()
    
    // Check for validation errors
    await expect(page.locator('.text-red-400')).toHaveCount(13, { timeout: 5000 })
    
    // Check specific error messages
    await expect(page.locator('text=/Vorname muss mindestens/')).toBeVisible()
    await expect(page.locator('text=/Nachname muss mindestens/')).toBeVisible()
    await expect(page.locator('text=/Ungültige E-Mail/')).toBeVisible()
  })

  test('File upload functionality', async ({ page }) => {
    await page.goto('/services/alg')
    
    // Create test file
    const buffer = Buffer.from('Test PDF content')
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: buffer
    })
    
    // Verify file was uploaded
    await expect(page.locator('[data-testid="uploaded-file"]')).toContainText('test.pdf')
  })

  test('WhatsApp opt-in flow', async ({ page }) => {
    await page.goto('/services/alg')
    
    // Click WhatsApp button
    await page.getByRole('button', { name: /WhatsApp/i }).click()
    
    // Check modal appears
    await expect(page.locator('[data-testid="whatsapp-modal"]')).toBeVisible()
    
    // Accept opt-in
    await page.check('[data-testid="whatsapp-consent"]')
    await page.getByRole('button', { name: /Weiter zu WhatsApp/i }).click()
    
    // Verify WhatsApp link opens (we can't follow external links in tests)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('[data-testid="whatsapp-link"]').click()
    ])
    expect(newPage.url()).toContain('wa.me')
  })

  test('3D animations with reduced motion', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    
    // Check that fallback is used
    await expect(page.locator('[data-testid="3d-fallback"]')).toBeVisible()
    await expect(page.locator('canvas')).not.toBeVisible()
  })

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'skip-to-content')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveText(/Home/i)
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveText(/ALG/i)
    
    // Activate with Enter
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/services/alg')
  })

  test('Screen reader announcements', async ({ page }) => {
    await page.goto('/services/alg')
    
    // Fill invalid email
    await page.fill('[name="email"]', 'invalid')
    await page.keyboard.press('Tab')
    
    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toContainText(/Ungültige E-Mail/)
  })

  test('Cross-browser compatibility', async ({ browserName, page }) => {
    await page.goto('/')
    
    // Check that main elements are visible
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    
    // Log browser for debugging
    console.log(`Testing on ${browserName}`)
    
    // Browser-specific checks
    if (browserName === 'webkit') {
      // Safari-specific checks
      await expect(page.locator('.glass-effect')).toHaveCSS('backdrop-filter', /blur/)
    }
  })
})
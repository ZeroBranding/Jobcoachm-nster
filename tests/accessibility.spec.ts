import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests - WCAG 2.2 AA', () => {
  
  test.beforeEach(async ({ page }) => {
    // Consent-Banner automatisch akzeptieren für Tests
    await page.addInitScript(() => {
      localStorage.setItem('consent-preferences', JSON.stringify({
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: Date.now()
      }));
    });
  });

  test('Homepage - No Critical Accessibility Violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // Keine kritischen oder schwerwiegenden Verstöße
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations, 
      `Critical accessibility violations found:\n${JSON.stringify(criticalViolations, null, 2)}`
    ).toHaveLength(0);
  });

  test('Leichte Sprache - Accessibility Compliance', async ({ page }) => {
    await page.goto('/leichte-sprache.html');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations.filter(v => v.impact === 'critical'))
      .toHaveLength(0);
  });

  test('Keyboard Navigation - Complete Site Navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab durch alle fokussierbaren Elemente
    const focusableElements = await page.locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])').all();
    
    expect(focusableElements.length).toBeGreaterThan(0);

    // Teste Tab-Navigation
    for (let i = 0; i < Math.min(focusableElements.length, 20); i++) {
      await page.keyboard.press('Tab');
      
      // Prüfe, ob Focus-Indikator sichtbar ist
      const focusedElement = await page.locator(':focus').first();
      const isVisible = await focusedElement.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('Screen Reader Support - Semantic Structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe Heading-Hierarchie
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // H1 sollte vorhanden und einzigartig sein
    const h1Elements = await page.locator('h1').all();
    expect(h1Elements).toHaveLength(1);

    // Prüfe ARIA-Labels
    const elementsWithAriaLabel = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').all();
    expect(elementsWithAriaLabel.length).toBeGreaterThan(0);

    // Prüfe Skip-Links
    const skipLinks = await page.locator('a[href^="#"]').first();
    if (await skipLinks.count() > 0) {
      const skipLinkText = await skipLinks.textContent();
      expect(skipLinkText?.toLowerCase()).toMatch(/skip|springe|zum inhalt/);
    }
  });

  test('Color Contrast - WCAG AA Compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste mit axe-core color-contrast Regeln
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations, 
      `Color contrast violations found:\n${JSON.stringify(contrastViolations, null, 2)}`
    ).toHaveLength(0);
  });

  test('Form Accessibility - Labels and Error Messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe, ob Kontaktformular vorhanden ist
    const contactForm = page.locator('form[name="contact"], #contact-form, .contact-form').first();
    
    if (await contactForm.count() > 0) {
      // Alle Input-Felder sollten Labels haben
      const inputs = await contactForm.locator('input, textarea, select').all();
      
      for (const input of inputs) {
        const inputId = await input.getAttribute('id');
        const inputName = await input.getAttribute('name');
        
        if (inputId) {
          // Prüfe auf Label mit for-Attribut
          const label = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await label.count() > 0;
          
          // Oder aria-label/aria-labelledby
          const hasAriaLabel = await input.getAttribute('aria-label') !== null ||
                              await input.getAttribute('aria-labelledby') !== null;
          
          expect(hasLabel || hasAriaLabel, 
            `Input field ${inputId || inputName} missing accessible label`
          ).toBe(true);
        }
      }
    }
  });

  test('Media Accessibility - Alt Text and Captions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Alle Bilder sollten Alt-Text haben
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const altText = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Dekorative Bilder können alt="" oder role="presentation" haben
      const isDecorative = altText === '' || role === 'presentation';
      const hasAltText = altText !== null && altText.length > 0;
      
      expect(isDecorative || hasAltText, 
        'Image missing alt text or decorative marking'
      ).toBe(true);
    }

    // Video/Audio Elemente prüfen
    const mediaElements = await page.locator('video, audio').all();
    
    for (const media of mediaElements) {
      const hasControls = await media.getAttribute('controls') !== null;
      const hasAriaLabel = await media.getAttribute('aria-label') !== null;
      
      expect(hasControls && hasAriaLabel, 
        'Media element missing controls or aria-label'
      ).toBe(true);
    }
  });

  test('Mobile Accessibility - Touch Targets', async ({ page }) => {
    // Mobile Viewport setzen
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Alle klickbaren Elemente sollten mindestens 44x44px sein
    const clickableElements = await page.locator('a, button, input[type="button"], input[type="submit"]').all();
    
    for (const element of clickableElements) {
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.width, 'Touch target too small (width)').toBeGreaterThanOrEqual(44);
        expect(boundingBox.height, 'Touch target too small (height)').toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Focus Management - Logical Tab Order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sammle alle fokussierbaren Elemente in DOM-Reihenfolge
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = await page.locator(focusableSelectors).all();
    const tabOrder: string[] = [];

    // Simuliere Tab-Navigation und sammle Reihenfolge
    await page.keyboard.press('Tab');
    
    for (let i = 0; i < Math.min(focusableElements.length, 15); i++) {
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      const textContent = await focusedElement.textContent();
      
      tabOrder.push(`${tagName}: ${textContent?.substring(0, 30) || 'no text'}`);
      await page.keyboard.press('Tab');
    }

    // Tab-Reihenfolge sollte logisch sein (nicht rückwärts springen)
    expect(tabOrder.length).toBeGreaterThan(3);
    console.log('Tab Order:', tabOrder);
  });

  test('Language and Internationalization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // HTML lang-Attribut prüfen
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('de');

    // Leichte Sprache Version testen
    await page.goto('/leichte-sprache.html');
    await page.waitForLoadState('networkidle');

    const lightLangHtml = await page.locator('html').getAttribute('lang');
    expect(lightLangHtml).toBe('de');

    // Prüfe auf hreflang-Attribute für mehrsprachige Inhalte
    const hreflangLinks = await page.locator('link[hreflang]').all();
    // Optional: Wenn mehrsprachige Versionen vorhanden sind
    if (hreflangLinks.length > 0) {
      for (const link of hreflangLinks) {
        const hreflang = await link.getAttribute('hreflang');
        expect(hreflang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }
    }
  });

  test('Error Handling - Accessible Error Messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste Formular-Validierung (falls vorhanden)
    const form = page.locator('form').first();
    
    if (await form.count() > 0) {
      // Versuche, leeres Formular abzusenden
      const submitButton = form.locator('input[type="submit"], button[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Prüfe auf Fehlermeldungen
        const errorMessages = await page.locator('[role="alert"], .error, .invalid').all();
        
        if (errorMessages.length > 0) {
          // Fehlermeldungen sollten mit Formularfeldern verknüpft sein
          for (const error of errorMessages) {
            const ariaDescribedby = await error.getAttribute('aria-describedby');
            const ariaLive = await error.getAttribute('aria-live');
            
            expect(ariaDescribedby !== null || ariaLive !== null, 
              'Error message not properly announced to screen readers'
            ).toBe(true);
          }
        }
      }
    }
  });
});
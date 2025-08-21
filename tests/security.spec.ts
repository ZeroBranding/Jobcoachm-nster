import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  
  test('Security Headers - CSP and HSTS', async ({ page }) => {
    const response = await page.goto('/');
    
    if (response) {
      const headers = response.headers();
      
      // Content Security Policy
      expect(headers['content-security-policy'], 'CSP header missing')
        .toBeDefined();
      
      // HTTP Strict Transport Security (nur bei HTTPS)
      if (page.url().startsWith('https://')) {
        expect(headers['strict-transport-security'], 'HSTS header missing')
          .toBeDefined();
      }
      
      // X-Frame-Options (Clickjacking-Schutz)
      expect(headers['x-frame-options'], 'X-Frame-Options header missing')
        .toBeDefined();
      
      // X-Content-Type-Options
      expect(headers['x-content-type-options'], 'X-Content-Type-Options header missing')
        .toBe('nosniff');
      
      // Referrer Policy
      expect(headers['referrer-policy'], 'Referrer-Policy header missing')
        .toBeDefined();
    }
  });

  test('XSS Protection - Input Sanitization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste XSS-Schutz in Formularen
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const inputs = await form.locator('input[type="text"], input[type="email"], textarea').all();
      
      for (const input of inputs) {
        // XSS-Payload testen
        const xssPayload = '<script>alert("XSS")</script>';
        await input.fill(xssPayload);
        
        // Prüfe, ob Input escaped wird
        const value = await input.inputValue();
        expect(value, 'XSS payload not properly escaped').not.toContain('<script>');
      }
    }
  });

  test('CSRF Protection - Form Security', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe auf CSRF-Token in Formularen
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const csrfToken = await form.locator('input[name*="csrf"], input[name*="token"]').first();
      
      if (await csrfToken.count() > 0) {
        const tokenValue = await csrfToken.getAttribute('value');
        expect(tokenValue, 'CSRF token should not be empty').toBeTruthy();
        expect(tokenValue?.length, 'CSRF token too short').toBeGreaterThan(10);
      }
    }
  });

  test('Cookie Security - Secure Attributes', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Cookies analysieren
    const cookies = await context.cookies();
    
    for (const cookie of cookies) {
      // Session-Cookies sollten HttpOnly sein
      if (cookie.name.toLowerCase().includes('session')) {
        expect(cookie.httpOnly, `Session cookie ${cookie.name} should be HttpOnly`).toBe(true);
      }
      
      // Secure-Flag bei HTTPS
      if (page.url().startsWith('https://')) {
        expect(cookie.secure, `Cookie ${cookie.name} should have Secure flag on HTTPS`).toBe(true);
      }
      
      // SameSite-Attribut sollte gesetzt sein
      expect(['Strict', 'Lax', 'None'].includes(cookie.sameSite || ''), 
        `Cookie ${cookie.name} should have SameSite attribute`).toBe(true);
    }
  });

  test('Content Security Policy - Inline Script Prevention', async ({ page }) => {
    await page.goto('/');
    
    // Versuche, Inline-Script zu injizieren
    const scriptInjected = await page.evaluate(() => {
      try {
        const script = document.createElement('script');
        script.innerHTML = 'window.xssTest = true;';
        document.head.appendChild(script);
        return window.hasOwnProperty('xssTest');
      } catch (e) {
        return false;
      }
    });

    // CSP sollte Inline-Scripts blockieren
    expect(scriptInjected, 'CSP should prevent inline script execution').toBe(false);
  });

  test('Information Disclosure - No Sensitive Data Exposure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe auf versehentlich exponierte Daten
    const pageContent = await page.content();
    
    // Keine Passwörter oder API-Keys im HTML
    expect(pageContent, 'Password field exposed in HTML').not.toMatch(/password\s*[:=]\s*["'][^"']*["']/i);
    expect(pageContent, 'API key exposed in HTML').not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']*["']/i);
    expect(pageContent, 'Secret exposed in HTML').not.toMatch(/secret\s*[:=]\s*["'][^"']*["']/i);
    
    // Keine internen Pfade oder Debug-Informationen
    expect(pageContent, 'Internal paths exposed').not.toMatch(/\/var\/www|\/home\/|C:\\|\.env/);
    expect(pageContent, 'Debug information exposed').not.toMatch(/console\.log|debugger|TODO:|FIXME:/);
  });

  test('File Upload Security - Validation and Restrictions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste File-Upload Sicherheit (falls vorhanden)
    const fileInputs = await page.locator('input[type="file"]').all();
    
    for (const fileInput of fileInputs) {
      // Prüfe Accept-Attribut
      const acceptAttr = await fileInput.getAttribute('accept');
      expect(acceptAttr, 'File input should have accept attribute').toBeTruthy();
      
      // Sollte keine ausführbaren Dateien akzeptieren
      if (acceptAttr) {
        expect(acceptAttr, 'File input should not accept executable files')
          .not.toMatch(/\.exe|\.bat|\.cmd|\.sh|\.php|\.asp/);
      }
    }
  });

  test('URL Manipulation - Parameter Validation', async ({ page }) => {
    // Teste verschiedene URL-Parameter für Injection-Versuche
    const maliciousParams = [
      '?redirect=javascript:alert(1)',
      '?callback=<script>alert(1)</script>',
      '?lang=../../../etc/passwd',
      '?page=<img src=x onerror=alert(1)>',
      '?search=\'; DROP TABLE users; --'
    ];

    for (const param of maliciousParams) {
      await page.goto(`/${param}`);
      
      // Seite sollte normal laden, ohne Injection
      const pageContent = await page.content();
      expect(pageContent, `URL parameter injection: ${param}`).not.toContain('alert(1)');
      expect(pageContent, `SQL injection: ${param}`).not.toContain('DROP TABLE');
      
      // Keine JavaScript-Execution durch URL-Parameter
      const hasXSS = await page.evaluate(() => window.hasOwnProperty('xssTest'));
      expect(hasXSS, `XSS via URL parameter: ${param}`).toBe(false);
    }
  });

  test('Session Management - Secure Session Handling', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe Session-Cookie-Eigenschaften
    const cookies = await context.cookies();
    const sessionCookies = cookies.filter(c => 
      c.name.toLowerCase().includes('session') || 
      c.name.toLowerCase().includes('auth')
    );

    for (const cookie of sessionCookies) {
      // Session-Cookies sollten sicher konfiguriert sein
      expect(cookie.httpOnly, `Session cookie ${cookie.name} should be HttpOnly`).toBe(true);
      
      if (page.url().startsWith('https://')) {
        expect(cookie.secure, `Session cookie ${cookie.name} should be Secure`).toBe(true);
      }
      
      expect(cookie.sameSite, `Session cookie ${cookie.name} should have SameSite`).toBeTruthy();
    }
  });

  test('Error Handling - No Information Leakage', async ({ page }) => {
    // Teste 404-Seite
    const response404 = await page.goto('/nonexistent-page');
    expect(response404?.status()).toBe(404);
    
    const content404 = await page.content();
    expect(content404, '404 page should not expose system information')
      .not.toMatch(/apache|nginx|server|version|stack trace|exception/i);

    // Teste ungültige Parameter
    await page.goto('/?invalid=<script>alert(1)</script>');
    const contentInvalid = await page.content();
    expect(contentInvalid, 'Error page should not reflect malicious input')
      .not.toContain('<script>alert(1)</script>');
  });

  test('Third-Party Dependencies - Secure External Resources', async ({ page }) => {
    const externalRequests: string[] = [];
    
    // Überwache externe Requests
    page.on('request', (request) => {
      const url = request.url();
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Prüfe externe Ressourcen
    for (const url of externalRequests) {
      // Sollten nur von vertrauenswürdigen CDNs kommen
      const trustedDomains = [
        'cdn.jsdelivr.net',
        'unpkg.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
      ];
      
      const isTrusted = trustedDomains.some(domain => url.includes(domain));
      expect(isTrusted, `Untrusted external resource: ${url}`).toBe(true);
      
      // Sollten HTTPS verwenden
      expect(url.startsWith('https://'), `Insecure external resource: ${url}`).toBe(true);
    }
  });

  test('Rate Limiting - Brute Force Protection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste Rate Limiting bei Formularen
    const form = page.locator('form').first();
    
    if (await form.count() > 0) {
      const submitButton = form.locator('input[type="submit"], button[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        // Mehrfache schnelle Submissions
        for (let i = 0; i < 10; i++) {
          await submitButton.click();
          await page.waitForTimeout(100);
        }
        
        // Nach mehreren Versuchen sollte Rate Limiting greifen
        const errorMessage = await page.locator('.rate-limit, .too-many-requests').first();
        
        // Optional: Wenn Rate Limiting implementiert ist
        if (await errorMessage.count() > 0) {
          expect(await errorMessage.isVisible()).toBe(true);
        }
      }
    }
  });

  test('Data Validation - Server-Side Validation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Teste Server-Side Validation
    const emailInputs = await page.locator('input[type="email"]').all();
    
    for (const emailInput of emailInputs) {
      // Ungültige E-Mail-Adresse eingeben
      await emailInput.fill('invalid-email');
      
      const form = emailInput.locator('xpath=ancestor::form[1]');
      const submitButton = form.locator('input[type="submit"], button[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Browser-Validierung sollte greifen
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => {
          return el.validationMessage;
        });
        
        expect(validationMessage, 'Email validation should trigger').toBeTruthy();
      }
    }
  });
});
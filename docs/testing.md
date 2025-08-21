# Testing Documentation - JobCoach Münster

Umfassende Dokumentation der Test-Strategie und -Implementierung für die JobCoach-Website.

## 📋 Inhaltsverzeichnis

- [Test-Strategie](#-test-strategie)
- [Test-Kategorien](#-test-kategorien)
- [Setup und Ausführung](#-setup-und-ausführung)
- [Test-Umgebungen](#-test-umgebungen)
- [Continuous Testing](#-continuous-testing)
- [Reporting](#-reporting)
- [Best Practices](#-best-practices)

## 🎯 Test-Strategie

### Pyramiden-Ansatz
```
         /\
        /  \     E2E Tests (10%)
       /____\    Integration Tests (20%)
      /      \   Unit Tests (70%)
     /________\
```

### Test-Ziele
1. **Funktionalität**: Alle Features arbeiten korrekt
2. **Barrierefreiheit**: WCAG 2.2 AA Konformität
3. **Performance**: Core Web Vitals unter Grenzwerten
4. **Sicherheit**: Schutz vor bekannten Vulnerabilities
5. **Kompatibilität**: Funktioniert in allen Ziel-Browsern
6. **Compliance**: DSGVO und rechtliche Anforderungen

## 🧪 Test-Kategorien

### 1. Unit Tests
**Zweck**: Testen einzelner Funktionen und Module

```bash
# Ausführung
npm run test:unit

# Mit Coverage
npm run test:coverage
```

**Abgedeckte Bereiche**:
- JavaScript-Funktionen in `assets/app.js`
- 3D-Effekte in `assets/3d.js`
- Utility-Funktionen
- Cookie-Management
- Form-Validation

### 2. Integration Tests
**Zweck**: Testen des Zusammenspiels verschiedener Komponenten

```bash
# Ausführung
npm run test:integration
```

**Abgedeckte Bereiche**:
- Formular-Submission
- Cookie-Banner Integration
- 3D-Effekte mit Performance
- Responsive Design
- Dark Mode Toggle

### 3. End-to-End Tests
**Zweck**: Vollständige User Journeys testen

```bash
# Alle Browser
npm run test:e2e

# Spezifischer Browser
npx playwright test --project=chromium
```

**Test-Szenarien**:
- Homepage-Navigation
- Kontaktformular-Nutzung
- Cookie-Einstellungen
- Leichte Sprache Wechsel
- Mobile Navigation

### 4. Accessibility Tests
**Zweck**: WCAG 2.2 AA Konformität sicherstellen

```bash
# Accessibility-Tests
npm run test:a11y

# Mit detailliertem Report
npm run test:a11y -- --reporter=html
```

**Geprüfte Aspekte**:
- Keyboard-Navigation
- Screen Reader Support
- Color-Contrast
- Focus Management
- ARIA-Attributes
- Semantic HTML

### 5. Performance Tests
**Zweck**: Core Web Vitals und Performance-Metriken

```bash
# Performance-Tests
npm run test:perf

# Lighthouse-Audit
npx lighthouse https://jobcoach-muenster.de --view
```

**Gemessene Metriken**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 600ms

### 6. Security Tests
**Zweck**: Sicherheitslücken identifizieren und beheben

```bash
# Security-Tests
npm run test:security

# Vulnerability-Scan
npm audit --audit-level=high
```

**Geprüfte Bereiche**:
- XSS-Protection
- CSRF-Protection
- Security Headers
- Input Validation
- Cookie Security
- SSL/TLS Configuration

## 🛠️ Setup und Ausführung

### Lokale Test-Umgebung
```bash
# Dependencies installieren
npm install

# Playwright Browser installieren
npx playwright install

# Test-Server starten
npm run dev

# Tests in separatem Terminal
npm test
```

### Test-Konfiguration

#### Playwright Config (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🌍 Test-Umgebungen

### 1. Lokale Entwicklung
```bash
# Standard-Setup
npm run dev
npm test

# Mit Hot-Reload
npm run test:watch
```

### 2. Staging-Umgebung
```bash
# Staging-Deployment
vercel --target staging

# Tests gegen Staging
SITE_URL="https://jobcoach-muenster-staging.vercel.app" npm run test:e2e
```

### 3. Production Testing
```bash
# Production-Tests (nach Deployment)
SITE_URL="https://jobcoach-muenster.de" npm run test:production
```

## 🔄 Continuous Testing

### GitHub Actions Integration
Tests werden automatisch ausgeführt bei:
- **Push** auf `main` oder `develop`
- **Pull Requests**
- **Scheduled** (täglich um 2:00 UTC)

### Test-Pipeline
1. **Lint & Code Quality**
2. **Unit Tests**
3. **Integration Tests**
4. **Security Scan**
5. **Build Test**
6. **E2E Tests** (parallel auf mehreren Browsern)
7. **Accessibility Tests**
8. **Performance Tests**

### Fehler-Behandlung
```yaml
# In .github/workflows/ci.yml
- name: Upload Test Results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results
    path: test-results/
```

## 📊 Reporting

### Test-Reports
```bash
# HTML-Report generieren
npm run test:e2e -- --reporter=html

# Report öffnen
open test-results/index.html
```

### Coverage-Reports
```bash
# Coverage mit Istanbul
npm run test:coverage

# Report anzeigen
open coverage/index.html
```

### Performance-Reports
```bash
# Lighthouse-Report
npx lighthouse https://jobcoach-muenster.de \
  --output=html \
  --output-path=./reports/lighthouse.html \
  --view
```

### Accessibility-Reports
```bash
# axe-core Report
npm run test:a11y -- --reporter=html

# Pa11y-Report (alternativ)
npx pa11y https://jobcoach-muenster.de --reporter html > reports/a11y.html
```

## 🎯 Test-Szenarien

### User Journey Tests

#### 1. Erstbesucher-Journey
```typescript
test('Erstbesucher kann Informationen finden und Kontakt aufnehmen', async ({ page }) => {
  // 1. Homepage besuchen
  await page.goto('/');
  
  // 2. Cookie-Banner handhaben
  await page.getByRole('button', { name: 'Nur essenziell' }).click();
  
  // 3. Navigation testen
  await page.getByRole('link', { name: 'Bürgergeld' }).click();
  
  // 4. Kontaktformular ausfüllen
  await page.getByRole('link', { name: 'Kontakt' }).click();
  await page.fill('[name="name"]', 'Max Mustermann');
  await page.fill('[name="email"]', 'max@example.com');
  await page.fill('[name="message"]', 'Ich benötige Hilfe bei meinem Bürgergeld-Antrag.');
  
  // 5. Absenden
  await page.getByRole('button', { name: 'Nachricht senden' }).click();
  
  // 6. Bestätigung prüfen
  await expect(page.getByText('Vielen Dank')).toBeVisible();
});
```

#### 2. Barrierefreiheits-Journey
```typescript
test('Nutzer mit Sehbeeinträchtigung kann Website vollständig nutzen', async ({ page }) => {
  // Screen Reader Simulation
  await page.goto('/');
  
  // Nur Keyboard-Navigation
  await page.keyboard.press('Tab'); // Skip-Link
  await page.keyboard.press('Enter');
  
  // Hauptinhalt sollte fokussiert sein
  const mainContent = page.locator('main, [role="main"]');
  await expect(mainContent).toBeFocused();
  
  // Navigation per Tab
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  }
});
```

### Browser-Kompatibilität
```typescript
// Tests für verschiedene Browser-Features
test.describe('Browser Compatibility', () => {
  test('Works without JavaScript', async ({ page, context }) => {
    await context.addInitScript(() => {
      delete (window as any).JavaScript;
    });
    
    await page.goto('/');
    
    // Grundfunktionen sollten verfügbar sein
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
  
  test('Works on older browsers', async ({ page }) => {
    // Simuliere ältere Browser-Features
    await page.addInitScript(() => {
      delete (window as any).fetch;
      delete (window as any).Promise;
    });
    
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
```

## 📱 Mobile Testing

### Responsive Design Tests
```typescript
test.describe('Mobile Responsiveness', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  for (const device of devices) {
    test(`Layout on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');
      
      // Navigation sollte angepasst sein
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Formulare sollten nutzbar sein
      const contactForm = page.locator('form');
      if (await contactForm.count() > 0) {
        await expect(contactForm).toBeVisible();
      }
    });
  }
});
```

## 🚀 Test-Automatisierung

### Pre-Commit Hooks
```bash
# Husky installieren
npm install --save-dev husky

# Pre-commit Hook einrichten
npx husky add .husky/pre-commit "npm run lint && npm run test:unit"

# Pre-push Hook
npx husky add .husky/pre-push "npm run test:e2e"
```

### Test-Daten Management
```typescript
// Test-Fixtures
export const testData = {
  validUser: {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    phone: '+49 251 123456'
  },
  invalidUser: {
    name: '',
    email: 'invalid-email',
    phone: 'invalid-phone'
  }
};
```

## 🐛 Debugging Tests

### Test-Debugging
```bash
# Tests im Debug-Modus
npm run test:debug

# Spezifischen Test debuggen
npx playwright test tests/e2e.spec.ts --debug

# Mit Browser-UI
npx playwright test --ui
```

### Screenshot-Debugging
```typescript
// In Tests
await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

// Bei Fehlern automatisch
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ 
      path: `test-results/failure-${testInfo.title}.png`,
      fullPage: true 
    });
  }
});
```

## 📈 Test-Metriken

### Erfolgs-Kriterien
- **Test-Coverage**: > 80%
- **Pass-Rate**: > 95%
- **Performance**: Alle Tests < 30s
- **Accessibility**: 0 kritische Verstöße
- **Security**: 0 High/Critical Vulnerabilities

### Monitoring
```bash
# Test-Metriken sammeln
npm test -- --reporter=json > test-metrics.json

# Coverage-Report
npm run test:coverage -- --reporter=json-summary > coverage-summary.json
```

## 🔧 Test-Tools

### Verwendete Tools
- **Playwright**: E2E und Integration Tests
- **axe-core**: Accessibility Testing
- **Lighthouse**: Performance und SEO
- **ESLint**: Code Quality
- **Stylelint**: CSS Quality
- **html-validate**: HTML Validation

### Tool-Konfiguration

#### ESLint (`.eslintrc.js`)
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error'
  }
};
```

#### Stylelint (`.stylelintrc.json`)
```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-no-invalid-hex": true,
    "font-family-no-duplicate-names": true,
    "function-calc-no-unspaced-operator": true,
    "property-no-unknown": true,
    "selector-pseudo-class-no-unknown": true
  }
}
```

## 🚀 CI/CD Integration

### GitHub Actions
Tests werden automatisch in der CI/CD-Pipeline ausgeführt:

```yaml
# Beispiel aus .github/workflows/ci.yml
- name: Run Tests
  run: |
    npm run test:lint
    npm run test:unit
    npm run test:integration
    npm run test:e2e
    npm run test:a11y
    npm run test:perf
    npm run test:security
```

### Test-Parallelisierung
```bash
# Parallele Test-Ausführung
npx playwright test --workers=4

# Sharding für große Test-Suites
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

## 📊 Test-Reports

### HTML-Reports
```bash
# Generiere HTML-Report
npm run test:e2e -- --reporter=html

# Report öffnen
open test-results/index.html
```

### JSON-Reports für CI/CD
```bash
# JSON-Output für weitere Verarbeitung
npm run test:e2e -- --reporter=json > test-results.json
```

### Custom Reporter
```typescript
// custom-reporter.ts
class CustomReporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      console.log(`❌ ${test.title}: ${result.error?.message}`);
    } else {
      console.log(`✅ ${test.title}: ${result.duration}ms`);
    }
  }
}
```

## 🎯 Test-Best-Practices

### 1. Test-Struktur
```typescript
test.describe('Feature Group', () => {
  test.beforeEach(async ({ page }) => {
    // Setup für alle Tests
    await page.goto('/');
  });
  
  test('should do something specific', async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="target"]');
    
    // Act
    await element.click();
    
    // Assert
    await expect(element).toHaveClass('active');
  });
});
```

### 2. Selektoren-Strategie
```typescript
// Priorität der Selektoren:
// 1. data-testid (beste Stabilität)
page.locator('[data-testid="contact-form"]')

// 2. Semantic Role
page.getByRole('button', { name: 'Senden' })

// 3. Label/Text
page.getByLabel('E-Mail-Adresse')

// 4. CSS-Selektoren (vermeiden)
page.locator('.btn-primary') // Schlecht: kann sich ändern
```

### 3. Warten-Strategien
```typescript
// Warte auf Element
await page.waitForSelector('[data-testid="result"]');

// Warte auf Netzwerk
await page.waitForLoadState('networkidle');

// Warte auf Response
await page.waitForResponse('**/api/contact');

// Custom Wait
await page.waitForFunction(() => window.appReady === true);
```

### 4. Test-Daten
```typescript
// Externe Test-Daten
import { testUsers } from './fixtures/users.json';

// Factory Pattern
const createTestUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

## 🔍 Debugging und Troubleshooting

### Häufige Probleme

#### 1. Tests sind flaky
```typescript
// Lösung: Explizite Waits
await page.waitForSelector('[data-testid="element"]', { state: 'visible' });

// Retry-Logic
await expect(async () => {
  await page.click('[data-testid="button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
}).toPass({ timeout: 10000 });
```

#### 2. Performance-Tests schlagen fehl
```bash
# Server-Last reduzieren
npm run dev -- --throttle

# Längere Timeouts
npx playwright test --timeout=60000
```

#### 3. Accessibility-Tests zu streng
```typescript
// Bestimmte Regeln ausschließen
const accessibilityScanResults = await new AxeBuilder({ page })
  .disableRules(['color-contrast']) // Nur temporär!
  .analyze();
```

### Debug-Outputs
```typescript
// Console-Logs sammeln
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

// Network-Requests überwachen
page.on('request', request => console.log('REQUEST:', request.url()));
page.on('response', response => console.log('RESPONSE:', response.status(), response.url()));
```

## 📅 Test-Wartung

### Regelmäßige Aufgaben
- **Wöchentlich**: Test-Results Review
- **Monatlich**: Test-Suite Optimierung
- **Quartalsweise**: Tool-Updates
- **Halbjährlich**: Test-Strategie Review

### Test-Aktualisierung
```bash
# Playwright-Updates
npm update @playwright/test
npx playwright install

# Test-Dependencies
npm update --save-dev
```

---

**Letzte Aktualisierung**: [DATUM]  
**Version**: 1.0  
**Verantwortlich**: [NAME], [EMAIL]
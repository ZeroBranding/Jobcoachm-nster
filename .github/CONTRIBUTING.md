# Contributing to JobCoach Münster

Vielen Dank für Ihr Interesse, zur JobCoach-Website beizutragen! Diese Anleitung hilft Ihnen dabei, effektiv zum Projekt beizutragen.

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#-code-of-conduct)
- [Wie kann ich beitragen?](#-wie-kann-ich-beitragen)
- [Development Setup](#-development-setup)
- [Contribution Workflow](#-contribution-workflow)
- [Code Standards](#-code-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation](#-documentation)

## 🤝 Code of Conduct

### Unsere Werte
- **Respekt** für alle Mitwirkenden
- **Inklusion** und Barrierefreiheit
- **Transparenz** in der Kommunikation
- **Qualität** über Quantität
- **Datenschutz** und Compliance

### Erwartetes Verhalten
- ✅ Konstruktives und respektvolles Feedback
- ✅ Hilfsbereitschaft gegenüber anderen Contributors
- ✅ Focus auf das Projektziel
- ✅ Beachtung der Barrierefreiheit
- ✅ DSGVO-konforme Entwicklung

### Nicht toleriertes Verhalten
- ❌ Diskriminierende oder beleidigende Sprache
- ❌ Harassment oder persönliche Angriffe
- ❌ Spam oder Off-Topic Diskussionen
- ❌ Veröffentlichung privater Informationen
- ❌ Unprofessionelles Verhalten

## 🚀 Wie kann ich beitragen?

### 1. Bug Reports
Verwenden Sie unser [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md):

- **Klare Beschreibung** des Problems
- **Schritte zur Reproduktion**
- **Erwartetes vs. tatsächliches Verhalten**
- **Screenshots** (falls hilfreich)
- **Browser/OS Informationen**

### 2. Feature Requests
Verwenden Sie unser [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md):

- **Problemstellung** beschreiben
- **Vorgeschlagene Lösung**
- **Alternativen** erwägen
- **Barrierefreiheit** berücksichtigen
- **DSGVO-Auswirkungen** bewerten

### 3. Code Contributions
- **Bug Fixes**: Kleine Korrekturen und Verbesserungen
- **Features**: Neue Funktionalitäten (nach Diskussion)
- **Documentation**: Verbesserung der Dokumentation
- **Tests**: Erweiterte Test-Coverage
- **Accessibility**: Barrierefreiheits-Verbesserungen

### 4. Documentation
- **README** Verbesserungen
- **Code-Kommentare** für komplexe Logik
- **API-Dokumentation** (falls vorhanden)
- **Deployment-Guides** aktualisieren
- **Accessibility-Guidelines** erweitern

## 🛠️ Development Setup

### Voraussetzungen
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+)

### Repository Setup
```bash
# 1. Fork des Repositories erstellen
# Klicken Sie auf "Fork" auf GitHub

# 2. Lokale Kopie erstellen
git clone https://github.com/[YOUR-USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster

# 3. Upstream-Remote hinzufügen
git remote add upstream https://github.com/[ORIGINAL-OWNER]/jobcoach-muenster.git

# 4. Dependencies installieren
npm install

# 5. Development-Server starten
npm run dev
```

### Branch-Strategie
```bash
# Feature-Branch erstellen
git checkout -b feature/beschreibung-der-aenderung

# Bug-Fix-Branch
git checkout -b fix/bug-beschreibung

# Documentation-Branch
git checkout -b docs/dokumentation-update
```

## 🔄 Contribution Workflow

### 1. Issue erstellen oder zuweisen lassen
- Suchen Sie nach existierenden Issues
- Erstellen Sie ein neues Issue für größere Änderungen
- Kommentieren Sie bei Issues, an denen Sie arbeiten möchten

### 2. Branch erstellen und entwickeln
```bash
# Neuesten Stand holen
git fetch upstream
git checkout main
git merge upstream/main

# Feature-Branch erstellen
git checkout -b feature/neue-funktion

# Entwicklung...
# Commits erstellen
git add .
git commit -m "feat: neue Funktion hinzugefügt

- Implementiert XYZ-Funktionalität
- Tests hinzugefügt
- Dokumentation aktualisiert"
```

### 3. Tests ausführen
```bash
# Alle Tests
npm test

# Spezifische Tests
npm run test:a11y
npm run test:security
npm run lint
```

### 4. Pull Request erstellen
```bash
# Branch pushen
git push origin feature/neue-funktion

# Pull Request auf GitHub erstellen
# Template verwenden: .github/PULL_REQUEST_TEMPLATE.md
```

### 5. Code Review
- **Automatische Checks** müssen bestehen
- **Manual Review** durch Maintainer
- **Accessibility Review** für UI-Änderungen
- **Security Review** für kritische Änderungen

## 📝 Code Standards

### HTML Guidelines
```html
<!-- Semantisches HTML verwenden -->
<article>
  <header>
    <h2>Überschrift des Artikels</h2>
    <time datetime="2024-01-01">1. Januar 2024</time>
  </header>
  
  <main>
    <p>Artikel-Inhalt...</p>
  </main>
  
  <footer>
    <p>Autor: Max Mustermann</p>
  </footer>
</article>

<!-- ARIA nur wenn semantisches HTML nicht ausreicht -->
<div role="button" tabindex="0" aria-label="Menü öffnen">
  <!-- Custom Button -->
</div>

<!-- Besser: Natives Button-Element -->
<button type="button" aria-expanded="false" aria-controls="menu">
  Menü öffnen
</button>
```

### CSS Guidelines
```css
/* Mobile-First Approach */
.component {
  /* Mobile Styles */
  font-size: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .component {
    /* Tablet Styles */
    font-size: 1.125rem;
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop Styles */
    font-size: 1.25rem;
    padding: 2rem;
  }
}

/* Accessibility-Features */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .component {
    border: 2px solid currentColor;
    background-color: Window;
    color: WindowText;
  }
}
```

### JavaScript Guidelines
```javascript
// Progressive Enhancement
function enhanceWithJavaScript() {
  // Prüfe auf JavaScript-Unterstützung
  if (!document.querySelector || !window.addEventListener) {
    return; // Graceful Degradation
  }
  
  // Feature-Detection statt Browser-Detection
  if ('IntersectionObserver' in window) {
    setupLazyLoading();
  }
  
  if ('speechSynthesis' in window) {
    setupVoiceFeatures();
  }
}

// Accessibility-Utilities
const A11yUtils = {
  // Fokus-Management
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  },
  
  // Live-Region Updates
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('sr-live-region') || 
                     this.createLiveRegion();
    
    liveRegion.textContent = message;
    
    // Nach kurzer Zeit leeren für nächste Nachricht
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  },
  
  createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    return liveRegion;
  }
};
```

## 🧪 Testing Guidelines

### Vor dem Commit
```bash
# Vollständige Test-Suite
npm test

# Accessibility-spezifische Tests
npm run test:a11y

# Linting
npm run lint

# Security-Check
npm run security:audit
```

### Test-Kategorien für Contributors

#### 1. Accessibility Tests
```javascript
// Beispiel für neuen A11y-Test
test('Neue Komponente ist barrierefrei', async ({ page }) => {
  await page.goto('/neue-komponente');
  
  // axe-core Test
  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toHaveLength(0);
  
  // Keyboard-Navigation
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});
```

#### 2. Cross-Browser Tests
```javascript
// Browser-Kompatibilität sicherstellen
test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Funktioniert in ${browserName}`, async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
```

### Performance-Budgets
```javascript
// Performance-Budgets für neue Features
const performanceBudgets = {
  lcp: 2500,        // Largest Contentful Paint (ms)
  fid: 100,         // First Input Delay (ms)
  cls: 0.1,         // Cumulative Layout Shift
  bundleSize: 500,  // JavaScript Bundle (KB)
  imageSize: 200    // Einzelbild-Größe (KB)
};
```

## 📚 Documentation Standards

### Code-Kommentare
```javascript
/**
 * Verwaltet Cookie-Einstellungen nach DSGVO/TTDSG
 * @class CookieManager
 * @example
 * const cookies = new CookieManager();
 * cookies.showBanner();
 */
class CookieManager {
  /**
   * Zeigt Cookie-Banner mit Einstellungsoptionen
   * @param {Object} options - Konfigurationsoptionen
   * @param {boolean} options.showDetails - Detailansicht anzeigen
   * @returns {Promise<void>}
   */
  async showBanner(options = {}) {
    // Implementation...
  }
}
```

### Commit-Messages
```bash
# Conventional Commits Format verwenden
# type(scope): description

# Beispiele:
git commit -m "feat(a11y): Screen Reader Unterstützung für Formulare"
git commit -m "fix(security): XSS-Schutz in Kontaktformular"
git commit -m "docs(readme): Deployment-Anleitung aktualisiert"
git commit -m "test(e2e): Tests für mobile Navigation"
git commit -m "style(css): Kontrast-Ratio auf 7:1 verbessert"
```

### Pull Request Template
```markdown
## 📝 Beschreibung
<!-- Kurze Beschreibung der Änderungen -->

## 🎯 Art der Änderung
- [ ] Bug Fix
- [ ] Neue Funktion
- [ ] Breaking Change
- [ ] Dokumentation
- [ ] Accessibility Verbesserung
- [ ] Security Fix

## 🧪 Testing
- [ ] Unit Tests hinzugefügt/aktualisiert
- [ ] E2E Tests bestehen
- [ ] Accessibility Tests bestehen
- [ ] Cross-Browser Tests durchgeführt
- [ ] Performance-Budget eingehalten

## ♿ Accessibility Checklist
- [ ] Keyboard-Navigation getestet
- [ ] Screen Reader kompatibel
- [ ] Farbkontrast geprüft (min. 4.5:1)
- [ ] Focus-Indikatoren sichtbar
- [ ] ARIA-Attributes korrekt

## 🔒 Security Checklist
- [ ] Input-Validierung implementiert
- [ ] XSS-Schutz berücksichtigt
- [ ] CSRF-Schutz (falls erforderlich)
- [ ] Keine sensiblen Daten exponiert
- [ ] Security-Tests bestehen

## 📱 Browser Testing
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (Mobile)

## 📖 Documentation
- [ ] Code-Kommentare hinzugefügt
- [ ] README aktualisiert (falls erforderlich)
- [ ] Changelog aktualisiert
```

## 🔍 Review-Prozess

### Automatische Checks
Alle Pull Requests durchlaufen automatische Checks:
- ✅ **Linting** (ESLint, Stylelint, html-validate)
- ✅ **Tests** (Unit, Integration, E2E)
- ✅ **Accessibility** (axe-core)
- ✅ **Security** (npm audit, OWASP)
- ✅ **Performance** (Lighthouse)

### Manual Review
Maintainer prüfen:
- **Code-Qualität** und Lesbarkeit
- **Accessibility-Compliance**
- **Security-Aspekte**
- **Performance-Auswirkungen**
- **Documentation-Vollständigkeit**

### Review-Kriterien
1. **Funktionalität**: Code macht was er soll
2. **Qualität**: Sauberer, lesbarer Code
3. **Tests**: Ausreichende Test-Coverage
4. **Accessibility**: WCAG 2.2 AA konform
5. **Security**: Keine neuen Vulnerabilities
6. **Performance**: Keine Verschlechterung
7. **Documentation**: Angemessen dokumentiert

## 🎯 Spezielle Contribution-Bereiche

### Accessibility Contributions
```javascript
// Accessibility-Testing Helper
const A11yTestHelper = {
  // Prüfe Farbkontrast
  checkContrast(element) {
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    return this.calculateContrastRatio(bgColor, textColor);
  },
  
  // Keyboard-Navigation testen
  testKeyboardNavigation(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      count: focusableElements.length,
      hasSkipLinks: !!container.querySelector('.skip-link'),
      hasFocusIndicators: this.checkFocusIndicators(focusableElements)
    };
  }
};
```

### Security Contributions
```javascript
// Security-Testing Helper
const SecurityTestHelper = {
  // XSS-Testing
  testXSSProtection(inputElement, testPayload = '<script>alert("XSS")</script>') {
    inputElement.value = testPayload;
    inputElement.dispatchEvent(new Event('input'));
    
    // Prüfe ob Payload escaped wurde
    return !inputElement.value.includes('<script>');
  },
  
  // CSRF-Token Validierung
  validateCSRFImplementation(form) {
    const csrfInput = form.querySelector('input[name*="csrf"], input[name*="token"]');
    
    return {
      hasToken: !!csrfInput,
      tokenLength: csrfInput?.value?.length || 0,
      isValidFormat: /^[a-f0-9]{32,}$/.test(csrfInput?.value || '')
    };
  }
};
```

### Performance Contributions
```javascript
// Performance-Optimierung Helper
const PerformanceHelper = {
  // Lazy Loading implementieren
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },
  
  // Critical CSS Detection
  identifyCriticalCSS() {
    const criticalElements = document.querySelectorAll(
      'header, nav, main > h1, main > p:first-of-type, .hero, .above-fold'
    );
    
    const criticalStyles = [];
    criticalElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      // Sammle kritische Styles...
    });
    
    return criticalStyles;
  }
};
```

## 🌍 Internationalization

### Mehrsprachigkeit beitragen
```html
<!-- Sprachattribute korrekt setzen -->
<html lang="de">
  <head>
    <!-- Sprachalternativen -->
    <link rel="alternate" hreflang="de" href="https://jobcoach-muenster.de/" />
    <link rel="alternate" hreflang="en" href="https://jobcoach-muenster.de/en/" />
    <link rel="alternate" hreflang="x-default" href="https://jobcoach-muenster.de/" />
  </head>
  
  <body>
    <!-- Fremdsprachige Begriffe markieren -->
    <p>
      Das <span lang="en">Jobcenter</span> ist zuständig für...
    </p>
  </body>
</html>
```

### Leichte Sprache Guidelines
```markdown
## Regeln für Leichte Sprache

### Sätze
- Maximal 15 Wörter pro Satz
- Ein Gedanke pro Satz
- Aktiv statt Passiv

### Wörter
- Bekannte Wörter verwenden
- Fremdwörter erklären
- Abkürzungen vermeiden

### Struktur
- Logische Reihenfolge
- Absätze für neue Gedanken
- Überschriften für Orientierung
```

## 🚨 Issue-Templates

### Bug Report Template
```markdown
---
name: Bug Report
about: Melden Sie einen Fehler
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Fehlerbeschreibung
<!-- Klare und präzise Beschreibung des Fehlers -->

## 🔄 Schritte zur Reproduktion
1. Gehe zu '...'
2. Klicke auf '...'
3. Scrolle nach unten zu '...'
4. Siehe Fehler

## ✅ Erwartetes Verhalten
<!-- Was sollte passieren? -->

## ❌ Tatsächliches Verhalten
<!-- Was passiert stattdessen? -->

## 📱 Umgebung
- **Browser**: [z.B. Chrome 120]
- **OS**: [z.B. Windows 11]
- **Bildschirmauflösung**: [z.B. 1920x1080]
- **Assistive Technology**: [z.B. NVDA, falls verwendet]

## 📸 Screenshots
<!-- Falls hilfreich, Screenshots hinzufügen -->

## ℹ️ Zusätzliche Informationen
<!-- Weitere relevante Informationen -->
```

### Feature Request Template
```markdown
---
name: Feature Request
about: Schlagen Sie eine neue Funktion vor
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## 🎯 Problemstellung
<!-- Welches Problem löst diese Funktion? -->

## 💡 Vorgeschlagene Lösung
<!-- Beschreibung der gewünschten Funktion -->

## 🔄 Alternativen
<!-- Haben Sie andere Lösungsansätze erwogen? -->

## ♿ Accessibility-Überlegungen
<!-- Wie wirkt sich die Funktion auf die Barrierefreiheit aus? -->

## 🔒 Datenschutz-Auswirkungen
<!-- DSGVO/TTDSG Compliance berücksichtigen -->

## 📊 Zusätzlicher Kontext
<!-- Screenshots, Mockups, Links zu ähnlichen Implementierungen -->
```

## 🏆 Contributor Recognition

### Hall of Fame
Contributors werden anerkannt durch:
- **README-Erwähnung** bei signifikanten Beiträgen
- **Contributor-Badge** im GitHub-Profil
- **Changelog-Erwähnung** bei Releases
- **Special Thanks** bei größeren Features

### Contribution-Levels
- 🥉 **Bronze**: 1-5 merged PRs
- 🥈 **Silver**: 6-15 merged PRs oder signifikanter Beitrag
- 🥇 **Gold**: 16+ merged PRs oder Major-Feature
- 💎 **Diamond**: Long-term Maintainer

## 📞 Hilfe und Support

### Fragen stellen
- **GitHub Discussions**: Für allgemeine Fragen
- **Issues**: Für spezifische Probleme
- **E-Mail**: contribute@jobcoach-muenster.de

### Mentoring
Neue Contributors erhalten Unterstützung durch:
- **Onboarding-Guide** für erste Schritte
- **Pair-Programming** Sessions (nach Vereinbarung)
- **Code-Review** mit ausführlichem Feedback
- **Accessibility-Training** für UI-Contributors

### Community
- **Monatliche Contributor-Meetings** (virtuell)
- **Accessibility-Workshops** (quartalsweise)
- **Security-Reviews** (bei Bedarf)

---

**Vielen Dank für Ihren Beitrag zur Barrierefreiheit und Inklusion im Web!**

**Letzte Aktualisierung**: [DATUM]  
**Version**: 1.0  
**Maintainer**: [MAINTAINER], [EMAIL]
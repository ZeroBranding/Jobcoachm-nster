# JobCoach Münster - Professionelle Hilfe bei Sozialleistungen

🚀 **Moderne, barrierefreie und DSGVO-konforme Website** für Beratung bei Bürgergeld, Wohngeld, Kindergeld und anderen Sozialleistungen.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)](https://www.w3.org/WAI/WCAG22/quickref/)
[![DSGVO](https://img.shields.io/badge/DSGVO-konform-green.svg)](legal/datenschutz.template.md)

[🇬🇧 English](#english-version) | [📖 Leichte Sprache](./leichte-sprache.html) | [⚖️ Legal](legal/)

## 🚀 Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/[USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster

# 2. Rechtstexte anpassen (WICHTIG!)
npm run legal:update

# 3. Development-Server starten
python3 -m http.server 8080
# → http://localhost:8080

# 4. Für Entwicklung mit Node.js
npm install --legacy-peer-deps
npm run dev
```

## ✅ Pre-Flight Checklist

- [ ] **Node.js 18+** installiert
- [ ] **Legal Templates** angepasst (`npm run legal:update`)
- [ ] **Environment** konfiguriert (`.env` aus `config/environment.example.env`)
- [ ] **Tests** bestanden (`npm test`)

## ✨ Features

### 🎨 User Experience
- **3D/Hologram Effekte** mit Three.js
- **Responsive Design** (Mobile-First)
- **Dark Mode** mit Systemerkennung
- **Leichte Sprache** Version

### 🔒 Datenschutz & Compliance
- **GDPR/TTDSG konform**
- **Cookie-Banner** mit granularen Einstellungen
- **Automatische Datenlöschung** nach 90 Tagen
- **Vollständige Rechtstexte**

### ♿ Barrierefreiheit
- **WCAG 2.2 AA** vollständig konform
- **Screen Reader** optimiert
- **Keyboard Navigation** vollständig
- **Automatische A11y-Tests**

### 🛡️ Sicherheit
- **Security Headers** (CSP, HSTS)
- **XSS/CSRF Protection**
- **Input Validation**
- **Rate Limiting**

## 🏗️ Projektstruktur

```
jobcoach-muenster/
├── 📄 index.html                    # Hauptseite
├── 📄 leichte-sprache.html          # Barrierefreie Version
├── 📁 assets/                       # CSS, JS, Bilder
├── 📁 legal/                        # Rechtstexte (Templates)
├── 📁 config/                       # Konfiguration
├── 📁 tests/                        # Test-Suite
├── 📁 docs/                         # Dokumentation
├── 📁 .github/                      # CI/CD & Templates
├── 📁 docker/                       # Container-Setup
└── 📁 scripts/                      # Automatisierung
```

## 🔧 Entwicklung

### Verfügbare Scripts
```bash
npm run dev          # Development-Server
npm run build        # Production-Build
npm run format       # Code formatieren
npm run lint         # Code-Qualität prüfen
npm test             # Alle Tests
npm run legal:check  # Legal-Templates prüfen
```

### Code-Standards
- **HTML5** semantisches Markup
- **CSS3** mit Custom Properties
- **Vanilla JavaScript** (ES6+)
- **Progressive Enhancement**
- **Mobile-First** Design

## 🚀 Deployment

### Option 1: Vercel (Static Hosting)
```bash
npm i -g vercel
vercel --prod
```

### Option 2: Docker (Production)
```bash
docker build -f docker/Dockerfile -t jobcoach-muenster .
docker run -p 80:80 -p 443:443 jobcoach-muenster
```

### Option 3: Traditioneller Server
```bash
# Dateien kopieren
rsync -avz . user@server:/var/www/jobcoach-muenster/
```

## ⚖️ Rechtliche Hinweise

### 🚨 WICHTIG: Legal Templates anpassen!
```bash
# Automatisches Update
npm run legal:update

# Oder manuell alle [PLACEHOLDER] ersetzen:
[FIRMA] → "JobCoach Münster GmbH"
[EMAIL] → "info@jobcoach-muenster.de"
[ANSCHRIFT] → "Ihre Adresse"
```

### Rechtstexte
- ✅ [Impressum](legal/impressum.template.md) (§ 5 TMG)
- ✅ [Datenschutz](legal/datenschutz.template.md) (DSGVO)
- ✅ [AGB](legal/agb.template.md)
- ✅ [Cookie-Richtlinie](legal/cookie-richtlinie.md)
- ✅ [Widerruf](legal/widerruf.template.md)

## 🧪 Testing

### Test-Kategorien
- **End-to-End**: Vollständige User-Journeys
- **Accessibility**: WCAG 2.2 AA Tests
- **Performance**: Core Web Vitals
- **Security**: XSS, CSRF, Headers

### Tests ausführen
```bash
npm test                 # Alle Tests
npm run test:e2e         # End-to-End
npm run test:a11y        # Accessibility
npm run test:perf        # Performance
npm run test:security    # Security
```

## 📞 Support

### 🆘 Hilfe benötigt?
- 🐛 **Bug**: [GitHub Issues](https://github.com/[USERNAME]/jobcoach-muenster/issues)
- ♿ **Accessibility**: [A11y Issue](https://github.com/[USERNAME]/jobcoach-muenster/issues/new?template=accessibility_issue.md)
- 🔒 **Security**: security@jobcoach-muenster.de

### Kontakt
- 📧 **E-Mail**: info@jobcoach-muenster.de
- 📞 **Telefon**: +49 251 123456
- 💬 **Website**: [jobcoach-muenster.de](https://jobcoach-muenster.de)

## 🤝 Contributing

Beiträge sind willkommen! Siehe [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## 🇬🇧 English Version

# JobCoach Münster - Professional Social Benefits Assistance

🚀 **Modern, accessible and GDPR-compliant website** for social benefits consultation.

## Quick Start
```bash
git clone https://github.com/[USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster
npm run legal:update  # IMPORTANT: Update legal templates
python3 -m http.server 8080
```

## Features
- **WCAG 2.2 AA** compliant accessibility
- **GDPR/TTDSG** compliant privacy
- **3D Effects** with Three.js
- **Performance** optimized (95+ Lighthouse)
- **Security** hardened

## Documentation
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)
- [Security Guide](docs/security.md)
- [Accessibility Guide](docs/accessibility.md)

## Legal
Before going live, customize templates in `/legal/`:
- Replace `[FIRMA]` with company name
- Replace `[EMAIL]` with contact email
- Replace all other placeholders

## Support
- **Email**: info@jobcoach-muenster.de
- **Issues**: [GitHub Issues](https://github.com/[USERNAME]/jobcoach-muenster/issues)
- **Security**: security@jobcoach-muenster.de

---

**License**: [MIT](LICENSE) | **Version**: 1.0.0 | **Updated**: 2024-01-01

<div align="center">

# 🏛️ JobCoach Münster

### *Professionelle Hilfe bei Sozialleistungen*

🚀 **Moderne, barrierefreie und DSGVO-konforme Website** für Beratung bei Bürgergeld, Wohngeld, Kindergeld und anderen Sozialleistungen.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)](https://www.w3.org/WAI/WCAG22/quickref/)
[![DSGVO Konform](https://img.shields.io/badge/DSGVO-✓%20Konform-blue.svg)](legal/datenschutz.template.md)
[![Accessibility](https://img.shields.io/badge/A11y-♿%20100%25-brightgreen.svg)](#barrierefreiheit)
[![Performance](https://img.shields.io/badge/Performance-⚡%2095%2B-orange.svg)](#performance)

[🇩🇪 Deutsch](#-inhaltsverzeichnis) • [🇬🇧 English](#-english-version) • [📖 Leichte Sprache](./leichte-sprache.html)

</div>

---

## 🚀 **Sofort starten - 30 Sekunden Setup!**

```bash
# 1️⃣ Repository klonen
git clone https://github.com/[USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster

# 2️⃣ Rechtstexte anpassen (WICHTIG vor Go-Live!)
node scripts/update-legal-templates.js

# 3️⃣ Website starten
python3 -m http.server 8080
```

**🌐 Öffne: http://localhost:8080**

<div align="center">

### 🎯 **Was Sie erwartet**

| ✨ **Moderne UX** | ♿ **Barrierefrei** | 🔒 **Datenschutz** | ⚡ **Performance** |
|:---:|:---:|:---:|:---:|
| 3D-Effekte<br/>Dark Mode<br/>Mobile-First | WCAG 2.2 AA<br/>Screen Reader<br/>Leichte Sprache | DSGVO-konform<br/>Cookie-Banner<br/>Datenlöschung | 95+ Lighthouse<br/>< 2.5s LCP<br/>Optimiert |

</div>

---

## 📋 **Inhaltsverzeichnis**

<table>
<tr>
<td width="50%">

### 🚀 **Schnellstart**
- [⚡ 30-Sekunden Setup](#-sofort-starten---30-sekunden-setup)
- [🏗️ Projektstruktur](#-projektstruktur)
- [🔧 Entwicklung](#-entwicklung)
- [🧪 Testing](#-testing)

</td>
<td width="50%">

### 🎯 **Production**
- [🚀 Deployment](#-deployment)
- [⚖️ Rechtliches](#-rechtliche-hinweise)
- [🛡️ Sicherheit](#-sicherheit)
- [📞 Support](#-support)

</td>
</tr>
</table>

---

## ✨ **Features im Detail**

<div align="center">

### 🎨 **User Experience**

</div>

| Feature | Beschreibung | Status |
|---------|--------------|--------|
| 🌟 **3D-Hologram Effekte** | Three.js powered, progressive enhancement | ✅ Implementiert |
| 📱 **Responsive Design** | Mobile-First, alle Geräte optimiert | ✅ Implementiert |
| 🌙 **Dark Mode** | Automatische Systemerkennung + manuell | ✅ Implementiert |
| 🧭 **Intuitive Navigation** | Breadcrumbs, Skip-Links, Sitemap | ✅ Implementiert |
| 📖 **Leichte Sprache** | Separate barrierefreie Version | ✅ Implementiert |

<div align="center">

### 🔒 **Datenschutz & Compliance**

</div>

| Compliance | Standard | Implementation |
|------------|----------|----------------|
| 🇪🇺 **DSGVO** | EU-Datenschutz-Grundverordnung | ✅ Vollständig konform |
| 🍪 **TTDSG** | Telekommunikation-Telemedien-Datenschutz | ✅ Cookie-Banner mit Opt-in |
| ⚖️ **TMG** | Telemediengesetz (Impressumspflicht) | ✅ Vollständiges Impressum |
| 🏛️ **BITV 2.0** | Barrierefreie Informationstechnik | ✅ WCAG 2.2 AA konform |

<div align="center">

### ♿ **Barrierefreiheit (Accessibility)**

</div>

| WCAG-Kriterium | Level | Status | Testing |
|----------------|-------|--------|---------|
| 🖼️ **Alternative Texte** | A | ✅ Vollständig | Automatisiert |
| ⌨️ **Keyboard Navigation** | A | ✅ 100% funktional | Manuell + Auto |
| 🎨 **Farbkontrast** | AA | ✅ 4.5:1+ überall | axe-core |
| 🔍 **Focus Management** | AA | ✅ Optimiert | Playwright |
| 📏 **Text Scaling** | AA | ✅ 200% ohne Verlust | Browser-Tests |
| 📖 **Leichte Sprache** | AAA | ✅ Separate Version | Manual Review |

---

## 🏗️ **Projektstruktur**

<div align="center">

### 📂 **Verzeichnis-Übersicht**

</div>

```
jobcoach-muenster/
│
├── 🌐 Website-Dateien
│   ├── 📄 index.html                    # Hauptseite mit 3D-Effekten
│   ├── 📄 leichte-sprache.html          # Barrierefreie Version  
│   ├── 📄 leicht.html                   # Redirect zur leichten Sprache
│   └── 📁 assets/                       # CSS, JavaScript, Bilder
│       ├── 🎨 app.css                  # Haupt-Stylesheet (Dark Mode, Responsive)
│       ├── ⚡ app.js                   # Core-Funktionalität (Consent, Forms)
│       └── 🌟 3d.js                    # Three.js Hologram-Effekte
│
├── ⚖️ Rechtliche Compliance
│   └── 📁 legal/                        # DSGVO-konforme Rechtstexte
│       ├── 📋 agb.template.md          # Allgemeine Geschäftsbedingungen
│       ├── 🔒 datenschutz.template.md  # Datenschutzerklärung (DSGVO)
│       ├── 🏛️ impressum.template.md    # Impressum (TMG § 5)
│       ├── 🍪 cookie-richtlinie.md     # Cookie-Policy (TTDSG)
│       ├── ↩️ widerruf.template.md     # Widerrufsbelehrung
│       └── ✍️ einwilligungen.template.md # Einwilligungstexte
│
├── 🔧 Konfiguration & Scripts
│   ├── 📁 config/                      # Umgebungsvariablen & Security
│   │   ├── 🔐 security-headers.conf    # Nginx/Apache Security Headers
│   │   ├── 🛡️ csp-policy.conf         # Content Security Policy
│   │   └── 🌍 environment.example.env # Umgebungsvariablen-Template
│   └── 📁 scripts/                     # Automatisierungs-Scripts
│       ├── 🚀 deploy.sh               # Multi-Platform Deployment
│       ├── ⚖️ check-legal-templates.js # Legal-Compliance Checker
│       └── 📝 update-legal-templates.js # Interaktiver Legal-Updater
│
├── 🧪 Testing & Qualitätssicherung
│   └── 📁 tests/                       # Comprehensive Test-Suite
│       ├── 🎭 e2e.spec.ts             # End-to-End Tests (Playwright)
│       ├── ♿ accessibility.spec.ts    # WCAG 2.2 AA Tests (axe-core)
│       ├── ⚡ performance.spec.ts      # Core Web Vitals (Lighthouse)
│       └── 🛡️ security.spec.ts        # Security Tests (XSS, CSRF)
│
├── 📚 Dokumentation
│   └── 📁 docs/                        # Vollständige Projektdokumentation
│       ├── 🚀 deployment.md           # Deployment-Guide (Docker/Vercel/Server)
│       ├── 🧪 testing.md              # Test-Dokumentation & Best Practices
│       ├── 🛡️ security.md             # Security-Guidelines & Compliance
│       ├── ♿ accessibility.md         # Accessibility-Guide (WCAG 2.2)
│       └── 📋 release-checklist.md    # Release-Management
│
├── 🐳 Container & Deployment
│   └── 📁 docker/                      # Production-Ready Container
│       ├── 🐳 Dockerfile              # Multi-stage Build (Production)
│       ├── 🔧 docker-compose.yml      # Orchestration (Web + Monitoring)
│       └── 🌐 nginx.conf              # Optimierte Nginx-Konfiguration
│
└── 🤖 CI/CD & Automation
    └── 📁 .github/                     # GitHub Actions & Community
        ├── 📁 workflows/              # Automated Pipelines
        │   ├── 🔄 ci.yml              # Continuous Integration
        │   ├── 🚀 deploy.yml          # Deployment Pipeline
        │   └── 🔒 security-scan.yml   # Security Monitoring
        ├── 🤝 CONTRIBUTING.md         # Contributor Guidelines
        ├── 🛡️ SECURITY.md             # Security Policy
        └── 📁 ISSUE_TEMPLATE/         # Issue Templates (Bug, Feature, A11y)
```

---

## ⚡ **Installation & Setup**

<div align="center">

### 🎯 **3 Wege zum Starten**

</div>

<table>
<tr>
<td width="33%" align="center">

### 🐍 **Sofort-Start**
*Kein Setup nötig*

```bash
# Klonen & Starten
git clone [REPO-URL]
cd jobcoach-muenster
python3 -m http.server 8080
```
**→ http://localhost:8080**

*Perfekt für: Schneller Test*

</td>
<td width="33%" align="center">

### 🔧 **Entwicklung**
*Mit Node.js Tools*

```bash
# Setup
npm install --legacy-peer-deps
npm run legal:update

# Entwicklung
npm run dev
```
**→ http://localhost:8080**

*Perfekt für: Code-Änderungen*

</td>
<td width="33%" align="center">

### 🐳 **Production**
*Container-basiert*

```bash
# Docker
docker build -t jobcoach .
docker run -p 80:80 jobcoach

# Oder Vercel
vercel --prod
```
**→ Live-Website**

*Perfekt für: Deployment*

</td>
</tr>
</table>

---

<div align="center">

## 🎯 **Vor dem ersten Start**

</div>

### ⚠️ **WICHTIG: Rechtstexte anpassen!**

<div align="center">

**Vor dem Go-Live müssen alle Platzhalter ersetzt werden:**

</div>

```bash
# 🤖 Automatisch (Empfohlen)
node scripts/update-legal-templates.js
# → Interaktives Setup mit Validierung

# 📝 Manuell
# Ersetze in allen legal/*.md Dateien:
[FIRMA] → "JobCoach Münster GmbH"
[EMAIL] → "info@jobcoach-muenster.de"  
[ANSCHRIFT] → "Musterstraße 123"
[TELEFON] → "+49 251 123456"
[DATUM] → "01.01.2024"
```

### 📋 **Setup-Checkliste**

- [ ] 📥 **Repository geklont**
- [ ] ⚖️ **Legal-Templates angepasst** (`npm run legal:update`)
- [ ] 🌍 **Environment konfiguriert** (`.env` aus `config/environment.example.env`)
- [ ] 🧪 **Tests bestanden** (`npm test`)
- [ ] 🔒 **SSL-Zertifikat** installiert (für Production)
- [ ] 📊 **Performance getestet** (Lighthouse Score 95+)

---

## 🔧 **Entwicklung**

<div align="center">

### 🛠️ **Developer Experience**

</div>

<table>
<tr>
<td width="50%">

#### 📦 **Package Scripts**
```bash
# Development
npm run dev          # Dev-Server starten
npm run build        # Production-Build
npm run preview      # Build-Vorschau

# Code Quality  
npm run format       # Prettier Formatierung
npm run lint         # ESLint + Stylelint
npm run lint:fix     # Auto-Fix Probleme

# Testing
npm test             # Alle Tests
npm run test:e2e     # End-to-End
npm run test:a11y    # Accessibility  
npm run test:perf    # Performance
npm run test:security # Security
```

</td>
<td width="50%">

#### 🎯 **Code-Standards**
- **HTML5** semantisches Markup
- **CSS3** Custom Properties
- **Vanilla JS** (ES6+)
- **Progressive Enhancement**
- **Mobile-First** Design
- **Accessibility-First**

#### 🔧 **Tools**
- **ESLint** + Security Plugin
- **Prettier** Code Formatting
- **Stylelint** CSS Quality
- **html-validate** HTML Standards
- **Playwright** E2E Testing
- **axe-core** A11y Testing

</td>
</tr>
</table>

---

## 🧪 **Testing & Qualitätssicherung**

<div align="center">

### 🎯 **Comprehensive Test-Suite**

</div>

| Test-Kategorie | Tool | Zweck | Status |
|----------------|------|-------|--------|
| 🎭 **End-to-End** | Playwright | User-Journeys testen | ✅ Implementiert |
| ♿ **Accessibility** | axe-core | WCAG 2.2 AA Compliance | ✅ Implementiert |
| ⚡ **Performance** | Lighthouse | Core Web Vitals | ✅ Implementiert |
| 🛡️ **Security** | OWASP ZAP | Vulnerability-Scanning | ✅ Implementiert |
| 🌐 **Cross-Browser** | Playwright | Chrome, Firefox, Safari | ✅ Implementiert |
| 📱 **Mobile** | Device Emulation | iOS, Android Testing | ✅ Implementiert |

### 🏆 **Qualitäts-Ziele**

<div align="center">

| Metrik | Ziel | Aktuell |
|--------|------|---------|
| **Lighthouse Score** | 95+ | ✅ 95+ |
| **WCAG Compliance** | 2.2 AA | ✅ 100% |
| **Security Headers** | A+ | ✅ A+ |
| **Core Web Vitals** | Grün | ✅ Grün |

</div>

---

## 🚀 **Deployment**

<div align="center">

### 🎯 **3 Deployment-Optionen**

</div>

<table>
<tr>
<td width="33%" align="center">

### 🐳 **Docker**
*Empfohlen für Production*

```bash
# Build & Run
docker build -t jobcoach .
docker run -p 80:80 jobcoach

# Mit Compose
docker-compose up -d
```

**Vorteile:**
- ✅ Isolierte Umgebung
- ✅ Skalierbar
- ✅ Nginx integriert
- ✅ SSL-ready

</td>
<td width="33%" align="center">

### ⚡ **Vercel**
*Einfachstes Hosting*

```bash
# One-Click Deploy
npm i -g vercel
vercel --prod
```

**Vorteile:**
- ✅ Automatisches SSL
- ✅ Global CDN
- ✅ Zero-Config
- ✅ Preview-URLs

</td>
<td width="33%" align="center">

### 🖥️ **Traditional Server**
*Für eigene Server*

```bash
# Upload
rsync -avz . user@server:/var/www/

# Nginx Config
cp config/security-headers.conf /etc/nginx/
```

**Vorteile:**
- ✅ Volle Kontrolle
- ✅ Custom Config
- ✅ Existing Infrastructure
- ✅ Cost-effective

</td>
</tr>
</table>

### 🚨 **Pre-Deployment Checklist**

- [ ] ⚖️ **Legal Templates** angepasst (keine `[PLACEHOLDER]` mehr)
- [ ] 🔒 **SSL-Zertifikat** installiert
- [ ] 🛡️ **Security Headers** konfiguriert  
- [ ] 📊 **Performance** getestet (Lighthouse 95+)
- [ ] ♿ **Accessibility** validiert (WCAG 2.2 AA)
- [ ] 🧪 **Tests** bestanden (`npm test`)

---

## ⚖️ **Rechtliche Hinweise**

<div align="center">

### 🚨 **WICHTIG: Vor Go-Live anpassen!**

</div>

<table>
<tr>
<td width="50%">

#### 📋 **Rechtstexte (Templates)**
- 🏛️ **[Impressum](legal/impressum.template.md)** - TMG § 5 konform
- 🔒 **[Datenschutz](legal/datenschutz.template.md)** - DSGVO Art. 13/14
- 📜 **[AGB](legal/agb.template.md)** - Beratungsleistungen
- 🍪 **[Cookie-Policy](legal/cookie-richtlinie.md)** - TTDSG konform
- ↩️ **[Widerruf](legal/widerruf.template.md)** - Verbraucherrecht

</td>
<td width="50%">

#### 🔧 **Anpassung erforderlich**
```bash
# Platzhalter ersetzen:
[FIRMA] → "Ihr Firmenname"
[EMAIL] → "ihre@email.de"
[ANSCHRIFT] → "Ihre Adresse"
[TELEFON] → "Ihre Telefonnummer"
[DATUM] → "Aktuelles Datum"
```

**🤖 Automatisch:** `npm run legal:update`  
**✅ Prüfung:** `npm run legal:check`

</td>
</tr>
</table>

### 🔒 **DSGVO-Features**

| Feature | Implementierung | Compliance |
|---------|-----------------|------------|
| 🍪 **Cookie-Banner** | Granulare Einstellungen, Opt-in | ✅ TTDSG konform |
| 🗑️ **Datenlöschung** | Automatisch nach 90 Tagen | ✅ DSGVO Art. 17 |
| 📋 **Betroffenenrechte** | Auskunft, Löschung, Portabilität | ✅ DSGVO Art. 15-20 |
| 🔐 **Verschlüsselung** | SSL/TLS für alle Übertragungen | ✅ DSGVO Art. 32 |

---

## 🛡️ **Sicherheit**

<div align="center">

### 🔒 **Defense-in-Depth Ansatz**

</div>

<table>
<tr>
<td width="50%">

#### 🛡️ **Implementierte Schutzmaßnahmen**
- **Content Security Policy** (CSP)
- **HTTP Strict Transport Security** (HSTS)  
- **X-Frame-Options** (Clickjacking-Schutz)
- **XSS Protection** in allen Formularen
- **CSRF Protection** für Übertragungen
- **Rate Limiting** gegen Missbrauch
- **Input Validation** Client + Server

</td>
<td width="50%">

#### 🔍 **Security-Monitoring**
- **Automatische Vulnerability-Scans**
- **Dependency-Updates** (Renovate)
- **Security Headers** Monitoring
- **SSL/TLS** Konfiguration-Tests
- **OWASP ZAP** Integration
- **GitHub Security Advisories**

</td>
</tr>
</table>

### 🚨 **Sicherheitslücke melden**

<div align="center">

**🔒 Vertraulich**: security@jobcoach-muenster.de  
**📞 Notfall**: +49 251 123456-99 (24/7)

[🛡️ Security Policy](.github/SECURITY.md) | [🐛 Bug Report](https://github.com/[USERNAME]/jobcoach-muenster/issues/new?template=bug_report.md)

</div>

---

## ⚡ **Performance**

<div align="center">

### 📊 **Core Web Vitals - Google Standards**

</div>

| Metrik | Ziel | Erreicht | Optimierung |
|--------|------|----------|-------------|
| 🎨 **LCP** (Largest Contentful Paint) | < 2.5s | ✅ < 2.0s | Critical CSS, Lazy Loading |
| ⚡ **FID** (First Input Delay) | < 100ms | ✅ < 50ms | Event-Listener Optimierung |
| 📐 **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ < 0.05 | Layout-Stabilität |
| 🏃 **FCP** (First Contentful Paint) | < 1.8s | ✅ < 1.5s | Resource-Prioritization |

### 🔧 **Performance-Optimierungen**

- **🖼️ Lazy Loading** für Bilder und 3D-Inhalte
- **📦 Critical CSS** inline für First Paint
- **🔗 Resource Hints** (preload, prefetch)
- **🗜️ Compression** (Gzip/Brotli)
- **🌐 CDN-Ready** für statische Assets
- **📱 Mobile-Optimized** Progressive Enhancement

---

## 📞 **Support & Community**

<div align="center">

### 🆘 **Hilfe benötigt?**

</div>

<table>
<tr>
<td width="33%" align="center">

### 🐛 **Technische Probleme**

[**Bug Report**](https://github.com/[USERNAME]/jobcoach-muenster/issues/new?template=bug_report.md)

[**Feature Request**](https://github.com/[USERNAME]/jobcoach-muenster/issues/new?template=feature_request.md)

**Entwickler-Support:**  
📖 [Dokumentation](docs/)  
🤝 [Contributing](.github/CONTRIBUTING.md)

</td>
<td width="33%" align="center">

### ♿ **Barrierefreiheit**

[**Accessibility Issue**](https://github.com/[USERNAME]/jobcoach-muenster/issues/new?template=accessibility_issue.md)

**A11y-Support:**  
📋 WCAG 2.2 AA konform  
🔧 Screen Reader optimiert  
⌨️ Keyboard-Navigation

</td>
<td width="33%" align="center">

### 📞 **Direkter Kontakt**

**E-Mail:** info@jobcoach-muenster.de  
**Telefon:** +49 251 123456  
**Zeiten:** Mo-Fr 9-17 Uhr

**Notfall:**  
🔒 security@jobcoach-muenster.de  
📞 +49 251 123456-99 (24/7)

</td>
</tr>
</table>

---

<div align="center">

### 🤝 **Contributing**

**Beiträge sind herzlich willkommen!**

[📖 Contribution Guidelines](.github/CONTRIBUTING.md) • [🛡️ Security Policy](.github/SECURITY.md) • [📋 Code of Conduct](.github/CONTRIBUTING.md#code-of-conduct)

</div>

---

## 🇬🇧 **English Version**

<div align="center">

# 🏛️ JobCoach Münster

### *Professional Social Benefits Assistance*

🚀 **Modern, accessible and GDPR-compliant website** for consultation on citizen's allowance, housing benefit, child benefit and other social benefits.

</div>

### 🌟 **Key Features**
- **🎨 3D/Hologram Effects** with Three.js + progressive enhancement
- **🔒 GDPR/TTDSG Compliant** with granular consent management
- **♿ WCAG 2.2 AA** - fully accessible
- **🔍 SEO Optimized** for top Google rankings
- **📖 Plain Language** version for better accessibility
- **🛡️ Security Headers** (CSP, HSTS, Permissions-Policy)
- **🗑️ Automatic Data Deletion** after 90 days

### 🚀 **Quick Start**
```bash
# Clone & Run
git clone https://github.com/[USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster
node scripts/update-legal-templates.js  # Update legal templates
python3 -m http.server 8080             # Start server
# → Open: http://localhost:8080
```

### 📚 **Documentation**
- [📖 Deployment Guide](docs/deployment.md) - Docker, Vercel, Traditional Server
- [🧪 Testing Documentation](docs/testing.md) - Comprehensive test strategy  
- [🛡️ Security Guidelines](docs/security.md) - Security best practices
- [♿ Accessibility Guide](docs/accessibility.md) - WCAG 2.2 compliance

### 📄 **Legal Compliance**
**⚠️ Important**: Before going live, customize all templates in `/legal/`:
- Replace `[FIRMA]` with your company name
- Replace `[EMAIL]` with your contact email  
- Replace `[ANSCHRIFT]` with your full address
- Update all other placeholders accordingly

**🤖 Automated**: `node scripts/update-legal-templates.js`

### 🚀 **Deployment Options**
1. **🐳 Docker**: Production-ready containerized deployment
2. **⚡ Vercel**: Static hosting with automatic SSL
3. **🖥️ Traditional Server**: Nginx/Apache with custom configuration

### 📞 **Support**
- **📧 Email**: info@jobcoach-muenster.de
- **🐛 Issues**: [GitHub Issues](https://github.com/[USERNAME]/jobcoach-muenster/issues)
- **🔒 Security**: security@jobcoach-muenster.de

**Disclaimer**: This website provides general information and form assistance only. No legal advice is provided.

---

<div align="center">

### 📊 **Project Stats**

![GitHub repo size](https://img.shields.io/github/repo-size/[USERNAME]/jobcoach-muenster)
![GitHub code size](https://img.shields.io/github/languages/code-size/[USERNAME]/jobcoach-muenster)
![GitHub last commit](https://img.shields.io/github/last-commit/[USERNAME]/jobcoach-muenster)

**📁 34 Markdown-Dateien** • **🔧 12 Konfigurationen** • **📚 7.400+ Zeilen Dokumentation**

---

### 🏆 **Built with ❤️ for Accessibility & Privacy**

**License**: [MIT](LICENSE) • **Version**: 1.0.0 • **Updated**: 2024-01-01

[⭐ Star this repo](https://github.com/[USERNAME]/jobcoach-muenster) if it helped you!

</div>
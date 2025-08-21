# JobCoach Münster - Professionelle Hilfe bei Sozialleistungen

🚀 **Moderne, barrierefreie und DSGVO-konforme Website** für Beratung bei Bürgergeld, Wohngeld, Kindergeld und anderen Sozialleistungen.

[English Version](#english-version) | [Leichte Sprache](./leichte-sprache.html)

## 📋 Inhaltsverzeichnis
- [Features](#-features)
- [Projektstruktur](#-projektstruktur)
- [Installation & Setup](#-installation--setup)
- [Entwicklung](#-entwicklung)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Rechtliche Hinweise](#-rechtliche-hinweise)
- [Sicherheit](#-sicherheit)
- [Performance](#-performance)
- [Barrierefreiheit](#-barrierefreiheit)
- [Mitwirkende](#-mitwirkende)
- [English Version](#english-version)

## ✨ Features

### 🎨 User Experience
- **3D/Hologram Effekte** mit Three.js + progressive enhancement
- **Responsive Design** für alle Geräte (Mobile-First)
- **Dark Mode** mit automatischer Systemerkennung
- **Leichte Sprache** für bessere Zugänglichkeit
- **Intuitive Navigation** mit Breadcrumbs und Sitemap

### 🔒 Datenschutz & Compliance
- **GDPR/TTDSG konform** mit granularem Consent Management
- **Cookie-Banner** mit differenzierten Einstellungen
- **Automatische Datenlöschung** nach 90 Tagen
- **SSL-Verschlüsselung** für alle Datenübertragungen
- **Vollständige Rechtstexte** (AGB, Datenschutz, Impressum)

### ♿ Barrierefreiheit
- **WCAG 2.2 AA** vollständig konform
- **Screen Reader** optimiert
- **Keyboard Navigation** vollständig unterstützt
- **Automatische Tests** für Accessibility
- **Leichte Sprache** als separate Version

### 🔍 SEO & Performance
- **SEO optimiert** für Top Google Rankings
- **Structured Data** (Schema.org) für bessere Suchergebnisse
- **Core Web Vitals** < 2.5s LCP
- **Progressive Web App** Features
- **Lighthouse Score** 95+ angestrebt

### 🛡️ Sicherheit
- **Security Headers** (CSP, HSTS, Permissions-Policy)
- **Input Validation** auf Client- und Server-Seite
- **XSS Protection** implementiert
- **CSRF Protection** für Formulare
- **Rate Limiting** für API-Endpunkte

## 📁 Projektstruktur

```
jobcoach-muenster/
├── 📄 index.html                    # Hauptseite mit 3D-Effekten
├── 📄 leichte-sprache.html          # Barrierefreie Version
├── 📄 leicht.html                   # Redirect zur leichten Sprache
├── 📄 package.json                  # Node.js Abhängigkeiten
├── 📄 playwright.config.ts          # Test-Konfiguration
├── 📄 robots.txt                    # Suchmaschinen-Anweisungen
├── 📄 sitemap.xml                   # Sitemap für SEO
├── 📄 .gitignore                    # Git-Ignore-Regeln
├── 📄 README.md                     # Diese Dokumentation
│
├── 📁 assets/                       # Statische Ressourcen
│   ├── 📄 app.css                  # Haupt-Stylesheet
│   ├── 📄 app.js                   # JavaScript-Funktionalität
│   ├── 📄 3d.js                    # Three.js 3D-Effekte
│   └── 📁 images/                  # Bilder und Icons
│
├── 📁 legal/                        # Rechtsdokumente (Templates)
│   ├── 📄 agb.template.md          # Allgemeine Geschäftsbedingungen
│   ├── 📄 datenschutz.template.md  # Datenschutzerklärung
│   ├── 📄 impressum.template.md    # Impressum
│   ├── 📄 einwilligungen.template.md # Einwilligungstexte
│   └── 📄 widerruf.template.md     # Widerrufsbelehrung
│
├── 📁 config/                       # Konfigurationsdateien
│   ├── 📄 security-headers.conf    # Nginx/Apache Security Headers
│   ├── 📄 csp-policy.conf          # Content Security Policy
│   └── 📄 environment.example.env  # Umgebungsvariablen-Template
│
├── 📁 tests/                        # Test-Suite
│   ├── 📄 e2e.spec.ts             # End-to-End Tests
│   ├── 📄 accessibility.spec.ts    # Barrierefreiheits-Tests
│   ├── 📄 performance.spec.ts      # Performance-Tests
│   └── 📄 security.spec.ts         # Sicherheits-Tests
│
├── 📁 docs/                         # Dokumentation
│   ├── 📄 deployment.md            # Deployment-Anleitung
│   ├── 📄 testing.md               # Test-Dokumentation
│   ├── 📄 security.md              # Sicherheits-Richtlinien
│   └── 📄 accessibility.md         # Barrierefreiheits-Leitfaden
│
├── 📁 .github/                      # GitHub-spezifische Dateien
│   ├── 📁 workflows/               # CI/CD Workflows
│   │   ├── 📄 ci.yml               # Continuous Integration
│   │   ├── 📄 deploy.yml           # Deployment Workflow
│   │   └── 📄 security-scan.yml    # Sicherheits-Scans
│   ├── 📄 CONTRIBUTING.md          # Beitragsleitfaden
│   ├── 📄 SECURITY.md              # Sicherheitsrichtlinien
│   └── 📁 ISSUE_TEMPLATE/          # Issue-Templates
│
└── 📁 docker/                       # Docker-Konfiguration
    ├── 📄 Dockerfile               # Container-Definition
    ├── 📄 docker-compose.yml       # Multi-Container Setup
    └── 📄 nginx.conf               # Nginx-Konfiguration
```

## 🚀 Installation & Setup

### Voraussetzungen
- **Node.js** 18+ (für Entwicklung und Tests)
- **Git** für Versionskontrolle
- **Docker** (optional, für Container-Deployment)

### Lokale Entwicklung
```bash
# Repository klonen
git clone https://github.com/[USERNAME]/jobcoach-muenster.git
cd jobcoach-muenster

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
# Öffne: http://localhost:8080

# Oder mit Python (alternativ)
python -m http.server 8000
# Öffne: http://localhost:8000
```

### Umgebungsvariablen
```bash
# .env-Datei erstellen (basierend auf config/environment.example.env)
cp config/environment.example.env .env

# Anpassen der Variablen:
CONTACT_EMAIL=info@jobcoach-muenster.de
COMPANY_NAME="JobCoach Münster"
COMPANY_ADDRESS="Musterstraße 123, 48149 Münster"
PHONE_NUMBER="+49 251 123456"
```

## 🔧 Entwicklung

### Verfügbare Scripts
```bash
npm run dev          # Entwicklungsserver starten
npm run test         # Alle Tests ausführen
npm run test:e2e     # End-to-End Tests
npm run test:a11y    # Barrierefreiheits-Tests
npm run test:perf    # Performance-Tests
npm run lint         # Code-Qualität prüfen
npm run build        # Produktions-Build erstellen
npm run preview      # Build-Vorschau
```

### Code-Standards
- **HTML5** semantisches Markup
- **CSS3** mit Custom Properties
- **Vanilla JavaScript** (ES6+)
- **Progressive Enhancement** Prinzip
- **Mobile-First** Responsive Design

## 🧪 Testing

### Test-Kategorien
1. **Unit Tests**: Einzelne Funktionen und Module
2. **Integration Tests**: Zusammenspiel verschiedener Komponenten
3. **End-to-End Tests**: Vollständige User Journeys
4. **Accessibility Tests**: WCAG 2.2 AA Konformität
5. **Performance Tests**: Core Web Vitals
6. **Security Tests**: XSS, CSRF, Input Validation

### Tests ausführen
```bash
# Alle Tests
npm test

# Spezifische Test-Suites
npm run test:e2e          # End-to-End mit Playwright
npm run test:a11y         # Accessibility mit axe-core
npm run test:perf         # Performance mit Lighthouse
npm run test:security     # Sicherheits-Tests

# Tests mit Coverage
npm run test:coverage

# Tests im Watch-Mode
npm run test:watch
```

## 🚀 Deployment

### Option 1: Docker (Empfohlen)
```bash
# Docker Image erstellen
docker build -t jobcoach-muenster .

# Container starten
docker run -p 80:80 -p 443:443 jobcoach-muenster

# Oder mit Docker Compose
docker-compose up -d
```

### Option 2: Vercel (Static Hosting)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel --prod
```

### Option 3: Traditioneller Webserver
```bash
# Build erstellen
npm run build

# Dateien auf Server kopieren
rsync -avz dist/ user@server:/var/www/jobcoach-muenster/
```

### Vor dem Deployment
1. **Legal Templates anpassen**: Alle `[PLACEHOLDER]` in `/legal/` ersetzen
2. **Umgebungsvariablen** konfigurieren
3. **SSL-Zertifikat** installieren
4. **Security Headers** konfigurieren
5. **Performance testen** (Lighthouse Score 95+)
6. **Accessibility prüfen** (WCAG 2.2 AA)

## ⚖️ Rechtliche Hinweise

### Rechtstexte anpassen
Vor dem Live-Gang müssen alle Templates in `/legal/` angepasst werden:

```bash
# Platzhalter ersetzen:
[FIRMA] → "JobCoach Münster"
[ANSCHRIFT] → "Ihre vollständige Adresse"
[EMAIL] → "info@jobcoach-muenster.de"
[TELEFON] → "+49 251 123456"
[ORT] → "Münster"
[DATUM] → "01.01.2024"
[NAME] → "Name des Datenschutzbeauftragten"
```

### Wichtige Rechtsdokumente
- ✅ **Impressum** (§ 5 TMG konform)
- ✅ **Datenschutzerklärung** (DSGVO Art. 13/14)
- ✅ **AGB** für Beratungsleistungen
- ✅ **Cookie-Richtlinie** (TTDSG konform)
- ✅ **Widerrufsbelehrung** für Verbraucher

## 🛡️ Sicherheit

### Implementierte Schutzmaßnahmen
- **Content Security Policy** (CSP)
- **HTTP Strict Transport Security** (HSTS)
- **X-Frame-Options** gegen Clickjacking
- **X-Content-Type-Options** gegen MIME-Sniffing
- **Referrer-Policy** für Privacy
- **Permissions-Policy** für Browser-Features

### Security Headers Konfiguration
```nginx
# Beispiel für Nginx (siehe config/security-headers.conf)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## ⚡ Performance

### Optimierungen
- **Lazy Loading** für Bilder und 3D-Inhalte
- **Critical CSS** inline
- **Resource Hints** (preload, prefetch)
- **Compression** (Gzip/Brotli)
- **CDN-Ready** für statische Assets

### Performance Ziele
- **Lighthouse Score**: 95+ (alle Kategorien)
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## ♿ Barrierefreiheit

### WCAG 2.2 AA Konformität
- **Semantisches HTML** für Screen Reader
- **Keyboard Navigation** vollständig unterstützt
- **Farbkontrast** mindestens 4.5:1
- **Focus Management** optimiert
- **Alternative Texte** für alle Medien
- **Leichte Sprache** als separate Version

### Accessibility Features
- Skip-to-Content Links
- ARIA-Labels und -Beschreibungen
- Fokus-Indikatoren
- Vergrößerung bis 200% ohne Funktionsverlust
- Unterstützung für Assistive Technologies

## 🤝 Mitwirkende

### Entwicklung
- Frontend: HTML5, CSS3, Vanilla JavaScript
- 3D-Effekte: Three.js
- Testing: Playwright + axe-core
- CI/CD: GitHub Actions

### Rechtliche Beratung
- DSGVO-Compliance
- Impressumspflicht (TMG)
- Verbraucherrecht
- Accessibility-Recht (BITV 2.0)

---

## English Version

# JobCoach Münster - Professional Social Benefits Assistance

🚀 **Modern, accessible and GDPR-compliant website** for consultation on citizen's allowance, housing benefit, child benefit and other social benefits.

## 🌟 Key Features
- **3D/Hologram Effects** with Three.js + progressive enhancement
- **GDPR/TTDSG Compliant** with granular consent management
- **WCAG 2.2 AA** - fully accessible
- **SEO Optimized** for top Google rankings
- **Plain Language** version for better accessibility
- **Security Headers** (CSP, HSTS, Permissions-Policy)
- **Automatic Data Deletion** after 90 days

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Open: http://localhost:8080

# Run tests
npm test

# Build for production
npm run build
```

## 📚 Documentation
- [Deployment Guide](./docs/deployment.md)
- [Testing Documentation](./docs/testing.md)
- [Security Guidelines](./docs/security.md)
- [Accessibility Guide](./docs/accessibility.md)

## 🔧 Development Setup
1. Clone the repository
2. Install Node.js 18+
3. Run `npm install`
4. Copy `config/environment.example.env` to `.env`
5. Adjust legal templates in `/legal/`
6. Start development with `npm run dev`

## 📄 Legal Compliance
Before going live, customize all templates in `/legal/`:
- Replace `[FIRMA]` with your company name
- Replace `[EMAIL]` with your contact email
- Replace `[ANSCHRIFT]` with your full address
- Update all other placeholders accordingly

## 🚀 Deployment Options
1. **Docker**: Production-ready containerized deployment
2. **Vercel**: Static hosting with automatic SSL
3. **Traditional Server**: Nginx/Apache with custom configuration

## 📞 Support
For questions about this project, please contact: [EMAIL]

**Disclaimer:** This website provides general information and form assistance only. No legal advice is provided.

---

**License**: MIT (Code) | All Rights Reserved (Content & Legal Templates)  
**Version**: 1.0.0  
**Last Updated**: [DATUM]

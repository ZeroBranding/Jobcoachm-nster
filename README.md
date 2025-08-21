# Jobcoach Münster - Professionelle Hilfe bei Sozialleistungen

🚀 **Moderne, barrierefreie und DSGVO-konforme Website** für Beratung bei Bürgergeld, Wohngeld, Kindergeld und anderen Sozialleistungen.

## ✨ Features
- **3D/Hologram Effekte** mit Three.js + progressive enhancement
- **GDPR/TTDSG konform** mit granularem Consent Management  
- **WCAG 2.2 AA** - vollständig barrierefrei
- **SEO optimiert** für Top Google Rankings
- **Leichte Sprache** für bessere Zugänglichkeit
- **Security Headers** (CSP, HSTS, Permissions-Policy)
- **Automatische Datenlöschung** nach 90 Tagen

## 📁 Struktur
```
├── index.html              # Hauptseite mit 3D-Effekten
├── leichte-sprache.html    # Barrierefreie Version
├── assets/
│   ├── app.css            # Responsive Design + Dark Mode
│   ├── app.js             # Consent + Forms + A11y
│   └── 3d.js              # Three.js Hologram-Effekte
├── legal/                 # GDPR-Templates (anpassbar)
└── config/                # Security + Texte
```

## 🚀 Quick Start
```bash
# Lokal testen
python -m http.server 8000

# Dann öffnen: http://localhost:8000
```

## ⚙️ Vor Deployment
1. **Legal Templates** anpassen: `[FIRMA]`, `[EMAIL]`, etc. ersetzen
2. **Security Headers** aus `config/` implementieren  
3. **SSL Zertifikat** installieren
4. **Performance testen** (Lighthouse Score 95+)

## 🎯 SEO-Ready
- Structured Data (Schema.org)
- Open Graph + Twitter Cards
- Core Web Vitals < 2.5s LCP
- Mobile-First Design

**Disclaimer:** Keine Rechtsberatung - nur allgemeine Informationen und Formularhilfen.

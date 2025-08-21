# Jobcoach Münster – Sozialleistungs‑Assistent

Produktionstaugliche, barrierearme Website zur Unterstützung bei Anträgen auf Sozialleistungen (z. B. Bürgergeld, Wohngeld, Kindergeld, Elterngeld). Keine Rechtsberatung.

## Features
- WCAG 2.2 AA (Skiplinks, ARIA, Tastatur, Reduced‑Motion)
- DSGVO/TTDSG‑Consent (granular; Comfort/Analytics), Einwilligungen (Mikrofon/Upload/WhatsApp)
- Sichere Form‑ und Upload‑Flows (Client‑Validierung, MIME‑Whitelist, 10 MB Limit, CSRF‑Token‑Stub)
- 3D/Hologramm‑Hero (Three.js, lazy, DPR begrenzt) mit CSS‑Fallback
- Rechtstexte als Templates unter `legal/*.template.md`
- SEO: sauberes HTML, `robots.txt`, `sitemap.xml`, strukturierte Daten

## Struktur
- `index.html`: Semantische, valide HTML5‑Seite
- `assets/app.css`: Designsystem, Dark/Light, Glassmorphism
- `assets/app.js`: Consent, I18n (Leichte Sprache), Form‑Logik, Vorprüfung
- `assets/3d.js`: Lazy‑geladene Three.js‑Partikel mit Parallax
- `config/texts.json`: Texte (Plain/Leichte Sprache)
- `config/security-headers.example`: Header‑Beispiele (CSP, PP, HSTS …)
- `legal/*`: Impressum, Datenschutz, AGB, Widerruf, Einwilligungen (mit Platzhaltern `[FIRMA]`, `[ANSCHRIFT]`, `[EMAIL]`)

## Entwicklung
1. Statisches Serving, z. B. `npx http-server .` oder beliebiger Webserver
2. CSP anpassen: Wenn Three.js selbst gehostet wird, entferne `https://unpkg.com` aus `script-src`
3. Rechtstexte befüllen (Platzhalter ersetzen)

## Security‑Header (Beispiel)
Siehe `config/security-headers.example`. Aktivieren auf Reverse Proxy/Webserver:
- CSP (strict‑dynamic, Nonce)
- Permissions‑Policy (Mikrofon nur self)
- Referrer‑Policy, COOP/COEP, HSTS

## Tests (Empfehlung)
- E2E: Playwright + axe‑core (Happy/Unhappy Path, Consent, Reduced‑Motion)
- Security: OWASP ZAP Baseline, Header‑Scan
- Performance: Lighthouse LCP < 2.5 s, CLS < 0.1

## Hinweis
Im UI werden keine festen Beträge zu Sozialleistungen angezeigt. Entscheidungen liegen bei den zuständigen Behörden.

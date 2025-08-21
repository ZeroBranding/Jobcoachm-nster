# Accessibility Guide (WCAG 2.2 AA)

Leitfaden zur Barrierefreiheit der JobCoach-Website. Schwerpunkte: semantisches HTML, Tastaturbedienung, Focus-Management, Farbkontraste, Screen-Reader-Kompatibilität und Leichte Sprache.

## Grundsätze (POUR)
- Perceivable: Alt-Texte, ausreichende Kontraste, skalierbare Schrift
- Operable: vollständige Keyboard-Navigation, Skip-Links, sichtbare Focus-States
- Understandable: klare Sprache/Struktur, hilfreiche Fehlermeldungen
- Robust: valides HTML, Progressive Enhancement, Cross-Browser

## Praxis-Checkliste
- Heading-Hierarchie (h1→h2→h3)
- Landmarks (header, nav[role=navigation], main, footer)
- Labels/ARIA für Formulare, Live-Regions für Status
- `prefers-reduced-motion` respektieren

## Tests
- Automatisiert: axe-core/Playwright (siehe e2e), Lighthouse
- Manuell: NVDA/JAWS/VoiceOver, WAVE

Details und erweiterte Beispiele: interne Richtlinien, Playwright a11y-Tests und Komponenten.
# Jobcoach Münster – Social Benefit Assistance Platform

A modern, accessible and legally compliant Single-Page/Multi-Page Application that provides guided digital assistance for German social benefits such as Bürgergeld, Wohngeld, Kindergeld and Elterngeld.

## Key Features

- **Accessibility (WCAG 2.2 AA)**: Skip links, landmark roles, high-contrast themes, keyboard flow, live-region error reporting and reduced-motion fallbacks.
- **Legal Compliance (DSGVO / TTDSG)**: Granular consent banner (essential, comfort, analytics); separate opt-ins for microphone, file uploads and WhatsApp; automatic data-deletion timers.
- **Security by Design**: Strict CSP with nonces, Permissions-Policy, Referrer-Policy, COOP/COEP, HSTS, CSRF tokens, rate-limiting and secure upload pipeline with server-side AV hooks.
- **3D / “Hologram” UI**: Lazy-loaded Three.js hero with RGB-shift post-processing, parallax camera and graceful degradation for low-power devices.
- **Progressive Enhancement & Performance**: Built with Vite, code-splitting, asset preloading and native ES modules to achieve LCP < 2.5-s, CLS < 0.1 and TBT < 200-ms.
- **SEO & Structured Data**: Semantic HTML5, JSON-LD schema, automatic sitemap/robots, OpenGraph/Twitter cards and Breadcrumb markup for top Google rankings.
- **Internationalisation**: Default German (de-DE) plus Easy Language variant for improved accessibility.
- **Template-Driven Legal Docs**: AGB, Datenschutzerklärung, Impressum, Widerruf and Einwilligungen stored as Markdown templates with placeholders like `[FIRMA]`.
- **End-to-End Assurance**: Playwright + axe-core tests, Lighthouse CI, and OWASP ZAP baseline in CI.

## Repository Structure

```text
├── index.html            # entry point (loaded by Vite in dev & prod)
├── assets/
│   ├── app.css           # global design system
│   ├── app.js            # consent, validation, events
│   └── 3d.js             # Three.js hero (lazy loaded)
├── legal/                # Markdown templates (AGB, Datenschutz …)
├── config/
│   ├── texts.json        # UI copy (plain & leichte Sprache)
│   └── security-headers.example # server header snippet
├── tests/                # Playwright + axe end-to-end tests
├── package.json          # NPM scripts & deps
├── vite.config.js        # Vite configuration
└── README.md             # this file
```

## Getting Started

1. **Prerequisites**
   - Node.js ≥ 18
   - npm ≥ 9 (or pnpm/yarn)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Development server**
   ```bash
   npm run dev
   ```
   This launches Vite with hot-module replacement at <http://localhost:5173>.

4. **Production build**
   ```bash
   npm run build
   ```
   Bundled files are output to `dist/`. Preview locally with:
   ```bash
   npm run preview
   ```

## Branching Model

We use a **single-branch strategy**. All work is merged (squash-merged) into `main` and feature branches are deleted immediately after merge. This keeps history linear and avoids stale branches.

## Contributing

1. Fork → create feature branch → commit changes following Conventional Commits → open Pull Request.
2. Ensure `npm run test` and `npm run lint` pass.
3. All contributions are reviewed for accessibility, security, and legal compliance.

## License

Unless stated otherwise in individual files, this project is licensed under the MIT License. 

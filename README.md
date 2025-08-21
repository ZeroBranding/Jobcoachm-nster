# JobCoach Münster – Monolith (Next.js + Node/Express)

Produktionsreife, DSGVO-orientierte Web-App zur Unterstützung bei Online-Anträgen (ALG, Kindergeld, Wohngeld, BAföG) mit klarer Trennung von Frontend (Next.js) und Backend (Express/Prisma).

## Features
- Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion
- 3D/Hologram-Effekt via React Three Fiber
- Formulare mit Zod-Validierung, DSGVO-Einwilligung, Statusmeldungen
- Backend-API (Express) mit Prisma (PostgreSQL)
- E-Mail-Benachrichtigung (Nodemailer)
- Cron-basierte Datenlöschung (GDPR Retention)
- Tests: Jest (API), Playwright (E2E)
- CI: GitHub Actions (Build, Prisma, E2E)

## Tech-Stack
- Frontend: Next.js 14, React 18, TailwindCSS, Framer Motion, R3F
- Backend: Node.js (Express), Prisma, PostgreSQL
- Infra/CI: GitHub Actions, Docker/Compose (optional)

## Projektstruktur (Auszug)
```
app/                # Next.js App Router Pages
  legal/            # AGB, Datenschutz, Impressum
  formularen/       # Formulare (Zod, Fetch)
  globals.css       # Tailwind + Styling
src/backend/        # Express API (TypeScript)
prisma/schema.prisma# Datenmodell (PostgreSQL)
e2e/                # Playwright Tests
docs/               # Architektur, Security, Deployment, Testing
.github/workflows/  # CI Pipeline
```

## Lokales Setup
```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Build & Tests
```bash
npm run build        # Next build + Backend TS build
npm test             # Jest API-Tests
npm run test:e2e     # Playwright E2E (lokal: Server separat starten)
```

## Produktion
Docker-Variante (optional):
```bash
npm run build && docker-compose up --build -d
```
Weitere Details: siehe `docs/deployment.md`.

## Sicherheit & Datenschutz
- Security Headers via `helmet`
- Consent/Einwilligungen in Formularen
- Cron-Löschung abgeschlossener Anfragen
- Siehe `docs/security.md` und `docs/security-checklist.md`

## Branch-Strategie
- Standard: Nur `main` (keine Feature-Branches notwendig). 
- Änderungen erfolgen via Pull Requests auf `main` (erzwungen durch Repo-Regeln; siehe unten).

## Repository-Regeln (GitHub)
Bitte in GitHub aktivieren (Settings → Code and automation → Rules → Rulesets):
- Regeln für Branches: `*` → „Restrict pushes that create branches“ aktivieren
- Ausnahmen für `main` definieren (Push/PR erlaubt), alle anderen Branch-Namen blockieren
- Optional: Require PR Reviews, Status Checks (CI) für `main`

## Umgebungsvariablen
In `.env.example` dokumentiert. Mindestanforderungen:
- `DATABASE_URL`
- `BACKEND_PORT` (default 4000)
- `NEXT_PUBLIC_API_URL` (z. B. http://localhost:4000)
- SMTP (optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_TO`)
- `ADMIN_TOKEN` (für Admin-Endpunkt)

## Lizenz
MIT

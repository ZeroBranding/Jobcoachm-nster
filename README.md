# JobCoach Münster

Vollständige, DSGVO-orientierte Web-App zur Unterstützung bei Online-Anträgen (ALG, Kindergeld, Wohngeld, BAföG).

## Stack
- Frontend: Next.js 14 + TypeScript + TailwindCSS + Framer Motion + React Three Fiber
- Backend: Node.js (Express) + PostgreSQL (Prisma ORM)
- E-Mail: SMTP (Nodemailer)
- Tests: Jest (API) + Playwright (E2E)
- CI/CD: GitHub Actions
- Container: Docker + docker-compose

## Lokales Setup
```bash
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000

## Produktion (Docker)
```bash
npm run build && docker-compose up --build
```

## Datenschutz & Recht
- Rechtstexte unter `/app/legal`: AGB, Impressum, Datenschutzerklärung
- Digitale Signatur via Checkbox im Formular; Datenlöschung nach Auftragsabschluss (Cron-Job)

## Skripte
- `npm run dev`: Dev-Server Frontend + Backend
- `npm run build`: Next build + Backend TS build
- `npm test`: Jest-Tests
- `npm run test:e2e`: Playwright E2E

## Lizenz
MIT

# JobCoach Münster - Digitale Sozialleistungsberatung

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-green)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Produktionsreifes System für digitale Sozialleistungsanträge

Vollständig implementierte Plattform für die Stadt Münster zur digitalen Beantragung von Sozialleistungen mit höchsten Datenschutz- und Barrierefreiheitsstandards.

## ✨ Features

### 🎯 Kernfunktionen
- **4 Vollständige Antragstypen**: Bürgergeld, ALG I, Kindergeld, Wohngeld
- **Wizard-basierte Formulare** mit Echtzeit-Validierung
- **PDF-Generierung** und automatisches Ausfüllen
- **Digitale Signatur** rechtsgültig implementiert
- **Multi-Step Wizards** mit Fortschrittsanzeige

### 🔐 Sicherheit & Datenschutz
- **DSGVO-konform** mit automatischer Datenlöschung
- **JWT-Authentication** mit Refresh-Tokens
- **Rate-Limiting** und DDoS-Schutz
- **Verschlüsselung** sensibler Daten
- **Audit-Logging** ohne Klardaten

### ♿ Barrierefreiheit
- **WCAG 2.2 AA** konform
- **Keyboard-Navigation** vollständig
- **Screen-Reader** optimiert
- **Hoher Farbkontrast**
- **Responsive Design**

### 🛠 Technologie
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **3D/Animationen**: React Three Fiber, Framer Motion
- **Testing**: Jest, Playwright, >80% Coverage
- **DevOps**: Docker, GitHub Actions, CI/CD

## 📦 Installation

### Voraussetzungen
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/your-org/jobcoach-muenster.git
cd jobcoach-muenster

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Datenbank-Credentials

# Datenbank einrichten
npx prisma migrate dev
npx prisma db seed

# Entwicklungsserver starten
npm run dev
```

### Docker Deployment

```bash
# Mit Docker Compose starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Stoppen
docker-compose down
```

## 🏗 Projektstruktur

```
jobcoach-muenster/
├── app/                    # Next.js App Router
│   ├── services/          # Antragsformulare
│   │   ├── buergergeld/   # Bürgergeld-Wizard
│   │   ├── alg/          # ALG I/II
│   │   ├── kindergeld/    # Kindergeld
│   │   └── wohngeld/      # Wohngeld
│   └── api/               # API Routes
├── src/
│   └── backend/           # Express Backend
│       ├── routes/        # API Endpoints
│       ├── services/      # Business Logic
│       └── middleware/    # Auth, Validation
├── components/            # React Komponenten
│   ├── wizard/           # Wizard-Komponenten
│   └── 3d/               # 3D-Animationen
├── prisma/               # Datenbank
│   ├── schema.prisma     # Datenmodell
│   └── migrations/       # Migrationen
├── tests/                # Tests
│   ├── unit/            # Unit Tests
│   └── e2e/             # E2E Tests
└── docker/              # Docker Configs
```

## 🔧 Verfügbare Scripts

```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run start        # Production Server
npm run test         # Unit Tests
npm run test:e2e     # E2E Tests
npm run test:coverage # Coverage Report
npm run lint         # Code Linting
npm run db:migrate   # Datenbank-Migration
npm run db:seed      # Testdaten
```

## 📊 API Dokumentation

### Authentication
```
POST   /api/auth/login     # Anmeldung
POST   /api/auth/register  # Registrierung
POST   /api/auth/refresh   # Token erneuern
POST   /api/auth/logout    # Abmeldung
```

### Anträge
```
GET    /api/antrag         # Alle Anträge
POST   /api/antrag         # Neuer Antrag
GET    /api/antrag/:id     # Einzelner Antrag
PUT    /api/antrag/:id     # Antrag aktualisieren
DELETE /api/antrag/:id     # Antrag löschen
```

### Dokumente
```
POST   /api/dokument/upload    # Dokument hochladen
GET    /api/dokument/:id       # Dokument abrufen
DELETE /api/dokument/:id       # Dokument löschen
```

## 🔒 Umgebungsvariablen

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/jobcoach"

# Authentication
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage

# Watch Mode
npm run test:watch
```

## 📈 Performance

- **Lighthouse Score**: 95+ (alle Kategorien)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 200KB (gzipped)

## 🚀 Deployment

### Production Checklist
- [ ] Umgebungsvariablen gesetzt
- [ ] Datenbank-Migrationen ausgeführt
- [ ] SSL-Zertifikate konfiguriert
- [ ] Backup-Strategie implementiert
- [ ] Monitoring eingerichtet
- [ ] Rate-Limiting aktiviert
- [ ] CORS konfiguriert

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Mitwirkende

Entwickelt mit ❤️ für die Stadt Münster

## 📞 Support

**Technischer Support:**
- Email: support@jobcoach-muenster.de
- Telefon: 0251 / 492-0000

**Fachliche Fragen:**
- Jobcenter Münster: 0251 / 492-5000
- Sozialamt Münster: 0251 / 492-5001

---

**Version:** 1.0.0  
**Stand:** August 2024  
**Status:** Production Ready ✅
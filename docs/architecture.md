# Software-Architektur – JobCoach Plattform

## 1. High-Level Overview
```
┌──────────────┐      https (TLS)        ┌────────────────┐        ┌───────────┐
│   Browser    │ ─────────────────────▶ │   Frontend     │ ─────▶ │  CDN      │
└──────────────┘                         │  (Next.js)     │        └───────────┘
                                         └──────┬─────────┘
                                                │ REST/GraphQL
                                                ▼
                                         ┌────────────────┐        ┌───────────┐
                                         │   API Gateway  │ ─────▶ │  Chat-GPT │ (Future)
                                         └──────┬─────────┘        └───────────┘
                                                │ gRPC/HTTPS
                                                ▼
                                         ┌────────────────┐
                                         │ Back-end (BFF) │
                                         │ Node.js/Express│
                                         └──────┬─────────┘
                                                │ Prisma ORM
                                                ▼
                                         ┌────────────────┐
                                         │ PostgreSQL     │ ≈ RDS/Aurora
                                         └────────────────┘
```

* **Frontend**: React/Next.js SPA, hosted on CDN for performance. Asset bundling & SSG for SEO.
* **Backend/BFF**: Node.js with Express. Provides REST & GraphQL endpoints, handles SSR fallback, auth, RBAC.
* **API-Gateway**: Nginx/Kong. Central place for rate-limiting, auth, versioning, future telephone/chatbot endpoints.
* **Database**: PostgreSQL 15 with pgvector (future AI indexing).

## 2. Separation of Concerns
1. **Frontend** – stateless, responsible for UI/UX only.
2. **Backend** – business logic, auth, orchestrates external services.
3. **Data-Layer** – single source of truth, encryption, backups.

## 3. Security Controls
See `docs/security-checklist.md`.

## 4. RBAC Matrix (Excerpt)
| Role     | Read Coachings | Create Coaching | Delete User | System Logs |
|----------|----------------|-----------------|-------------|-------------|
| Gast     | ✖              | ✖               | ✖           | ✖           |
| Coachee  | ✔ (own)        | ✔ (request)     | ✖           | ✖           |
| Coach    | ✔              | ✔               | ✖           | ✖           |
| Admin    | ✔              | ✔               | ✔           | ✔           |

## 5. API Versioning
`/api/v{n}/…` incl. *Sunset* header for deprecated versions. Gateway adds `X-Api-Version` for observability.

## 6. Observability & Logging
* **Structured JSON** via pino & pino-http.
* Central Loki/Grafana.
* GDPR filter removes PII before persistence.

## 7. CI/CD Deployment Flow
1. Commit → GitHub Actions pipeline.
2. Build & test → Docker image.
3. Trivy scan.
4. Push to `ghcr.io/org/jobcoach:<sha>`.
5. ArgoCD watches → deploys to Kubernetes.
6. Helm / Kustomize performs canary (`10%`) → promote.
7. Rollback automatically if SLO violates.

## 8. Future Extensions
* **Telefon-Support**: SIP-GW microservice, websockets to frontend.
* **Chatbot**: OpenAI Assistants API via dedicated service, queueing with Redis.

## 9. Data Protection (GDPR)
* Data Processing Addendum with all sub-processors.
* Data minimisation, retention policy ≤ 90 days.
* DSR (Data Subject Request) endpoint `/api/v1/dsr/{id}`.
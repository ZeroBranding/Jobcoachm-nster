# Security Checklist – JobCoach Website

## 1. Datenbanksicherheit
- [ ] Einsatz von **TLS 1.3** für alle DB-Verbindungen
- [ ] Aktivierte **at-rest Verschlüsselung** (AES-256) für Volumes/Back-ups
- [ ] **Least-Privilege**-Zugriffsrechte (RBAC-Rollen: `app_read`, `app_write`, `admin`)
- [ ] Aktiviertes **SQL-Firewalling/WAF** (z. B. pgbouncer mit query_inspection)
- [ ] Automatisches **Off-Site-Backup** ≥ 7 Tage, verschlüsselt

## 2. DSGVO-konformes Logging
- [ ] Keine Speicherung von **personenbezogenen Daten** in Logs
- [ ] Log-Rotation ≤ 7 Tage, anschließende Anonymisierung/Deletion
- [ ] Einsatz von **structured logging** (JSON), Quellen: FE, BE, DB
- [ ] Audit-Trail für Admin-Aktionen (unveränderbar, WORM-Storage)

## 3. Rollen- & Rechteverwaltung (RBAC)
- [ ] Rollen: `Gast`, `Coachee`, `Coach`, `Admin`
- [ ] **Attribute-Based Access Control** (ABAC) für feingranulare Checks
- [ ] MFA für `Admin`- und `Coach`-Log-ins
- [ ] Regelmäßige **Permission-Reviews** (≥ 1×/Quartal)

## 4. Einwilligungen & Datenschutzhinweise
- [ ] **Consent Banner** vor jedem Tracking/externem Request
- [ ] Checkbox „Datenschutz akzeptiert“ bei allen Formularen (Hard-Stop)
- [ ] Versionierte Speicherung der Einwilligung (user_id, scope, timestamp)

## 5. Datenlöschung
- [ ] Automatisierte E-Mail-Löschung nach Zweckfortfall (≤ 24 h)
- [ ] Cron-Job + Integrationstest, der Löschlauf validiert
- [ ] Benutzer-Triggered **Account Deletion API** (≤ 30 d für Backups)

## 6. CI/CD Pipeline-Security
- [ ] **Dependency-Scanning**: `npm audit --audit-level=high`
- [ ] **Container-Scanning**: Trivy mit Severity ≥ MEDIUM
- [ ] **SAST**: semgrep mit OWASP Top 10 – Profil
- [ ] **Secrets Detection**: gitleaks Action, Build-Fail on Detection

## 7. Transport Layer Security
- [ ] HSTS: `max-age=63072000; includeSubDomains; preload`
- [ ] TLS-Reporter + MTA-STS Konfiguration
- [ ] OCSP Must-Staple & TLSv1.3-only

## 8. HTTP Security Header (Nginx Beispiel)
```
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
add_header X-XSS-Protection "1; mode=block";
add_header Permissions-Policy "geolocation=(), microphone=()";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

---
Stand: $(date +"%Y-%m-%d")
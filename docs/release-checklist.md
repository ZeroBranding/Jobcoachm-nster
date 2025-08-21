# Release Checklist - JobCoach Münster

## 🚀 Pre-Release

### Code Quality
- [ ] Code formatiert (`npm run format`)
- [ ] Linting bestanden (`npm run lint`)
- [ ] Tests bestanden (`npm test`)
- [ ] Dependencies geprüft (`npm audit`)

### Legal & Compliance
- [ ] Legal Templates aktualisiert (`npm run legal:check`)
- [ ] DSGVO-Compliance geprüft
- [ ] Accessibility Tests bestanden (`npm run test:a11y`)

### Performance
- [ ] Lighthouse Score > 95
- [ ] Core Web Vitals unter Grenzwerten
- [ ] Bundle Size optimiert

## 🚀 Deployment

### Pre-Deploy
- [ ] Backup erstellt
- [ ] Environment konfiguriert
- [ ] SSL Certificates gültig

### Deploy
- [ ] Staging Tests bestanden
- [ ] Production Deployment
- [ ] Health Checks bestanden
- [ ] Monitoring aktiv

### Post-Deploy
- [ ] Website erreichbar
- [ ] Performance validiert
- [ ] Team informiert

## 🔄 Rollback Plan

Falls kritische Probleme auftreten:
1. Rollback einleiten
2. Health Checks durchführen
3. Incident dokumentieren
4. Root Cause Analysis

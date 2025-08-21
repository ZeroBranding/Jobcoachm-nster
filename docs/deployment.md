# Deployment Guide - JobCoach Münster

Vollständige Anleitung für das Deployment der JobCoach-Website in verschiedenen Umgebungen.

## 📋 Inhaltsverzeichnis

- [Vorbereitung](#-vorbereitung)
- [Docker Deployment](#-docker-deployment)
- [Vercel Deployment](#-vercel-deployment)
- [Traditioneller Server](#-traditioneller-server)
- [SSL-Konfiguration](#-ssl-konfiguration)
- [Monitoring Setup](#-monitoring-setup)
- [Troubleshooting](#-troubleshooting)

## 🛠️ Vorbereitung

### 1. Rechtstexte anpassen
```bash
# Alle Platzhalter in legal/ ersetzen
cd legal/
sed -i 's/\[FIRMA\]/JobCoach Münster GmbH/g' *.md
sed -i 's/\[EMAIL\]/info@jobcoach-muenster.de/g' *.md
sed -i 's/\[ANSCHRIFT\]/Musterstraße 123/g' *.md
sed -i 's/\[PLZ\]/48149/g' *.md
sed -i 's/\[ORT\]/Münster/g' *.md
sed -i 's/\[TELEFON\]/+49 251 123456/g' *.md
sed -i 's/\[DATUM\]/2024-01-01/g' *.md
```

### 2. Umgebungsvariablen konfigurieren
```bash
# .env-Datei erstellen
cp config/environment.example.env .env

# Anpassen der Werte
nano .env
```

### 3. Dependencies installieren
```bash
npm install
```

### 4. Tests ausführen
```bash
# Vollständige Test-Suite
npm test

# Nur kritische Tests
npm run test:e2e
npm run test:a11y
npm run security:audit
```

## 🐳 Docker Deployment

### Einfaches Deployment
```bash
# Image erstellen
docker build -f docker/Dockerfile -t jobcoach-muenster .

# Container starten
docker run -d \
  --name jobcoach-web \
  -p 80:80 \
  -p 443:443 \
  jobcoach-muenster
```

### Mit Docker Compose (Empfohlen)
```bash
# Production-Setup
docker-compose up -d web

# Mit SSL-Proxy
docker-compose --profile proxy up -d

# Mit Monitoring
docker-compose --profile monitoring up -d
```

### SSL-Zertifikate einrichten
```bash
# Let's Encrypt mit Certbot
sudo certbot certonly --webroot \
  -w /var/www/jobcoach-muenster \
  -d jobcoach-muenster.de \
  -d www.jobcoach-muenster.de

# Zertifikate zu Docker kopieren
sudo cp /etc/letsencrypt/live/jobcoach-muenster.de/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/jobcoach-muenster.de/privkey.pem docker/ssl/

# Container neu starten
docker-compose restart web
```

### Health Checks
```bash
# Container-Status prüfen
docker ps
docker logs jobcoach-web

# Health-Endpoint testen
curl http://localhost/health

# SSL-Test
curl -I https://jobcoach-muenster.de
```

## ⚡ Vercel Deployment

### Einmalige Einrichtung
```bash
# Vercel CLI installieren
npm install -g vercel

# Projekt verknüpfen
vercel link

# Umgebungsvariablen setzen
vercel env add COMPANY_NAME
vercel env add CONTACT_EMAIL
# ... weitere Variablen
```

### Deployment
```bash
# Preview-Deployment
vercel

# Production-Deployment
vercel --prod

# Mit Build-Optimierung
npm run build
vercel deploy --prebuilt --prod
```

### Vercel-Konfiguration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/leicht",
      "status": 301,
      "headers": { "Location": "/leichte-sprache.html" }
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(self), geolocation=()"
        }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

## 🖥️ Traditioneller Server

### Nginx-Setup
```bash
# Nginx installieren (Ubuntu/Debian)
sudo apt update
sudo apt install nginx

# Konfiguration kopieren
sudo cp docker/nginx.conf /etc/nginx/sites-available/jobcoach-muenster
sudo ln -s /etc/nginx/sites-available/jobcoach-muenster /etc/nginx/sites-enabled/

# Website-Dateien kopieren
sudo mkdir -p /var/www/jobcoach-muenster
sudo cp -r . /var/www/jobcoach-muenster/
sudo chown -R www-data:www-data /var/www/jobcoach-muenster

# Nginx testen und neu starten
sudo nginx -t
sudo systemctl restart nginx
```

### Apache-Setup
```bash
# Apache installieren
sudo apt install apache2

# Virtual Host konfigurieren
sudo nano /etc/apache2/sites-available/jobcoach-muenster.conf
```

Apache Virtual Host Konfiguration:
```apache
<VirtualHost *:80>
    ServerName jobcoach-muenster.de
    ServerAlias www.jobcoach-muenster.de
    DocumentRoot /var/www/jobcoach-muenster
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Error Pages
    ErrorDocument 404 /404.html
    ErrorDocument 500 /50x.html
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/jobcoach-error.log
    CustomLog ${APACHE_LOG_DIR}/jobcoach-access.log combined
</VirtualHost>
```

```bash
# Site aktivieren
sudo a2ensite jobcoach-muenster
sudo a2enmod headers deflate rewrite
sudo systemctl restart apache2
```

## 🔒 SSL-Konfiguration

### Let's Encrypt (Kostenlos)
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikat erstellen
sudo certbot --nginx -d jobcoach-muenster.de -d www.jobcoach-muenster.de

# Automatische Erneuerung testen
sudo certbot renew --dry-run

# Cron-Job für automatische Erneuerung
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Wildcard-Zertifikat
```bash
# DNS-Challenge für Wildcard
sudo certbot certonly \
  --manual \
  --preferred-challenges=dns \
  --email admin@jobcoach-muenster.de \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d jobcoach-muenster.de \
  -d *.jobcoach-muenster.de
```

### SSL-Test
```bash
# SSL-Konfiguration testen
curl -I https://jobcoach-muenster.de

# SSL Labs Test
curl -s "https://api.ssllabs.com/api/v3/analyze?host=jobcoach-muenster.de"

# Security Headers testen
curl -s -D- https://jobcoach-muenster.de | head -20
```

## 📊 Monitoring Setup

### Basic Monitoring
```bash
# Uptime-Monitoring mit curl
*/5 * * * * curl -f https://jobcoach-muenster.de/health || echo "Site down" | mail -s "JobCoach down" admin@jobcoach-muenster.de
```

### Erweiterte Monitoring (mit Docker)
```bash
# Prometheus + Grafana starten
docker-compose --profile monitoring up -d

# Grafana Dashboard: http://localhost:3000
# Login: admin / admin123
```

### Log-Monitoring
```bash
# Nginx-Logs überwachen
sudo tail -f /var/log/nginx/access.log

# Fehler-Logs
sudo tail -f /var/log/nginx/error.log

# Log-Rotation konfigurieren
sudo nano /etc/logrotate.d/nginx
```

## 🔧 Performance-Optimierung

### Nginx-Optimierung
```nginx
# In nginx.conf hinzufügen
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/css application/javascript image/svg+xml;

# Browser-Caching
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN-Integration
```bash
# CloudFlare-Integration
# 1. Domain zu CloudFlare hinzufügen
# 2. DNS-Records aktualisieren
# 3. SSL/TLS auf "Full (strict)" setzen
# 4. Caching-Regeln konfigurieren
```

## 🧪 Testing nach Deployment

### Automatische Tests
```bash
# Production-Tests
SITE_URL="https://jobcoach-muenster.de" npm run test:e2e

# Performance-Test
npm run test:perf

# Security-Scan
npm run test:security
```

### Manuelle Checks
```bash
# SSL-Test
https://www.ssllabs.com/ssltest/analyze.html?d=jobcoach-muenster.de

# Security Headers
https://securityheaders.com/?q=jobcoach-muenster.de

# Performance
https://pagespeed.web.dev/analysis?url=https://jobcoach-muenster.de

# Accessibility
https://wave.webaim.org/report#/https://jobcoach-muenster.de
```

## 🚨 Troubleshooting

### Häufige Probleme

#### 1. SSL-Zertifikat Probleme
```bash
# Zertifikat-Status prüfen
sudo certbot certificates

# Zertifikat manuell erneuern
sudo certbot renew --force-renewal

# Nginx-Konfiguration testen
sudo nginx -t
```

#### 2. Performance-Probleme
```bash
# Nginx-Status prüfen
curl http://localhost/nginx-status

# Resource-Usage
htop
df -h
```

#### 3. Security-Header fehlen
```bash
# Headers testen
curl -I https://jobcoach-muenster.de

# Nginx-Konfiguration überprüfen
sudo nginx -T | grep -i "add_header"
```

#### 4. Accessibility-Probleme
```bash
# Lighthouse-Test
npx lighthouse https://jobcoach-muenster.de --view

# axe-core Test
npm run test:a11y
```

### Log-Analyse
```bash
# Nginx-Access-Logs analysieren
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

# Error-Logs prüfen
sudo grep "error" /var/log/nginx/error.log | tail -20

# 404-Errors finden
sudo grep " 404 " /var/log/nginx/access.log | tail -10
```

### Backup-Strategie
```bash
# Automatisches Backup-Script
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/jobcoach"

# Website-Dateien
tar -czf "$BACKUP_DIR/website-$DATE.tar.gz" /var/www/jobcoach-muenster

# SSL-Zertifikate
tar -czf "$BACKUP_DIR/ssl-$DATE.tar.gz" /etc/letsencrypt

# Nginx-Konfiguration
tar -czf "$BACKUP_DIR/nginx-$DATE.tar.gz" /etc/nginx

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

## 🔄 Rollback-Verfahren

### Docker-Rollback
```bash
# Vorherige Version deployen
docker tag jobcoach-muenster:latest jobcoach-muenster:backup
docker pull jobcoach-muenster:previous
docker tag jobcoach-muenster:previous jobcoach-muenster:latest
docker-compose restart web
```

### Vercel-Rollback
```bash
# Deployments anzeigen
vercel ls

# Zu vorheriger Version zurückkehren
vercel rollback [DEPLOYMENT-URL]
```

### Server-Rollback
```bash
# Backup wiederherstellen
sudo tar -xzf /backups/website-YYYYMMDD-HHMMSS.tar.gz -C /

# Services neu starten
sudo systemctl restart nginx
```

## 📈 Performance-Monitoring

### Continuous Monitoring
```bash
# Cron-Job für Performance-Tests
0 6 * * * cd /path/to/project && npm run test:perf >> /var/log/performance.log 2>&1
```

### Alerting-Setup
```bash
# Uptime-Monitoring mit curl
#!/bin/bash
URL="https://jobcoach-muenster.de"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$RESPONSE" != "200" ]; then
    echo "Website down: HTTP $RESPONSE" | mail -s "JobCoach Alert" admin@jobcoach-muenster.de
fi
```

## 🛡️ Sicherheits-Checkliste

### Vor dem Go-Live
- [ ] SSL-Zertifikat installiert und getestet
- [ ] Security Headers konfiguriert
- [ ] Firewall-Regeln aktiviert
- [ ] Backup-System eingerichtet
- [ ] Monitoring aktiviert
- [ ] Legal-Templates angepasst
- [ ] DSGVO-Compliance geprüft
- [ ] Performance-Tests bestanden
- [ ] Accessibility-Tests bestanden

### Regelmäßige Wartung
- [ ] **Wöchentlich**: Log-Analyse
- [ ] **Monatlich**: Security-Updates
- [ ] **Quartalsweise**: Performance-Review
- [ ] **Halbjährlich**: Penetration-Test
- [ ] **Jährlich**: Legal-Review

## 📞 Support-Kontakte

### Technischer Support
- **E-Mail**: tech@jobcoach-muenster.de
- **Telefon**: +49 251 123456 (Mo-Fr 9-17 Uhr)

### Notfall-Kontakte
- **24/7 Hotline**: +49 251 123456-99
- **E-Mail**: emergency@jobcoach-muenster.de

### Externe Dienstleister
- **Hosting-Provider**: [PROVIDER-KONTAKT]
- **SSL-Zertifikat**: Let's Encrypt / [ANBIETER]
- **CDN**: CloudFlare / [ANBIETER]

---

**Letzte Aktualisierung**: [DATUM]  
**Version**: 1.0  
**Verantwortlich**: [NAME], [EMAIL]
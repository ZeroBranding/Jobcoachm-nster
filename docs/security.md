# Security Guidelines - JobCoach Münster

Umfassende Sicherheitsrichtlinien und Best Practices für die JobCoach-Website.

## 📋 Inhaltsverzeichnis

- [Sicherheits-Architektur](#️-sicherheits-architektur)
- [Datenschutz-Compliance](#-datenschutz-compliance)
- [Technische Sicherheit](#-technische-sicherheit)
- [Incident Response](#-incident-response)
- [Monitoring & Logging](#-monitoring--logging)
- [Penetration Testing](#-penetration-testing)
- [Compliance Checkliste](#-compliance-checkliste)

## 🛡️ Sicherheits-Architektur

### Defense in Depth
Mehrschichtiger Sicherheitsansatz:

```
🌐 CDN/WAF (CloudFlare)
    ↓
🔒 SSL/TLS Termination
    ↓
🛡️ Reverse Proxy (Nginx)
    ↓
🏗️ Application Layer (Static Site)
    ↓
📊 Monitoring & Logging
```

### Bedrohungsmodell
**Identifizierte Risiken**:
1. **XSS-Angriffe** durch Formular-Injection
2. **CSRF** bei Formular-Submissions
3. **Clickjacking** durch Frame-Embedding
4. **Data Breach** durch unsichere Datenübertragung
5. **DDoS** durch Überlastungsangriffe
6. **Social Engineering** gegen Mitarbeiter

## 🔒 Datenschutz-Compliance

### DSGVO-Implementierung

#### Rechtsgrundlagen
```javascript
// Datenverarbeitung nur mit Rechtsgrundlage
const dataProcessing = {
  essential: 'Art. 6 Abs. 1 lit. f DSGVO', // Berechtigtes Interesse
  analytics: 'Art. 6 Abs. 1 lit. a DSGVO', // Einwilligung
  marketing: 'Art. 6 Abs. 1 lit. a DSGVO', // Einwilligung
  contract: 'Art. 6 Abs. 1 lit. b DSGVO'   // Vertragserfüllung
};
```

#### Consent Management
```javascript
// Granulare Einwilligung
const consentCategories = {
  essential: true,    // Immer aktiv
  comfort: false,     // Optional
  analytics: false,   // Optional
  marketing: false    // Optional
};

// Einwilligung dokumentieren
function logConsent(preferences) {
  const consentRecord = {
    timestamp: new Date().toISOString(),
    preferences: preferences,
    userAgent: navigator.userAgent,
    ipAddress: '[ANONYMISIERT]',
    version: '1.0'
  };
  
  // Sichere Speicherung
  localStorage.setItem('consent-record', JSON.stringify(consentRecord));
}
```

#### Datenminimierung
```javascript
// Nur notwendige Daten sammeln
const contactForm = {
  required: ['name', 'email', 'message'],
  optional: ['phone'],
  forbidden: ['password', 'ssn', 'financial-data']
};

// Automatische Löschung
const dataRetention = {
  contactForms: 90,      // Tage
  logFiles: 30,          // Tage
  analytics: 365,        // Tage (anonymisiert)
  backups: 2555          // 7 Jahre (rechtliche Aufbewahrung)
};
```

### TTDSG-Compliance (Cookie-Gesetz)
```javascript
// Cookie-Kategorisierung
const cookieCategories = {
  essential: {
    description: 'Technisch notwendige Cookies',
    legalBasis: 'Art. 6 Abs. 1 lit. f DSGVO',
    consent: false // Keine Einwilligung erforderlich
  },
  functional: {
    description: 'Komfort-Funktionen',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO',
    consent: true // Einwilligung erforderlich
  },
  analytics: {
    description: 'Statistik und Analyse',
    legalBasis: 'Art. 6 Abs. 1 lit. a DSGVO',
    consent: true // Einwilligung erforderlich
  }
};
```

## 🔐 Technische Sicherheit

### Content Security Policy (CSP)
```nginx
# Strenge CSP-Konfiguration
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  connect-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content;
" always;
```

### Input Validation
```javascript
// Client-Side Validation
function validateInput(input, type) {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
    name: /^[a-zA-ZäöüßÄÖÜ\s\-]{2,50}$/
  };
  
  // XSS-Schutz
  const sanitized = input
    .replace(/[<>\"']/g, '') // Gefährliche Zeichen entfernen
    .trim()
    .substring(0, 1000); // Länge begrenzen
  
  return patterns[type]?.test(sanitized) || false;
}

// Server-Side Validation (falls Backend vorhanden)
function sanitizeInput(input) {
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const htmlEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match];
    })
    .trim()
    .substring(0, 1000);
}
```

### CSRF-Schutz
```javascript
// CSRF-Token generieren
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Token in Formulare einbetten
function addCSRFToken(form) {
  const token = generateCSRFToken();
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'csrf_token';
  input.value = token;
  form.appendChild(input);
  
  // Token in Session speichern
  sessionStorage.setItem('csrf_token', token);
}
```

### Rate Limiting
```nginx
# Nginx Rate Limiting
http {
  # Zone für allgemeine Requests
  limit_req_zone $binary_remote_addr zone=general:10m rate=10r/m;
  
  # Zone für Kontaktformular
  limit_req_zone $binary_remote_addr zone=contact:10m rate=3r/m;
  
  # Zone für API-Calls
  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
}

server {
  # Kontaktformular schützen
  location /contact {
    limit_req zone=contact burst=5 nodelay;
  }
  
  # API-Endpunkte schützen
  location /api/ {
    limit_req zone=api burst=10 nodelay;
  }
}
```

## 🚨 Incident Response

### Incident-Kategorien
1. **Kritisch**: Datendiebstahl, Website-Kompromittierung
2. **Hoch**: Verfügbarkeitsprobleme, Performance-Einbrüche
3. **Mittel**: Kleinere Sicherheitslücken, Fehlkonfigurationen
4. **Niedrig**: Informative Sicherheitswarnungen

### Response-Verfahren

#### 1. Erkennung
```bash
# Automatische Monitoring-Alerts
# Log-Anomalien erkennen
grep "CRITICAL\|ERROR" /var/log/nginx/error.log | tail -20

# Ungewöhnliche Traffic-Muster
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

#### 2. Eindämmung
```bash
# IP-Adresse blockieren
sudo ufw deny from [MALICIOUS_IP]

# Service temporär stoppen
sudo systemctl stop nginx

# Backup aktivieren
sudo systemctl start nginx-backup
```

#### 3. Untersuchung
```bash
# Forensische Analyse
sudo cp /var/log/nginx/access.log /forensics/access-$(date +%Y%m%d).log
sudo cp /var/log/nginx/error.log /forensics/error-$(date +%Y%m%d).log

# Integrity-Check
sudo find /var/www/jobcoach-muenster -type f -exec md5sum {} \; > /forensics/checksums.txt
```

#### 4. Wiederherstellung
```bash
# Clean Backup wiederherstellen
sudo tar -xzf /backups/clean-backup.tar.gz -C /var/www/

# Services neu starten
sudo systemctl restart nginx
sudo systemctl restart fail2ban
```

#### 5. Lessons Learned
- **Incident-Report** erstellen
- **Sicherheitsmaßnahmen** anpassen
- **Monitoring** verbessern
- **Team-Schulung** durchführen

### Notfall-Kontakte
```bash
# Interne Kontakte
ADMIN_EMAIL="admin@jobcoach-muenster.de"
SECURITY_PHONE="+49 251 123456-99"

# Externe Dienstleister
HOSTING_SUPPORT="support@hosting-provider.com"
SSL_SUPPORT="support@ssl-provider.com"

# Behörden (bei Datenschutzverletzungen)
DATENSCHUTZ_BEHOERDE="poststelle@ldi.nrw.de"
POLIZEI_CYBER="cybercrime@polizei.nrw.de"
```

## 📊 Monitoring & Logging

### Log-Konfiguration
```nginx
# Nginx Logging
log_format security '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log security;
error_log /var/log/nginx/error.log warn;
```

### Security-Monitoring
```bash
# Fail2Ban-Konfiguration für Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
```

### Intrusion Detection
```bash
# AIDE (Advanced Intrusion Detection Environment)
sudo apt install aide

# Baseline erstellen
sudo aide --init

# Regelmäßige Checks
0 2 * * * /usr/bin/aide --check | mail -s "AIDE Report" admin@jobcoach-muenster.de
```

## 🔍 Penetration Testing

### Automated Security Scans
```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://jobcoach-muenster.de

# Nuclei Security Scanner
nuclei -u https://jobcoach-muenster.de \
  -t exposures/ -t vulnerabilities/

# Nikto Web Scanner
nikto -h https://jobcoach-muenster.de
```

### Manual Testing Checklist
- [ ] **SQL Injection** (falls Datenbank vorhanden)
- [ ] **XSS** in allen Input-Feldern
- [ ] **CSRF** bei Formular-Submissions
- [ ] **Directory Traversal** in URL-Parametern
- [ ] **File Upload** Sicherheit
- [ ] **Session Management** Schwachstellen
- [ ] **Authentication Bypass** Versuche
- [ ] **Information Disclosure** durch Error-Messages

### Vulnerability Assessment
```bash
# Nmap Port-Scan
nmap -sV -sC jobcoach-muenster.de

# SSL/TLS Test
testssl.sh jobcoach-muenster.de

# HTTP Security Headers
curl -I https://jobcoach-muenster.de | grep -E "(X-|Content-Security|Strict-Transport)"
```

## 🔐 Secure Development

### Code Review Checkliste
- [ ] **Input Validation** implementiert
- [ ] **Output Encoding** für alle User-Inputs
- [ ] **Authentication** korrekt implementiert
- [ ] **Authorization** Checks vorhanden
- [ ] **Error Handling** ohne Information Disclosure
- [ ] **Logging** für Security-Events
- [ ] **Dependencies** auf aktuellem Stand

### Secure Coding Practices
```javascript
// Sichere Input-Behandlung
function processUserInput(input) {
  // 1. Validierung
  if (!isValidInput(input)) {
    throw new Error('Invalid input');
  }
  
  // 2. Sanitization
  const sanitized = sanitizeInput(input);
  
  // 3. Encoding für Output
  const encoded = encodeForHTML(sanitized);
  
  return encoded;
}

// XSS-Schutz
function encodeForHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// CSRF-Token Validierung
function validateCSRFToken(token, sessionToken) {
  return token === sessionToken && 
         token.length === 64 && 
         /^[a-f0-9]+$/.test(token);
}
```

## 🔒 Verschlüsselung

### SSL/TLS Konfiguration
```nginx
# Moderne SSL-Konfiguration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# Perfect Forward Secrecy
ssl_dhparam /etc/nginx/ssl/dhparam.pem;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

# Session-Konfiguration
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

### Daten-Verschlüsselung
```javascript
// Client-Side Verschlüsselung für sensible Daten
async function encryptSensitiveData(data, publicKey) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    publicKey,
    dataBuffer
  );
  
  return Array.from(new Uint8Array(encrypted));
}
```

## 🛡️ Firewall-Konfiguration

### UFW (Ubuntu Firewall)
```bash
# Basis-Konfiguration
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Notwendige Ports öffnen
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Rate Limiting für SSH
sudo ufw limit 22/tcp

# Firewall aktivieren
sudo ufw enable

# Status prüfen
sudo ufw status verbose
```

### Fail2Ban-Konfiguration
```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@jobcoach-muenster.de
sender = fail2ban@jobcoach-muenster.de

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2
```

## 📊 Security Monitoring

### Log-Analyse
```bash
# Verdächtige IPs identifizieren
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

# 404-Angriffe erkennen
grep " 404 " /var/log/nginx/access.log | awk '{print $1, $7}' | sort | uniq -c | sort -nr

# SQL-Injection Versuche
grep -i "union\|select\|insert\|delete\|drop" /var/log/nginx/access.log

# XSS-Versuche
grep -i "script\|javascript\|onload\|onerror" /var/log/nginx/access.log
```

### Automated Monitoring
```bash
#!/bin/bash
# security-monitor.sh

LOG_FILE="/var/log/nginx/access.log"
ALERT_EMAIL="security@jobcoach-muenster.de"

# Prüfe auf Anomalien
SUSPICIOUS_IPS=$(awk '{print $1}' $LOG_FILE | sort | uniq -c | awk '$1 > 100 {print $2}')

if [ ! -z "$SUSPICIOUS_IPS" ]; then
    echo "Suspicious IPs detected: $SUSPICIOUS_IPS" | \
    mail -s "Security Alert - Suspicious Traffic" $ALERT_EMAIL
fi

# Prüfe auf bekannte Attack-Patterns
ATTACKS=$(grep -E "(union|select|script|javascript)" $LOG_FILE | wc -l)

if [ $ATTACKS -gt 10 ]; then
    echo "Multiple attack attempts detected: $ATTACKS" | \
    mail -s "Security Alert - Attack Attempts" $ALERT_EMAIL
fi
```

## 🔄 Backup & Recovery

### Backup-Strategie
```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/jobcoach"
RETENTION_DAYS=30

# Website-Dateien
tar -czf "$BACKUP_DIR/website-$DATE.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  /var/www/jobcoach-muenster

# Konfigurationsdateien
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" \
  /etc/nginx \
  /etc/ssl \
  /etc/letsencrypt

# Logs
tar -czf "$BACKUP_DIR/logs-$DATE.tar.gz" \
  /var/log/nginx

# Alte Backups löschen
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Backup-Integrität prüfen
if tar -tzf "$BACKUP_DIR/website-$DATE.tar.gz" > /dev/null 2>&1; then
    echo "✅ Backup successful: $DATE"
else
    echo "❌ Backup failed: $DATE" | mail -s "Backup Alert" admin@jobcoach-muenster.de
fi
```

### Recovery-Verfahren
```bash
# Disaster Recovery
# 1. Neue Server-Instanz erstellen
# 2. Basis-Software installieren
sudo apt update && sudo apt install nginx docker.io

# 3. Backup wiederherstellen
sudo tar -xzf /backups/website-YYYYMMDD.tar.gz -C /
sudo tar -xzf /backups/config-YYYYMMDD.tar.gz -C /

# 4. Services starten
sudo systemctl start nginx
sudo systemctl start docker

# 5. DNS umleiten (falls erforderlich)
# 6. SSL-Zertifikate erneuern
sudo certbot renew
```

## 🛡️ Compliance Checkliste

### DSGVO-Compliance
- [ ] **Rechtsgrundlage** für jede Datenverarbeitung dokumentiert
- [ ] **Einwilligungen** granular und widerrufbar
- [ ] **Datenschutzerklärung** vollständig und aktuell
- [ ] **Betroffenenrechte** implementiert (Auskunft, Löschung, etc.)
- [ ] **Data Breach Procedures** dokumentiert
- [ ] **Privacy by Design** umgesetzt
- [ ] **Auftragsverarbeitung** vertraglich geregelt

### TTDSG-Compliance (Cookies)
- [ ] **Cookie-Banner** mit Opt-in
- [ ] **Granulare Einstellungen** verfügbar
- [ ] **Widerruf** jederzeit möglich
- [ ] **Dokumentation** aller Cookie-Zwecke
- [ ] **Technisch notwendige** Cookies klar abgegrenzt

### Accessibility-Compliance (BITV 2.0)
- [ ] **WCAG 2.2 AA** vollständig umgesetzt
- [ ] **Barrierefreiheitserklärung** vorhanden
- [ ] **Feedback-Mechanismus** für Accessibility-Probleme
- [ ] **Leichte Sprache** Version verfügbar
- [ ] **Regelmäßige Tests** mit assistiven Technologien

### Security-Compliance
- [ ] **ISO 27001** Principles befolgt
- [ ] **OWASP Top 10** Schutzmaßnahmen implementiert
- [ ] **BSI-Grundschutz** Empfehlungen umgesetzt
- [ ] **Penetration Tests** regelmäßig durchgeführt
- [ ] **Incident Response Plan** vorhanden

## 🔧 Security Tools

### Empfohlene Tools
```bash
# Static Analysis
npm install --save-dev eslint-plugin-security

# Dependency Scanning
npm install --save-dev audit-ci

# Container Scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image jobcoach-muenster:latest

# Web Application Scanning
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://jobcoach-muenster.de
```

### Monitoring-Dashboard
```bash
# Grafana-Dashboard für Security-Metriken
# 1. Failed Login Attempts
# 2. Blocked IPs
# 3. Security Header Compliance
# 4. SSL Certificate Expiry
# 5. Vulnerability Scan Results
```

## 📞 Security-Kontakte

### Interne Security-Team
- **Security Officer**: security@jobcoach-muenster.de
- **Datenschutzbeauftragte/r**: datenschutz@jobcoach-muenster.de
- **IT-Administrator**: admin@jobcoach-muenster.de

### Externe Security-Experten
- **Penetration Testing**: [PENTEST-ANBIETER]
- **Forensik**: [FORENSIK-ANBIETER]
- **Legal Counsel**: [ANWALTSKANZLEI]

### Meldestellen
- **BSI**: cert-bund@bsi.bund.de
- **Datenschutzbehörde NRW**: poststelle@ldi.nrw.de
- **CERT-EU**: cert-eu@ec.europa.eu

---

**Letzte Aktualisierung**: [DATUM]  
**Version**: 1.0  
**Nächste Review**: [NÄCHSTES_DATUM]  
**Verantwortlich**: [SECURITY_OFFICER], [EMAIL]
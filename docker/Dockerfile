# JobCoach Münster - Production Dockerfile
# Multi-stage build für optimale Performance und Sicherheit

# =============================================================================
# BUILD STAGE
# =============================================================================
FROM node:18-alpine AS builder

# Metadata
LABEL maintainer="JobCoach Münster <info@jobcoach-muenster.de>"
LABEL description="JobCoach Münster - Professional Social Benefits Assistance"
LABEL version="1.0.0"

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package files kopieren (für bessere Layer-Caching)
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Quellcode kopieren
COPY . .

# Build für Production
RUN npm run build 2>/dev/null || echo "No build script found, using static files"

# =============================================================================
# PRODUCTION STAGE
# =============================================================================
FROM nginx:1.25-alpine AS production

# Sicherheits-Updates installieren
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Timezone setzen
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Nginx-Benutzer für bessere Sicherheit
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Nginx-Konfiguration kopieren
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY config/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Website-Dateien kopieren
COPY --from=builder /app/dist/ /usr/share/nginx/html/ 2>/dev/null || \
COPY --from=builder /app/ /usr/share/nginx/html/

# Rechte setzen
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Nicht-Root-User verwenden
USER nginx

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Ports exposieren
EXPOSE 80 443

# Start-Command
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# DEVELOPMENT STAGE (für lokale Entwicklung)
# =============================================================================
FROM node:18-alpine AS development

WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm install

# Quellcode kopieren
COPY . .

# Development-Server starten
EXPOSE 8080
CMD ["npm", "run", "dev"]

# =============================================================================
# TESTING STAGE (für CI/CD)
# =============================================================================
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS testing

WORKDIR /app

# Node.js 18 installieren
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Dependencies installieren
COPY package*.json ./
RUN npm ci

# Test-Dateien kopieren
COPY . .

# Playwright Browser installieren
RUN npx playwright install

# Test-Command
CMD ["npm", "test"]
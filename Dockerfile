# ---------- Build stage (optional) ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
# No build step required for plain HTML/JS. Placeholder for future Next.js build.

# ---------- Production stage ----------
FROM nginx:alpine
COPY --from=builder /app /usr/share/nginx/html
# Security headers (optional): you can mount a custom conf
# COPY config/security-headers.example /etc/nginx/conf.d/security.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
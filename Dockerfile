# Multi-stage build for frontend (Next.js) and backend (Node.js Express)
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# Build frontend
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.mjs ./next.config.mjs
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/dist ./dist

EXPOSE 3000 4000

CMD ["sh", "-c", "node dist/backend/index.js & next start -p 3000"]

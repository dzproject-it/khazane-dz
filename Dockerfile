# ═══════════════════════════════════════════════════
# Khazane-DZ — Multi-stage Dockerfile
# ═══════════════════════════════════════════════════

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci
COPY backend/ ./
RUN chmod -R +x node_modules/.bin && npx prisma generate
RUN npm run build

# --- Stage 3: Production Image ---
FROM node:20-alpine AS production
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install only production deps
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client
COPY backend/prisma ./prisma
RUN chmod -R +x node_modules/.bin && npx prisma generate

# Copy built backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend into frontend-dist (served by NestJS ServeStatic)
COPY --from=frontend-build /app/frontend/dist ./frontend-dist

# Copy seed file for initial setup
COPY backend/prisma/seed.ts ./prisma/seed.ts

ENV NODE_ENV=production
ENV PORT=3000
ENV SERVE_STATIC=true
ENV STATIC_PATH=/app/frontend-dist

EXPOSE 3000

CMD ["node", "dist/src/main"]

# =============================================================================
# Fintelligence API - Multi-stage Docker Build (NestJS)
# =============================================================================

# ---------- Stage 1: Install dependencies ----------
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# ---------- Stage 2: Build the application ----------
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client if prisma schema exists
RUN if [ -f "prisma/schema.prisma" ]; then pnpm prisma generate; fi

RUN pnpm build

# ---------- Stage 3: Production dependencies only ----------
FROM node:22-alpine AS prod-deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile --prod

# Copy generated Prisma client from builder if it exists
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma 2>/dev/null || true

# ---------- Stage 4: Runtime ----------
FROM node:22-alpine AS runner

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json

# Copy Prisma migrations if they exist
COPY --from=builder /app/prisma ./prisma 2>/dev/null || true

USER nestjs

EXPOSE 3001

ENV API_PORT=3001

CMD ["dumb-init", "node", "dist/main.js"]

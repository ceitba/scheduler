# Multi-stage build for CEITBA Scheduler
# Stage 1: Build dependencies and compile Next.js
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production=false

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S scheduler -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=scheduler:nodejs /app/.next/standalone ./
COPY --from=builder --chown=scheduler:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=scheduler:nodejs /app/public ./public

# Clean up unnecessary files
RUN rm -rf tests/ docs/ .git/ .github/ *.md

RUN chown -R scheduler:nodejs /app
USER scheduler

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/scheduler/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["node", "server.js"]

# Stage 3: Development environment
FROM node:20-alpine AS development

RUN apk add --no-cache python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S scheduler -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN chown -R scheduler:nodejs /app
USER scheduler

EXPOSE 3000

CMD ["npm", "run", "dev"]

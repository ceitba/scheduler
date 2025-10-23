# Stage 1: Build dependencies and compile Next.js
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci

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

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/cache/apk/* /root/.npm

COPY --from=builder --chown=scheduler:nodejs /app/.next/standalone ./
COPY --from=builder --chown=scheduler:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=scheduler:nodejs /app/public ./public

RUN chown -R scheduler:nodejs /app
USER scheduler

EXPOSE 3000

CMD ["node", "server.js"]

FROM node:20-alpine AS development

RUN apk add --no-cache python3 make g++

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

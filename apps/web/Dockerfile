FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web ./apps/web
ARG NEXT_PUBLIC_API_URL=/api
ARG API_INTERNAL_URL=http://api:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build -w @resume-analyzer/web
RUN npm prune --omit=dev --ignore-scripts

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S web -G nodejs
COPY --from=builder --chown=web:nodejs /app/package.json ./package.json
COPY --from=builder --chown=web:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=web:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=web:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder --chown=web:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=web:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=web:nodejs /app/apps/web/next.config.mjs ./apps/web/next.config.mjs

USER web
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@resume-analyzer/web"]

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api ./apps/api
RUN npm run build -w @resume-analyzer/api
RUN npm prune --omit=dev --ignore-scripts

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S api -G nodejs
COPY --from=builder --chown=api:nodejs /app/package.json ./package.json
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=api:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./apps/api/dist

USER api
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

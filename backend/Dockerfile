FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace package manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY database/package.json ./database/
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci

# Copy source files
COPY shared ./shared
COPY database ./database
COPY backend ./backend

# Build shared contracts, database client, and backend
RUN npm run build --workspace=shared
RUN npm run db:generate --workspace=database
RUN npm run build --workspace=backend

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Install dumb-init for clean process reaping and wget for healthchecks
RUN apk add --no-cache dumb-init wget

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY database/package.json ./database/
COPY backend/package.json ./backend/

RUN npm ci --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/database ./database
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/backend/dist ./backend/dist

# Ensure upload directory exists and assign node user ownership
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/v1/health/live || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "backend/dist/server.js"]

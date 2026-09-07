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

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY database/package.json ./database/
COPY backend/package.json ./backend/

RUN npm ci --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/database ./database
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 5000

CMD ["node", "backend/dist/server.js"]

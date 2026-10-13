# syntax=docker/dockerfile:1

# --- 1. Build Stage ---
FROM node:24 AS build

WORKDIR /usr/src/app

# Copy root manifests & lockfile + API package.json
COPY package.json package-lock.json .npmrc* ./
COPY apps/api/package.json ./apps/api/

# Install dependencies needed to build the API workspace
RUN npm ci --workspace=api

# Copy API source files and build
COPY apps/api ./apps/api
RUN npm run build -w=api

# --- 2. Production Dependencies Stage ---
FROM node:24 AS prod-deps

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc* ./
COPY apps/api/package.json ./apps/api/

# Install ONLY production dependencies
RUN npm ci --workspace=api --omit=dev

# --- 3. Production Runner Stage ---
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy hoisted production node_modules from prod-deps
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=prod-deps /usr/src/app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /usr/src/app/package.json ./
COPY --from=prod-deps /usr/src/app/apps/api/package.json ./apps/api/

# Copy compiled JavaScript output
COPY --from=build /usr/src/app/apps/api/dist ./apps/api/dist

USER node

EXPOSE 3000

WORKDIR /usr/src/app/apps/api
CMD ["node", "dist/main"]
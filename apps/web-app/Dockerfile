# syntax=docker/dockerfile:1

# --- 1. Build Stage ---
FROM node:24 AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc* ./
COPY apps/web-app/package.json ./apps/web-app/


# Install dependencies for web-app workspace
RUN npm ci --workspace=web-app

# Copy web-app source files
COPY apps/web-app ./apps/web-app

ENV NODE_ENV=production

# Build static bundle to apps/web-app/dist
RUN npm run build -w=web-app

# --- 2. Production Nginx Stage ---
FROM nginx:stable-alpine AS runner

# Copy compiled static assets into Nginx web root
COPY --from=build /usr/src/app/apps/web-app/dist /usr/share/nginx/html

# Copy Nginx server configuration
COPY apps/web-app/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
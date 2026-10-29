# ==========================================
# PavelAGI-X Omega | Multi-Stage Distroless Production Dockerfile
# ==========================================

# Stage 1: Build & Compile
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencies cache layer
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy full application sources
COPY . .

# Run validation checks during build
RUN npm run lint
RUN npm test
RUN npm run build

# Stage 2: Hardened Production Runtime (Distroless non-root)
FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

# Copy compiled artifacts & production dependencies
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=builder --chown=nonroot:nonroot /app/server.ts ./server.ts

# Security: Non-root user 10001
USER 10001:10001

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

# Healthcheck handled by K8s liveness/readiness probes
CMD ["server.js"]

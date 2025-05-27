# --- Stage 1: Builder ---
FROM node:23-slim AS build

# Ensure pnpm is available
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install all deps (dev + prod) and cache the pnpm store
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copy rest of the source and build
COPY . .
RUN --mount=type=cache,id=astro_cache,target=/app/node_modules/.astro pnpm run build

# --- Stage 2: Runtime ---
FROM node:23-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy only what's needed at runtime
COPY --from=build /app/dist    ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json    ./
COPY --from=build /app/pnpm-lock.yaml   ./

# Optional: set NODE_ENV for production
ENV NODE_ENV=production

# Start your server
CMD ["pnpm", "start"]

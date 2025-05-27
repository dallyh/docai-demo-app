# --- Stage 1: Builder ---
FROM node:23-slim AS build

# enable pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 1) Copy *everything* into the build context
COPY . .

# 2) Install all dependencies (dev + prod), caching the pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install

# 3) Build Astro, caching .astro artifacts
RUN --mount=type=cache,id=astro-cache,target=/app/node_modules/.astro \
    pnpm run build

# --- Stage 2: Runtime ---
FROM node:23-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 4) Copy only runtime artifacts
COPY --from=build /app/dist        ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json    ./
COPY --from=build /app/pnpm-lock.yaml   ./

CMD ["pnpm", "start"]

FROM node:24-alpine AS base

env COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app
RUN addgroup -S www && adduser -S www -G www && \
	corepack enable && corepack prepare pnpm@10.18.3 --activate && \
    pnpm -v
CMD ["pnpm", "run", "start"]



FROM base AS dev
CMD ["pnpm", "run", "dev", "--port=3000"]



FROM base AS prod-build
COPY --link ./ ./
RUN pnpm install --frozen-lockfile; \
    pnpm run build



FROM base AS prod
COPY --link --from=prod-build /app/build ./build
COPY --link --from=prod-build /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
USER www

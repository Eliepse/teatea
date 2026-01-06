FROM oven/bun:alpine AS base

WORKDIR /app
RUN addgroup -S www && adduser -S www -G www
CMD ["bun", "run", "start"]



FROM base AS dev
COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/custom-docker-entrypoint
ENTRYPOINT ["custom-docker-entrypoint"]
CMD ["bun", "run", "dev", "--port=3000"]



FROM base AS prod-build
COPY --link ./ ./
RUN bun install --frozen-lockfile; \
    bun run build



FROM base AS prod
COPY --link --from=prod-build /app/build ./build
COPY --link --from=prod-build /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile
USER www

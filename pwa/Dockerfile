FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN pnpm ci

FROM base AS dev
WORKDIR /app
CMD ["pnpm", "run", "dev"]

FROM base AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN pnpm ci --omit=dev

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build

FROM base
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["pnpm", "run", "start"]

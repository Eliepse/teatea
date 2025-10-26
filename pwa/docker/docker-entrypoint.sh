#!/usr/bin/env sh

set -e

pnpm install --frozen-lockfile

exec /usr/local/bin/docker-entrypoint.sh "$@"


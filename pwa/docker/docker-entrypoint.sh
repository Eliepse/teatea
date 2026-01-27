#!/usr/bin/env sh

set -e

bun install --frozen-lockfile
bun run gen-env

exec /usr/local/bin/docker-entrypoint.sh "$@"


#!/usr/bin/env sh

set -e

bun install --frozen-lockfile

exec /usr/local/bin/docker-entrypoint.sh "$@"


#!/usr/bin/env sh

set -e

if [[ -d "node_modules" ]]; then
	echo "Packages already installed, skip"
else
	bun install --frozen-lockfile
fi

exec /usr/local/bin/docker-entrypoint.sh "$@"


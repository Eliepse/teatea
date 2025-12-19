# Base FrankenPHP image
FROM dunglas/frankenphp:1.9-php8.4  AS base

WORKDIR /app
VOLUME /data
VOLUME /config

# persistent / runtime deps
# hadolint ignore=DL3008
RUN apt-get update && apt-get install --no-install-recommends -y \
	acl file gettext git \
	&& rm -rf /var/lib/apt/lists/*

# https://getcomposer.org/doc/03-cli.md#composer-allow-superuser
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN set -eux; \
	install-php-extensions @composer apcu intl opcache zip pdo_pgsql

COPY --link frankenphp/conf.d/app.ini $PHP_INI_DIR/conf.d/
COPY --link --chmod=755 frankenphp/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
HEALTHCHECK --start-period=60s CMD curl -f http://localhost:2019/metrics || exit 1
CMD [ "frankenphp", "run", "--config", "/etc/caddy/Caddyfile" ]



# Dev FrankenPHP image
FROM base AS dev
ENV APP_ENV=dev XDEBUG_MODE=off PHP_IDE_CONFIG="serverName=localhost"

RUN install-php-extensions xdebug

COPY --link frankenphp/conf.d/app.dev.ini $PHP_INI_DIR/conf.d/
COPY --link frankenphp/Caddyfile /etc/caddy/Caddyfile

CMD [ "frankenphp", "run", "--config", "/etc/caddy/Caddyfile", "--watch" ]



# Prod FrankenPHP image
FROM base AS prod

ENV APP_ENV=prod FRANKENPHP_CONFIG="import worker.Caddyfile"

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY --link frankenphp/conf.d/app.prod.ini $PHP_INI_DIR/conf.d/
COPY --link frankenphp/Caddyfile /etc/caddy/Caddyfile
COPY --link frankenphp/worker.Caddyfile /etc/caddy/worker.Caddyfile

# prevent the reinstallation of vendors at every changes in the source code
COPY --link composer.* symfony.* ./

RUN rm -Rf frankenphp/ var/ && \
    chown www-data:www-data -R . /data /config

USER www-data

RUN set -eux; \
	composer install --no-cache --prefer-dist --no-dev --no-autoloader --no-scripts --no-progress

# copy sources
COPY --link --chown=www-data . ./

RUN set -eux; \
	mkdir -p var/cache var/log && \
	composer dump-autoload --no-dev --classmap-authoritative --apcu-autoloader && \
	composer dump-env prod && \
	composer run-script --no-dev post-install-cmd && \
	chmod +x bin/console
#    sync <- disabled as build seems to be stuck here

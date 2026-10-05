init:
	cp .env.exemple .env
	sed -i -E "s/(APP_SECRET)=/\1=$$(openssl rand -hex 32)/1" .env
	sed -i -E "s/(DEV_LOGIN_KEY)=/\1=$$(openssl rand -hex 32)/1" .env

dev:
	docker compose up -d

build:
	docker compose build

stop:
	docker compose stop

reboot:
	docker compose stop
	docker compose up -d

sh-api:
	docker compose exec -ti api bash

sh-pwa:
	docker compose exec -ti pwa sh

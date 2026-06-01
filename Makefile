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

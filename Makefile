dev:
	docker compose up -d

build:
	docker compose build

stop:
	docker compose stop

reboot:
	docker compose stop
	docker compose up -d

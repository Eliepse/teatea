# Teatea

![PHP 8.5](https://img.shields.io/badge/PHP-8.5-777BB4?logo=php&logoColor=white)
![Symfony](https://img.shields.io/badge/Symfony-8.0-000000?logo=symfony&logoColor=white)
![FrankenPHP 1.12](https://img.shields.io/badge/FrankenPHP-1.12-4B8BBE)
![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-%2320232a.svg?logo=react&logoColor=%2361DAFB)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

Teatea is a community platform for tea enthusiasts. It is part personal journal, part crowdsourced database.

## Architecture

This project is divided in two main part: `api/` for the backend, and `pwa/` for the frontend

| Folder    | Content                                                         |
|-----------|-----------------------------------------------------------------|
| `api/`    | The backend powered by symfony                                  |
| `pwa/`    | The front-end as progressive web-app                            |
| `docker/` | Docker configs (php, caddy, etc.)                               |
| `docs/`   | Additional documentation about the project and the architecture |

## Running the project locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin
- `make`
- `openssl`

### 1. Initialize the project

```bash
make init
```

### 2. Pull and build the images

```bash
make build
# or
docker compose build
```

### 3. Run the project

```bash
make dev
# or
docker compose up -d
```

Once the containers are up:

- Application: <http://localhost>
- Test mailbox (MailDev): <http://localhost:1080>

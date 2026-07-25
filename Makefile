.PHONY: build build-prod up down up-prod down-prod restart ps logs shell migrate seed install dev test lint typecheck doctor

# ─── Build ─────────────────────────────────────────────────────────

build:
	pnpm --filter @atlas/backend build

# ─── Development (Docker Compose) ──────────────────────────────────

up:
	docker compose -f docker/docker-compose.yml up -d

down:
	docker compose -f docker/docker-compose.yml down

restart:
	docker compose -f docker/docker-compose.yml restart

ps:
	docker compose -f docker/docker-compose.yml ps

# ─── Production ────────────────────────────────────────────────────

build-prod:
	docker build -f docker/Dockerfile.prod -t atlas-backend:prod .

up-prod:
	docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d

down-prod:
	docker compose -f docker/docker-compose.prod.yml --env-file .env.production down

logs:
	docker compose -f docker/docker-compose.prod.yml logs -f

shell:
	docker compose -f docker/docker-compose.prod.yml exec backend sh

# ─── Database ──────────────────────────────────────────────────────

migrate:
	cd services/backend && npx prisma migrate deploy

seed:
	cd services/backend && npx prisma db seed

# ─── Development ───────────────────────────────────────────────────

install:
	pnpm install

dev:
	pnpm --filter @atlas/backend dev

test:
	pnpm --filter @atlas/backend test

lint:
	pnpm --filter @atlas/backend lint

typecheck:
	cd services/backend && npx tsc --noEmit

# ─── Diagnostics ───────────────────────────────────────────────────

doctor:
	./scripts/doctor.sh

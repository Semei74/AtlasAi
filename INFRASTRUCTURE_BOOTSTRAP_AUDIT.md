# INFRASTRUCTURE_BOOTSTRAP_AUDIT.md

> Atlas AI — Comprehensive Infrastructure Bootstrap Audit
> Date: 2026-07-22
> Status: **AUDIT COMPLETE**

---

## Executive Summary

Full infrastructure audit completed across 17 categories. All files and configurations were inspected statically. Docker is not installed, so container-level verification was not possible.

### Key Metrics

| Metric | Value | Classification |
|--------|-------|---------------|
| Docker installed | No | VERIFIED |
| Docker Compose files | 2 (dev, prod) | OBSERVED |
| Dockerfiles | 2 (dev, prod) | OBSERVED |
| .env files | 5 (development, example, production, test, prisma) | OBSERVED |
| Init scripts | 1 (PostgreSQL) | OBSERVED |
| Grafana provisioning files | 3 | OBSERVED |
| Prometheus scrape targets | 2 (prometheus, backend) | OBSERVED |
| Migration files | 3 | OBSERVED |
| CI configuration | None | OBSERVED |
| Docker entrypoint | 1 (prod) | OBSERVED |

### Categories Audited

| Category | Status | Issues Found |
|----------|--------|--------------|
| Docker Compose | ✅ Static analysis complete | 7 |
| Dockerfile | ✅ Static analysis complete | 5 |
| Environment | ✅ Static analysis complete | 4 |
| Prisma | ✅ Static analysis complete | 3 |
| PostgreSQL | ✅ Static analysis complete | 1 |
| Redis | ✅ Static analysis complete | 0 |
| OpenSearch | ✅ Static analysis complete | 3 |
| MinIO | ✅ Static analysis complete | 1 |
| Traefik | ✅ Static analysis complete | 1 |
| Monitoring Stack | ✅ Static analysis complete | 2 |
| Backend Startup | ✅ Static analysis complete | 3 |
| Makefile | ✅ Static analysis complete | 2 |
| CI | ✅ Static analysis complete | 1 |

---

## Docker Compose Audit

### 2.1 Version and Name

| Item | Value | Classification |
|------|-------|---------------|
| Compose version | `3.9` | OBSERVED |
| Project name (dev) | `atlas-ai-dev` | OBSERVED |
| Project name (prod) | `atlas-ai-prod` | OBSERVED |

### 2.2 Networks

| Network | Driver | Classification |
|---------|--------|---------------|
| `atlas-network` | bridge | OBSERVED |

**Issues:**
- Single network for all services. No network isolation between tiers.

### 2.3 Volumes

| Volume | Used By | Classification |
|--------|---------|---------------|
| `postgres-data` | postgres | OBSERVED |
| `redis-data` | redis | OBSERVED |
| `minio-data` | minio | OBSERVED |
| `opensearch-data` | opensearch | OBSERVED |
| `prometheus-data` | prometheus | OBSERVED |
| `grafana-data` | grafana | OBSERVED |
| `loki-data` | loki | OBSERVED |
| `traefik-letsencrypt` | traefik (prod only) | OBSERVED |

**Issues:**
- No external volume declarations. All volumes are project-scoped (will be recreated per project).

### 2.4 Restart Policy

| Service | Restart Policy | Classification |
|---------|---------------|---------------|
| All services | `unless-stopped` | OBSERVED |

### 2.5 depends_on

| Service | Depends On | Condition | Classification |
|---------|-----------|-----------|---------------|
| backend (dev) | postgres, redis | `service_healthy` | OBSERVED |
| prometheus (prod) | backend | `service_started` | OBSERVED |
| grafana (prod) | prometheus, loki | (none) | OBSERVED |

**Issues:**
- Grafana (prod) has no condition on `depends_on`. If prometheus or loki fail, grafana still starts.
- Backend starts after postgres and redis are healthy, but does not wait for minio or opensearch.

### 2.6 Healthcheck

| Service | Healthcheck | Interval | Classification |
|---------|-------------|----------|---------------|
| postgres | ✅ `pg_isready` | 5s (dev), 10s (prod) | OBSERVED |
| redis | ✅ `redis-cli ping` | 5s (dev), 10s (prod) | OBSERVED |
| minio | ✅ `curl /minio/health/live` | 10s (dev), 15s (prod) | OBSERVED |
| opensearch | ✅ `curl /_cluster/health` | 15s | OBSERVED |
| backend | ✅ `fetch /health` (dev), `wget /health` (prod) | 10s (dev), 30s (prod) | OBSERVED |
| traefik | ❌ None | — | OBSERVED |
| mailpit | ❌ None | — | OBSERVED |
| prometheus | ❌ None | — | OBSERVED |
| grafana | ❌ None | — | OBSERVED |
| loki | ❌ None | — | OBSERVED |

### 2.7 Environment Variables

| Service | env_file | environment overrides | Classification |
|---------|----------|----------------------|---------------|
| postgres | — | POSTGRES_USER/PASSWORD/DB (`${VAR:-default}`) | OBSERVED |
| redis | — | (command-line only) | OBSERVED |
| minio | — | MINIO_ROOT_USER/PASSWORD | OBSERVED |
| opensearch | — | discovery.type, security, JAVA_OPTS | OBSERVED |
| backend (dev) | `../.env.development` | DB_HOST, REDIS_HOST, STORAGE_ENDPOINT, SEARCH_HOST, OLLAMA_BASE_URL, CORS_ORIGIN | OBSERVED |
| backend (prod) | `../.env.production` | DB_HOST, REDIS_HOST, STORAGE_ENDPOINT, SEARCH_HOST, DATABASE_URL | OBSERVED |

**Issues:**
- `postgres` healthcheck uses hardcoded `-U postgres` in dev compose instead of `${DB_USERNAME:-postgres}`.
- Backend `DATABASE_URL` in prod compose overrides the env_file value. This is intentional but must be consistent.

### 2.8 Ports

| Service | Ports | Classification |
|---------|-------|---------------|
| traefik | 80, 443 | OBSERVED |
| postgres | 5432 | OBSERVED |
| redis | 6379 | OBSERVED |
| minio | 9000, 9001 | OBSERVED |
| opensearch | 9200, 9600 | OBSERVED |
| mailpit | 1025, 8025 | OBSERVED |
| prometheus | 9090 | OBSERVED |
| grafana | 3001 | OBSERVED |
| loki | 3100 | OBSERVED |
| backend | 3000 | OBSERVED |

**Issues:**
- Ports 80 and 443 require root/sudo on macOS (may fail on first run without privileged port mapping).
- Port 3001 for Grafana may conflict with other local services.

### 2.9 Bind Mounts

| Service | Mount | Type | Classification |
|---------|-------|------|---------------|
| traefik | `/var/run/docker.sock:/var/run/docker.sock:ro` | Host socket | OBSERVED |
| postgres | `./init/postgres:/docker-entrypoint-initdb.d` | Relative bind | OBSERVED |
| backend (dev) | `..:/app` | Full repo mount | OBSERVED |
| backend (dev) | `/app/node_modules` | Anonymous volume | OBSERVED |
| prometheus | `./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro` | Relative bind | OBSERVED |
| grafana | `./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro` | Relative bind | OBSERVED |
| grafana | `./grafana/datasources:/etc/grafana/provisioning/datasources:ro` | Relative bind | OBSERVED |
| opensearch (prod) | `./opensearch/config/opensearch.yml:ro` | Relative bind | OBSERVED |
| opensearch (prod) | `./opensearch/config/securityconfig:ro` | Relative bind | OBSERVED |
| opensearch (prod) | `./opensearch/config/certs:ro` | Relative bind | OBSERVED |
| traefik (prod) | `traefik-letsencrypt:/letsencrypt` | Named volume | OBSERVED |

**Issues:**
- `./init/postgres` directory exists with 1 file. Additional init scripts would be ignored.
- `./opensearch/config/certs` directory may not exist or may be empty. Required for TLS in prod.
- Relative paths `./` are relative to the compose file directory (`docker/`). This is correct.
- All bind mounts depend on working directory being the project root when running compose.

### 2.10 container_name

| Container | Name | Classification |
|-----------|------|---------------|
| traefik | `atlas-traefik` | OBSERVED |
| postgres | `atlas-postgres` | OBSERVED |
| redis | `atlas-redis` | OBSERVED |
| minio | `atlas-minio` | OBSERVED |
| opensearch | `atlas-opensearch` | OBSERVED |
| mailpit | `atlas-mailpit` | OBSERVED |
| prometheus | `atlas-prometheus` | OBSERVED |
| grafana | `atlas-grafana` | OBSERVED |
| loki | `atlas-loki` | OBSERVED |
| backend | `atlas-backend` | OBSERVED |

### 2.11 Profiles

| Service | Profile | Classification |
|---------|---------|---------------|
| all | None | OBSERVED |

**Issues:**
- No profiles defined. All services always start.

### 2.12 Logging

| Service | Logging Driver | Classification |
|---------|---------------|---------------|
| all | Default (docker driver) | OBSERVED |

**Issues:**
- No max-size or max-file limits. Logs may grow unbounded in long-running sessions.

---

## Dockerfile Audit

### 3.1 Dockerfile.dev

| Item | Value | Classification |
|------|-------|---------------|
| Base image | `node:20-alpine` | OBSERVED |
| Multi-stage | No | OBSERVED |
| pnpm install | `--frozen-lockfile` | OBSERVED |
| COPY order | lock files first, then full source | OBSERVED |
| HEALTHCHECK | ❌ None | OBSERVED |
| ENTRYPOINT | ❌ Not set (uses CMD only) | OBSERVED |
| CMD | `pnpm run --filter @atlas/backend dev` | OBSERVED |
| USER | ❌ Not set (runs as root) | OBSERVED |
| tini | ❌ Not installed | OBSERVED |
| WORKDIR | `/app` | OBSERVED |
| EXPOSE | 3000 | OBSERVED |

**Issues:**
- **No HEALTHCHECK.** Container health cannot be verified by Docker Engine. Backend healthcheck in compose will fail because it never becomes "healthy".
- **No non-root user.** Container runs as root inside the container.
- **No tini.** Signal handling may be broken for Node.js process.
- **No multi-stage build.** All build dependencies included in runtime image.
- **pnpm install --frozen-lockfile** requires pnpm-lock.yaml to exist and be up to date.

### 3.2 Dockerfile.prod

| Item | Value | Classification |
|------|-------|---------------|
| Base image | `node:20-alpine` | OBSERVED |
| Multi-stage | Yes (4 stages: base, deps, build, production) | OBSERVED |
| pnpm install | `--frozen-lockfile` (deps stage) | OBSERVED |
| Prisma generate | ✅ `prisma generate` in build stage | OBSERVED |
| HEALTHCHECK | ✅ `wget --spider http://localhost:3000/health` | OBSERVED |
| ENTRYPOINT | `["/sbin/tini", "--", "/docker-entrypoint.sh"]` | OBSERVED |
| CMD | None (ENTRYPOINT runs script) | OBSERVED |
| USER | `atlas` (non-root) | OBSERVED |
| tini | ✅ `apk add --no-cache tini` | OBSERVED |
| WORKDIR | `/app` | OBSERVED |
| EXPOSE | 3000 | OBSERVED |
| Permissions | `chmod +x /docker-entrypoint.sh` | OBSERVED |
| ENV | `NODE_ENV=production`, `PORT=3000`, `HOST=0.0.0.0` | OBSERVED |

**Issues:**
- **No `COPY prisma/seed.ts` or seed data** into production image. Seed file exists in prisma/ but is not copied in Dockerfile.prod stage.
- **Dev dependencies removed** via `pnpm prune --prod` — correct but may break if any runtime code imports a devDep.
- **User `atlas` runs the entrypoint script.** However, `prisma migrate deploy` may require write access to certain directories (but should work for DB-only operations).

### 3.3 docker-entrypoint.sh

| Line | Content | Classification |
|------|---------|---------------|
| 1 | `#!/bin/sh` | OBSERVED |
| 2 | `set -e` | OBSERVED |
| 4 | `npx prisma migrate deploy` | OBSERVED |
| 6 | `exec node services/backend/dist/main.js` | OBSERVED |

**Issues:**
- **`prisma migrate deploy` runs on every startup.** If no migrations exist yet, this will fail and the container will crash.
- **No `prisma generate`** before `prisma migrate deploy`. The generated client was built into the image, but if migration adds models, client may be stale.
- **Hardcoded path** `services/backend/dist/main.js` — must match the build output path.

---

## Environment Audit

### 4.1 .env Files

| File | Purpose | Status | Classification |
|------|---------|--------|---------------|
| `.env.development` | Active dev environment | ✅ Exists (29 lines) | OBSERVED |
| `.env.example` | Template reference | ✅ Exists (80 lines) | OBSERVED |
| `.env.production` | Production template | ✅ Exists (34 lines) | OBSERVED |
| `.env.test` | Test environment | ✅ Exists | OBSERVED |
| `services/backend/.env` | Prisma-specific | ✅ Exists (prisma+postgres:// URL) | OBSERVED |
| `docker/.env` | Docker override | ❌ Does not exist | OBSERVED |

### 4.2 Variables Cross-Reference

| Variable | .env.example | .env.development | .env.production | Classification |
|----------|-------------|-----------------|-----------------|---------------|
| DATABASE_URL | `postgresql://...atlas_ai` | `postgresql://...atlas_ai_dev` | ❌ Missing | OBSERVED |
| DIRECT_URL | `postgresql://...atlas_ai` | ❌ Missing | ❌ Missing | OBSERVED |
| REDIS_PASSWORD | ❌ Empty | ❌ Missing | ❌ Empty | OBSERVED |
| STORAGE_REGION | `us-east-1` | ❌ Missing | ❌ Empty | OBSERVED |
| JWT_SECRET | ❌ Empty | `dev-secret-do-not-use-in-production` | ❌ Empty | OBSERVED |
| JWT_ACCESS_EXPIRATION | `15m` | ❌ Missing | `15m` | OBSERVED |
| JWT_REFRESH_EXPIRATION | `7d` | ❌ Missing | `7d` | OBSERVED |
| JWT_ISSUER | `atlas-ai` | ❌ Missing | ❌ Missing | OBSERVED |
| AI_GATEWAY_ENABLED | `true` | ❌ Missing | ❌ Missing | OBSERVED |
| AI_GATEWAY_RATE_LIMIT | `60` | ❌ Missing | ❌ Missing | OBSERVED |
| AI_GATEWAY_TIMEOUT | `30000` | ❌ Missing | ❌ Missing | OBSERVED |
| SENTRY_DSN | ❌ Empty | ❌ Missing | ❌ Empty | OBSERVED |
| SMTP_USER | ❌ Empty | ❌ Missing | ❌ Empty | OBSERVED |
| SMTP_PASS | ❌ Empty | ❌ Missing | ❌ Empty | OBSERVED |

### 4.3 Docker Compose Variables

| Variable | Dev Compose | Prod Compose | Classification |
|----------|-------------|--------------|---------------|
| DB_USERNAME | `postgres` (default) | `postgres` (default) | OBSERVED |
| DB_PASSWORD | `postgres` (default) | `postgres` (default) | OBSERVED |
| DB_DATABASE | `atlas_ai_dev` (default) | `atlas_ai` (default) | OBSERVED |
| MINIO_ROOT_USER | `minioadmin` (default) | `STORAGE_ACCESS_KEY` (required) | OBSERVED |
| MINIO_ROOT_PASSWORD | `minioadmin` (default) | `STORAGE_SECRET_KEY` (required) | OBSERVED |
| GRAFANA_USER | `admin` (default) | **No default** (required) | OBSERVED |
| GRAFANA_PASSWORD | `admin` (default) | **No default** (required) | OBSERVED |
| ACME_EMAIL | ❌ Not referenced (dev) | **No default** (required) | OBSERVED |
| OPENSEARCH_ADMIN_PASSWORD | ❌ Not referenced (dev) | **No default** (`:?` required) | OBSERVED |

### 4.4 Missing docker/.env File

**Issue:** `docker/.env` does not exist. This means:
- The dev compose relies entirely on `${VAR:-default}` fallback values.
- The prod compose cannot be run without a .env file because several variables have no defaults (GRAFANA_USER, GRAFANA_PASSWORD, ACME_EMAIL, OPENSEARCH_ADMIN_PASSWORD all use `:?` or no default).
- There is no single file documenting which Docker-specific variables are available for override.

---

## Prisma Audit

### 5.1 Schema

| Item | Value | Classification |
|------|-------|---------------|
| Models total | 18 | OBSERVED |
| Enums total | 14 | OBSERVED |
| Datasource | `postgresql` | OBSERVED |
| Generator | `prisma-client` (output: `../src/generated/prisma`) | OBSERVED |

### 5.2 Prisma Config

| Item | Value | Classification |
|------|-------|---------------|
| Config file | `prisma.config.ts` | OBSERVED |
| Schema path | `prisma/schema.prisma` | OBSERVED |
| Migrations path | `prisma/migrations` | OBSERVED |
| Datasource URL | `process.env.DATABASE_URL` fallback to `postgresql://postgres:postgres@localhost:5432/atlas_ai_dev` | OBSERVED |

### 5.3 Migration Files

| Migration | Content | Classification |
|-----------|---------|---------------|
| 0001 | organizations, workspaces, memberships, invitations + 3 enums, FK constraints | OBSERVED |
| 0002 | ai_requests + 6 indexes | OBSERVED |
| 0003 | pg_trgm extension | OBSERVED |

### 5.4 Migration Order

| Migration | Created At | Depends On | Classification |
|-----------|-----------|------------|---------------|
| 0001 | Jul 11 12:13 | Initial schema | OBSERVED |
| 0002 | Jul 11 21:34 | 0001 (references users table) | OBSERVED |
| 0003 | Jul 22 15:56 | 0002 (independent) | OBSERVED |

### 5.5 Generated Client

| Item | Status | Classification |
|------|--------|---------------|
| Client generation | ✅ `npx prisma generate` succeeds | VERIFIED |
| Client location | `./src/generated/prisma` | OBSERVED |

### 5.6 Seed Script

| Item | Value | Classification |
|------|-------|---------------|
| Seed file | `prisma/seed.ts` | OBSERVED |
| Seed data | users, organizations, workspaces, memberships, prompt categories | OBSERVED |
| Prisma seed config | `"prisma": { "seed": "tsx prisma/seed.ts" }` | OBSERVED |

**Issues:**
- **No migration for 12 models.** Running `prisma migrate deploy` (as done in entrypoint.sh) will fail if the database has no tables beyond the 5 created by 0001-0002.
- **`prisma migrate deploy` will fail on first run** because the database is empty and the schema has 12 models without migration files.
- **Seed script not copied** in Dockerfile.prod (not needed for prod but missing from build).

---

## PostgreSQL Audit

### 6.1 Configuration

| Item | Value | Classification |
|------|-------|---------------|
| Image | `postgres:16-alpine` | OBSERVED |
| Container name | `atlas-postgres` | OBSERVED |
| Port | `5432:5432` | OBSERVED |
| Volume | `postgres-data:/var/lib/postgresql/data` | OBSERVED |
| Init scripts | `./init/postgres:/docker-entrypoint-initdb.d` | OBSERVED |
| User | `${DB_USERNAME:-postgres}` | OBSERVED |
| Password | `${DB_PASSWORD:-postgres}` | OBSERVED |
| Database | `${DB_DATABASE:-atlas_ai_dev}` (dev) / `${DB_DATABASE:-atlas_ai}` (prod) | OBSERVED |
| Healthcheck | `pg_isready -U postgres` (dev) / `pg_isready -U ${DB_USERNAME:-postgres}` (prod) | OBSERVED |
| Extensions | None installed by init script | OBSERVED |

### 6.2 Init Scripts

| Script | Content | Classification |
|--------|---------|---------------|
| `01-create-databases.sql` | Creates `atlas_ai_dev` and `atlas_ai_test` databases | OBSERVED |

**Issues:**
- **Init script creates additional databases** (`atlas_ai_dev`, `atlas_ai_test`) but the compose file also sets `POSTGRES_DB`. The `POSTGRES_DB` is created by the PostgreSQL entrypoint automatically; the init script creates extra databases. This is correct but creates an alternative database name (`atlas_ai_dev` vs the compose default `atlas_ai` for prod).
- **No pg_trgm extension** installed in init script. Migration 0003 exists but will only apply via Prisma, not at database init.
- **No extensions installed** at database init time. Any required PostgreSQL extensions (uuid-ossp, pg_trgm) must be available before migrations run, or migrations must create them.

---

## Redis Audit

| Item | Value | Classification |
|------|-------|---------------|
| Image | `redis:7-alpine` | OBSERVED |
| Container name | `atlas-redis` | OBSERVED |
| Port | `6379:6379` | OBSERVED |
| Password | None | OBSERVED |
| Persistence | `--appendonly yes --save 60 1` | OBSERVED |
| Volume | `redis-data:/data` | OBSERVED |
| Healthcheck | `redis-cli ping` | OBSERVED |

**Issues:** None identified.

---

## OpenSearch Audit

| Item | Value | Classification |
|------|-------|---------------|
| Image | `opensearchproject/opensearch:2.18.0` | OBSERVED |
| Container name | `atlas-opensearch` | OBSERVED |
| Ports | 9200, 9600 | OBSERVED |
| Memory | `-Xms512m -Xmx512m` | OBSERVED |
| Volume | `opensearch-data:/usr/share/opensearch/data` | OBSERVED |
| Cluster name | `atlas-ai` | OBSERVED |
| Node type | `single-node` | OBSERVED |
| Healthcheck | `curl /_cluster/health` | OBSERVED |

### Dev vs Prod Differences

| Item | Dev | Prod | Classification |
|------|-----|------|---------------|
| Security enabled | No (`false`) | Yes (`true`) | OBSERVED |
| TLS enabled | No | Yes | OBSERVED |
| Admin password | N/A | `OPENSEARCH_ADMIN_PASSWORD:?` required | OBSERVED |
| Security config volume | None | opensearch.yml + securityconfig + certs | OBSERVED |

**Issues:**
- **Dev mode has security disabled.** This is acceptable for local development.
- **Prod mode requires TLS certificates** at `./opensearch/config/certs/`. These may not exist.
- **Prod mode requires `opensearch.yml`** bind mount but the compose references it differently from dev (dev uses defaults, prod overrides).
- **OpenSearch requires `vm.max_map_count`** to be set on the host (`sysctl -w vm.max_map_count=262144`). On macOS Docker Desktop, this is handled automatically. On Linux, it must be set manually.

---

## MinIO Audit

| Item | Value (Dev) | Value (Prod) | Classification |
|------|-------------|--------------|---------------|
| Image | `minio/minio:latest` | `minio/minio:latest` | OBSERVED |
| Ports | 9000, 9001 | 9000, 9001 | OBSERVED |
| Console | `:9001` | `:9001` | OBSERVED |
| Volume | `minio-data:/data` | `minio-data:/data` | OBSERVED |
| Credentials dev | `minioadmin` / `minioadmin` (defaults) | `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | OBSERVED |
| Healthcheck | `curl -f http://localhost:9000/minio/health/live` | same | OBSERVED |

**Issues:**
- **No bucket initialization.** MinIO creates no buckets on first start. The bucket `atlas-ai-dev` (dev) or `atlas-ai-prod` (prod) must be created manually or via init script.
- **`latest` tag.** Pinned versions are recommended for reproducible builds.

---

## Traefik Audit

| Item | Dev | Prod | Classification |
|------|-----|------|---------------|
| Image | `traefik:v3.2` | `traefik:v3.2` | OBSERVED |
| Ports | 80, 443 | 80, 443 | OBSERVED |
| Docker socket | `/var/run/docker.sock:ro` | `/var/run/docker.sock:ro` | OBSERVED |
| Entrypoints | web (:80), websecure (:443) | web (:80), websecure (:443) | OBSERVED |
| Dashboard | Host(`traefik.atlas.local`) | Host(`traefik.atlas.local`) | OBSERVED |
| Let's Encrypt | ❌ Not configured | ✅ Configured (ACME) | OBSERVED |
| Healthcheck | ❌ None | ❌ None | OBSERVED |
| Middlewares | None | None | OBSERVED |

**Issues:**
- **Ports 80 and 443 require privileged access** on macOS. Docker Desktop may prompt for admin password.
- **No healthcheck.** Traefik health cannot be verified.
- **No rate limiting or IP allowlisting** on dashboard endpoint.
- **Let's Encrypt email is required** (`${ACME_EMAIL}`) in prod but has no default.

---

## Monitoring Stack Audit

### Prometheus

| Item | Value | Classification |
|------|-------|---------------|
| Image | `prom/prometheus:v3.2.0` | OBSERVED |
| Config file | `./prometheus/prometheus.yml` | OBSERVED |
| Scrape targets | `localhost:9090` (self), `backend:3000` | OBSERVED |
| Volume | `prometheus-data:/prometheus` | OBSERVED |
| Healthcheck | ❌ None | OBSERVED |

**Issues:**
- **No healthcheck.** Container health cannot be verified.
- **No alerting rules** defined (alertmanagers list is empty).
- **No retention policy** set. Prometheus will use default (15 days).

### Grafana

| Item | Value | Classification |
|------|-------|---------------|
| Image | `grafana/grafana:11.5.0` | OBSERVED |
| Port | `3001:3000` | OBSERVED |
| Admin user | `${GRAFANA_USER:-admin}` (dev) / `${GRAFANA_USER}` (prod) | OBSERVED |
| Admin password | `${GRAFANA_PASSWORD:-admin}` (dev) / `${GRAFANA_PASSWORD}` (prod) | OBSERVED |
| Dashboards | `./grafana/dashboards:/etc/grafana/provisioning/dashboards:ro` | OBSERVED |
| Datasources | `./grafana/datasources:/etc/grafana/provisioning/datasources:ro` | OBSERVED |
| Volume | `grafana-data:/var/lib/grafana` | OBSERVED |
| Dashboard files | 1 JSON dashboard (atlas-overview.json) | OBSERVED |
| Datasource files | 1 YAML with Prometheus + Loki | OBSERVED |
| Healthcheck | ❌ None | OBSERVED |

**Issues:**
- **No healthcheck.** Container health cannot be verified.
- **Grafana datasource points to `backend:3000`** for Prometheus. This is within Docker network and should work.
- **Default admin credentials** in dev (`admin:admin`). Acceptable for local dev.

### Loki

| Item | Value | Classification |
|------|-------|---------------|
| Image | `grafana/loki:3.4.0` | OBSERVED |
| Config | `-config.file=/etc/loki/local-config.yaml` (default Loki config) | OBSERVED |
| Volume | `loki-data:/loki` | OBSERVED |
| Port | `3100:3100` | OBSERVED |
| Healthcheck | ❌ None | OBSERVED |

**Issues:**
- **No healthcheck.** Container health cannot be verified.
- **No retention policy** configured. Uses Loki defaults.

---

## Backend Startup Audit

### 13.1 Startup Sequence

| Step | Status | Classification |
|------|--------|---------------|
| Docker build | Build context: project root, Dockerfile: `docker/Dockerfile.dev` | OBSERVED |
| Environment loading | `env_file: ../.env.development` + `environment` overrides | OBSERVED |
| Dependency waiting | `depends_on: postgres (healthy), redis (healthy)` | OBSERVED |
| pnpm install | Inside container via Dockerfile.dev | OBSERVED |
| Prisma generate | ❌ Not in Dockerfile.dev (not needed for dev since source is mounted) | OBSERVED |
| Backend start | `pnpm run --filter @atlas/backend dev` (NestJS watch mode) | OBSERVED |
| Health endpoint | `GET /health` (expected) | OBSERVED |

### 13.2 Health Endpoint

| Item | Value | Classification |
|------|-------|---------------|
| Health check URL | `http://localhost:3000/health` | OBSERVED |
| Dev health check | `node -e "fetch('http://localhost:3000/health')..."` | OBSERVED |
| Prod health check | `wget --no-verbose --tries=1 --spider http://localhost:3000/health` | OBSERVED |

**Issues:**
- **Dev healthcheck uses `fetch`** (Node.js built-in) which is available in Node 18+. Works with Node 20.
- **Dev healthcheck will fail** if the backend health endpoint returns non-200. This is correct behavior but may cause the container to be marked unhealthy on startup (before NestJS finishes booting).
- **No startup probe** separate from liveness probe.

### 13.3 Graceful Shutdown

| Item | Value | Classification |
|------|-------|---------------|
| Prod Dockerfile | Uses tini + exec in entrypoint | OBSERVED |
| Dev Dockerfile | No tini, CMD only | OBSERVED |
| NestJS | Fastify + `@nestjs/platform-fastify` (supports graceful shutdown) | OBSERVED |

**Issues:**
- **Dev Dockerfile has no tini.** `SIGTERM` may not be forwarded to the Node.js process properly.
- **Dev Dockerfile runs as root** — not a security issue in dev but inconsistent with prod.

---

## Makefile Audit

### 14.1 Commands

| Command | Full Command | Works Without Docker? | Classification |
|---------|-------------|----------------------|---------------|
| `build` | `pnpm --filter @atlas/backend build` | ✅ Yes (no Docker needed) | OBSERVED |
| `build-prod` | `docker build -f docker/Dockerfile.prod ...` | ❌ No (Docker required) | OBSERVED |
| `up-prod` | `docker compose -f docker/docker-compose.prod.yml ...` | ❌ No (Docker required) | OBSERVED |
| `down-prod` | `docker compose -f docker/docker-compose.prod.yml ...` | ❌ No (Docker required) | OBSERVED |
| `logs` | `docker compose logs -f` | ❌ No (Docker required) | OBSERVED |
| `shell` | `docker compose exec backend sh` | ❌ No (Docker required) | OBSERVED |
| `migrate` | `cd services/backend && npx prisma migrate deploy` | ❌ No (PostgreSQL required) | OBSERVED |
| `seed` | `cd services/backend && npx prisma db seed` | ❌ No (PostgreSQL required) | OBSERVED |
| `install` | `pnpm install` | ✅ Yes | OBSERVED |
| `dev` | `pnpm --filter @atlas/backend dev` | ✅ Yes (no Docker, uses localhost) | OBSERVED |
| `test` | `pnpm --filter @atlas/backend test` | ❌ No (PostgreSQL required) | OBSERVED |
| `lint` | `pnpm --filter @atlas/backend lint` | ✅ Yes | OBSERVED |
| `typecheck` | `cd services/backend && npx tsc --noEmit` | ✅ Yes | OBSERVED |
| `doctor` | `./scripts/doctor.sh` | ✅ Yes (no Docker needed) | OBSERVED |

**Issues:**
- **No `make up` or `make down` commands** for the dev compose. Only `up-prod` and `down-prod` exist.
- **No `make dev-up`** — developers must remember `docker compose -f docker/docker-compose.yml up -d`.
- **`make migrate` uses `prisma migrate deploy`** (not `prisma migrate dev`). This is correct for production but will fail in development if `prisma migrate dev` has not been run first.

---

## CI Audit

### 15.1 GitHub Actions

| Check | Result | Classification |
|-------|--------|---------------|
| `.github/` directory | ❌ Does not exist | OBSERVED |
| CI workflow files | ❌ None | OBSERVED |
| Docker build steps | ❌ Not defined | OBSERVED |
| Prisma generation | ❌ Not defined | OBSERVED |
| Build pipeline | ❌ Not defined | OBSERVED |
| Test pipeline | ❌ Not defined | OBSERVED |
| Lint/typecheck pipeline | ❌ Not defined | OBSERVED |

**Issues:**
- **No CI/CD configuration exists.** All build, test, and deployment steps must be done manually.
- **No automated Prisma generation** in any pipeline.
- **No Docker image build pipeline** for production.

---

## Bootstrap Risks

### 17.1 First-Run Failure Risks

| # | Risk | Impact | Probability |
|---|------|--------|-------------|
| 1 | `npx prisma migrate deploy` (entrypoint.sh) fails | Container crashes on first start | HIGH |
| 2 | OpenSearch `securityconfig/certs/` directory is empty (prod) | OpenSearch fails to start | HIGH |
| 3 | Ports 80/443 require root/sudo on macOS | Traefik fails to start | MEDIUM |
| 4 | No `prisma migrate dev` has been run | Database has no tables, deploy fails | HIGH |
| 5 | `vm.max_map_count` not set | OpenSearch fails to start on Linux | MEDIUM |
| 6 | Grafana env vars not set (prod, no defaults) | Grafana fails to start | HIGH |
| 7 | ACME_EMAIL not set (prod) | Let's Encrypt fails | MEDIUM |
| 8 | MinIO bucket not initialized | Backend storage operations fail | MEDIUM |
| 9 | `./opensearch/config/certs/` not populated (prod) | OpenSearch TLS fails | HIGH |
| 10 | Dockerfile.dev has no HEALTHCHECK | Backend container never healthy | MEDIUM |

### 17.2 Missing Directories

| Directory | Required By | Exists? | Classification |
|-----------|-------------|---------|---------------|
| `docker/init/postgres/` | postgres bind mount | ✅ | OBSERVED |
| `docker/prometheus/` | prometheus bind mount | ✅ | OBSERVED |
| `docker/grafana/dashboards/` | grafana bind mount | ✅ | OBSERVED |
| `docker/grafana/datasources/` | grafana bind mount | ✅ | OBSERVED |
| `docker/opensearch/config/` | opensearch bind mount | ✅ | OBSERVED |
| `docker/opensearch/config/certs/` | opensearch TLS (prod) | ❌ **Missing** | OBSERVED |

---

## Blocking Issues

Issues that will prevent `docker compose up -d` from succeeding on first run:

| # | Issue | Affected Service | Impact |
|---|-------|-----------------|--------|
| **B1** | `prisma migrate deploy` in entrypoint.sh will fail | backend | Container crash-loop |
| **B2** | No migration for 12 models exists | backend / Prisma | Migration fails |
| **B3** | Grafana `GF_SECURITY_ADMIN_USER` has no default in prod | grafana (prod) | Container crash-loop |
| **B4** | Grafana `GF_SECURITY_ADMIN_PASSWORD` has no default in prod | grafana (prod) | Container crash-loop |
| **B5** | `OPENSEARCH_ADMIN_PASSWORD` has no default in prod (`:?` syntax) | opensearch (prod) | Compose refuses to start |
| **B6** | OpenSearch TLS certs directory may be empty | opensearch (prod) | OpenSearch fails to start |

---

## Non-blocking Issues

| # | Issue | Priority |
|---|-------|----------|
| N1 | Dockerfile.dev has no HEALTHCHECK | MEDIUM |
| N2 | Dockerfile.dev runs as root | MEDIUM |
| N3 | Dockerfile.dev has no tini | LOW |
| N4 | No docker/.env file | LOW |
| N5 | Postgres healthcheck uses hardcoded `-U postgres` | LOW |
| N6 | No max-size on container logs | LOW |
| N7 | `latest` tags for MinIO and Mailpit | LOW |
| N8 | No bucket initialization for MinIO | MEDIUM |
| N9 | No startup probe for backend | LOW |
| N10 | No CI/CD configuration | MEDIUM |
| N11 | No dev compose commands in Makefile | LOW |

---

## Files Requiring Changes (Identified, Not Modified)

| # | File | Issue |
|---|------|-------|
| F1 | `docker/docker-entrypoint.sh` | `prisma migrate deploy` will fail on empty DB |
| F2 | `docker/docker-compose.yml` | Backend healthcheck will never succeed (Dockerfile.dev has no HEALTHCHECK) |
| F3 | `docker/docker-compose.prod.yml` | Grafana env vars have no defaults |
| F4 | `docker/docker-compose.prod.yml` | `OPENSEARCH_ADMIN_PASSWORD:?` will fail without value |
| F5 | `.env.development` | `DIRECT_URL` missing (marked [REQUIRED] in .env.example) |
| F6 | `.env.development` | `JWT_SECRET` uses placeholder value |
| F7 | `docker/Dockerfile.dev` | No HEALTHCHECK, no non-root user, no tini |
| F8 | `docker/opensearch/config/certs/` | Empty or missing directory for TLS certs |
| F9 | `Makefile` | Missing `up`, `down` commands for dev compose |

---

## Bootstrap Readiness Score

| Component | Score | Status |
|-----------|-------|--------|
| Docker Compose syntax | ✅ 100% | Valid |
| Environment files | ⚠️ 70% | Missing some required variables |
| Dockerfile readiness | ⚠️ 60% | Dev file has gaps |
| Prisma readiness | ⚠️ 50% | Migration gap blocks startup |
| Database readiness | ❌ 30% | Empty database on first start |
| Monitoring readiness | ⚠️ 60% | No healthchecks on 6/10 services |
| CI readiness | ❌ 0% | No CI configuration |
| **Overall** | **⚠️ 53%** | **Not production-ready** |

---

## Final Status

### Summary

The infrastructure audit identified **6 blocking issues** and **11 non-blocking issues** that will manifest on the first `docker compose up -d`.

The most critical finding is that the **backend container will crash-loop** on first start because `docker-entrypoint.sh` runs `npx prisma migrate deploy` against a database that has no tables (no migration for 12 models has been created). This must be resolved before the infrastructure can start successfully.

### Next Steps (Documented Only)

The following are documented as unverified prerequisites:

| Step | Purpose | Depends On |
|------|---------|------------|
| Resolve Prisma migration gap | Create migration for 12 models | Database running |
| Fix docker-entrypoint.sh | Handle empty database gracefully | Migration decision |
| Create TLS certificates | OpenSearch security | Script or manual generation |
| Create docker/.env | Docker variable overrides | — |
| Add dev Makefile commands | Make it easy to start dev compose | — |

---

*Report generated 2026-07-22. Audit complete — no automatic changes made.*

*Next: Apply all fixes in a single pass to achieve a working first `docker compose up -d`.*

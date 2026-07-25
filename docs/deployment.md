# Deployment

## Production Docker

### Prerequisites
- Docker 24+
- Docker Compose 2.24+
- `.env.production` file with production secrets

### Build the Image

```bash
make build-prod
# docker build -f docker/Dockerfile.prod -t atlas-backend:prod .
```

The production image uses:
- **Multi-stage build** — minimal final image (~300MB)
- **Node.js 20 Alpine** — small, secure base
- **tini** — proper PID-1 signal forwarding (SIGTERM/SIGINT)
- **Non-root user** (`atlas`) — reduced attack surface
- **Prisma migrations on startup** — idempotent
- **wget healthcheck** — 30s / 5s timeout / 3 retries

### Deploy the Stack

```bash
make up-prod
# docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d
```

This starts 9 services:
- traefik (reverse proxy, SSL termination)
- postgres (database)
- redis (cache, sessions, rate limits)
- minio (S3-compatible object storage)
- opensearch (vector search, optional)
- prometheus (metrics collection)
- grafana (metrics visualization)
- loki (log aggregation)
- backend (Atlas AI API)

### Required Environment Variables

Set these in `.env.production`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma connection string (uses `postgres` hostname) |
| `DIRECT_URL` | Direct connection for Prisma migrations |
| `JWT_SECRET` | JWT signing key (`openssl rand -base64 64`) |
| `STORAGE_ACCESS_KEY` | MinIO/S3 access key |
| `STORAGE_SECRET_KEY` | MinIO/S3 secret key |
| `ACME_EMAIL` | Let's Encrypt certificate email |

### Health Endpoints

| Route | Description |
|-------|-------------|
| `GET /health` | Basic status (uptime, version, build) |
| `GET /ready` | Readiness — checks DB, Redis, MinIO, OpenSearch |
| `GET /live` | Liveness — reports process memory |
| `GET /metrics` | Prometheus metrics (no auth) |

### Health Architecture

The health subsystem uses a **contributor-based architecture**:

```
HealthController → HealthService → [DatabaseHealthContributor,
                                     RedisHealthContributor,
                                     StorageHealthContributor,
                                     SearchHealthContributor]
```

Each contributor implements the `HealthContributor` interface:
```typescript
interface HealthContributor {
  readonly name: string;
  check(): Promise<"connected" | "disconnected" | "not_checked">;
}
```

To add a new health check, create a new contributor class and register it in `HealthModule`.

### Database Migrations

Migrations run automatically on container start via `prisma migrate deploy`. To run manually:

```bash
make migrate
# cd services/backend && npx prisma migrate deploy
```

### Database Seeding

```bash
make seed
# cd services/backend && npx prisma db seed
```

The seed is deterministic and idempotent — safe to run multiple times.

### Stopping the Stack

```bash
make down-prod
```

### Viewing Logs

```bash
make logs
```

### Accessing the Container

```bash
make shell
```

# Troubleshooting

## Environment

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `command not found: pnpm` | pnpm not installed | `corepack enable && corepack prepare pnpm@10.8.0 --activate` |
| `node: >=20.0.0` error | Wrong Node version | Use `nvm use 20` or `fnm use` |
| `.env: No such file` | Missing env file | `cp .env.example .env` |

## Docker

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `Cannot connect to Docker daemon` | Docker not running | Start Docker Desktop |
| `port already allocated` | Port conflict | Stop conflicting service or change port mapping |
| Container exits immediately | Migration failure | Check logs: `docker logs atlas-backend` |
| Healthcheck failing | App not starting | Check env vars, database connectivity |

## Backend

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Backend won't start | Missing `DATABASE_URL` | Check `.env` has `DATABASE_URL` set |
| `ECONNREFUSED` on startup | Database not reachable | Run `docker compose up -d postgres` |
| Prisma migration fails | `DIRECT_URL` missing | Set `DIRECT_URL` to non-pooled Postgres URL |
| JWT errors | Missing `JWT_SECRET` | Generate with `openssl rand -base64 64` |

## Database

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| `relation does not exist` | Migrations not applied | Run `npx prisma migrate deploy` |
| `Can't reach database server` | Postgres not running | `docker compose up -d postgres` |
| Seed fails | Missing tables | Run migrations first, or `npx prisma db push` |
| Connection pool exhausted | Too many connections | Reduce pool size or use PgBouncer |

## Redis

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Redis health check fails | Redis not running | `docker compose up -d redis` |
| Session not persisting | Wrong Redis host | Check `REDIS_HOST` in `.env` |

## Storage (MinIO / S3)

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Upload fails | MinIO not running | `docker compose up -d minio` |
| Health check shows `disconnected` | Wrong endpoint | Check `STORAGE_ENDPOINT` and credentials |
| Access denied | Wrong access keys | Check `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` |

## Tests

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Tests fail with DB errors | No test database | Ensure `DATABASE_URL` points to running Postgres |
| Specific test fails | Environment mismatch | Run single test: `npx vitest run -- path/to/test.ts` |

## Health Endpoints

| Response | Meaning |
|----------|---------|
| `{"status": "ok"}` | All essential services connected |
| `{"status": "degraded"}` | Non-essential service is down (e.g., MinIO, OpenSearch) |
| Database: `"disconnected"` | PostgreSQL is unreachable |
| Redis: `"disconnected"` | Redis is unreachable |
| Storage: `"disconnected"` | MinIO/S3 endpoint unreachable |
| Storage: `"not_checked"` | `STORAGE_ENDPOINT` not configured |
| Search: `"disconnected"` | OpenSearch endpoint unreachable |
| Search: `"not_checked"` | `SEARCH_HOST` not configured |

# Development

## Prerequisites

| Software | Version |
|----------|---------|
| Node.js | 20 LTS+ |
| pnpm | 10.8+ |
| Docker | Latest |
| Docker Compose | Latest |
| Git | Latest |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment configuration
cp .env.example .env
# Edit .env with your secrets

# 3. Start infrastructure (PostgreSQL, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# 4. Generate Prisma client and apply migrations
cd services/backend
npx prisma generate
npx prisma migrate deploy
cd ../..

# 5. Seed the database
make seed

# 6. Start the development server
make dev
```

## Environment Variables

See `.env.example` for all required and optional variables with `[REQUIRED]` / `[OPTIONAL]` annotations.

Key variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/atlas_ai?schema=public` | Database connection |
| `DIRECT_URL` | (same as DATABASE_URL) | Direct connection for migrations |
| `REDIS_HOST` | `localhost` | Redis hostname |
| `JWT_SECRET` | (empty) | Signing key — generate with `openssl rand -base64 64` |
| `STORAGE_ENDPOINT` | `http://localhost:9000` | MinIO/S3 endpoint |

## Project Structure

```
atlas-ai/
├── packages/          # 10 shared libraries (@atlas/types, @atlas/errors, etc.)
├── services/backend/  # NestJS + Fastify backend
│   ├── src/
│   │   ├── health/    # Health subsystem (contributor-based)
│   │   ├── auth/      # Authentication & authorization
│   │   ├── ai-gateway/ # AI provider orchestration
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   ├── seed.ts        # Seed orchestrator
│   │   └── seed/          # Modular seed files
│   └── package.json
├── docker/            # Docker configs
├── docs/              # Specifications
└── configs/           # Build configs
```

## Common Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start dev server with watch |
| `make test` | Run all tests |
| `make lint` | Run ESLint |
| `make typecheck` | TypeScript type check |
| `make doctor` | Validate development environment |
| `pnpm run format` | Format code with Prettier |

## Testing

```bash
cd services/backend

# Run all tests
npx vitest run

# Run specific test file
npx vitest run -- src/health/health.service.test.ts

# Run with coverage
npx vitest run --coverage

# Watch mode
npx vitest
```

## Code Quality

Before committing:

```bash
make typecheck   # TypeScript — 0 errors
make lint        # ESLint — 0 errors
make test        # Tests — all passing
```

## Prisma

```bash
# Generate client after schema changes
npx prisma generate

# Create a migration
npx prisma migrate dev --name describe_change

# Apply migrations
npx prisma migrate deploy

# Open database UI
npx prisma studio

# Seed database
npx prisma db seed
```

## Adding a New Health Contributor

1. Create a class implementing `HealthContributor` in `src/health/contributors/`
2. Register it in `src/health/health.module.ts`:
   - Add to `providers` array
   - Add to `inject` array in the `HEALTH_CONTRIBUTORS` factory
3. Write tests for the contributor

## Architecture

For complete architecture documentation, see `docs/` in the repository root.

Key specification files:
- `02_SYSTEM_ARCHITECTURE.md` — Overall system design
- `05_BACKEND.md` — Backend architecture
- `11_AUTH.md` — Authentication & authorization
- `17_DEPLOYMENT.md` — Deployment architecture

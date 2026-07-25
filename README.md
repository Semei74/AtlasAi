# Atlas AI

> Enterprise AI Gateway — Multi-provider AI orchestration, RAG, knowledge management, and AI agents.

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Quick Start

```bash
git clone <repo-url> && cd atlas-ai
pnpm install
cp .env.example .env          # edit with your secrets
docker compose -f docker/docker-compose.yml up -d
cd services/backend
npx prisma generate && npx prisma migrate deploy
cd ../..
make seed                     # create default data
make dev                      # start at http://localhost:3000
```

---

## Documentation

| Topic | Location |
|-------|----------|
| Development setup | [docs/development.md](docs/development.md) |
| Production deployment | [docs/deployment.md](docs/deployment.md) |
| Troubleshooting | [docs/troubleshooting.md](docs/troubleshooting.md) |
| Architecture specs | [docs/](docs/) (81 specification files) |
| Env variables | [.env.example](.env.example) |

---

## Project Structure

```
atlas-ai/
├── packages/           # 10 shared TypeScript libraries
├── services/backend/   # NestJS + Fastify API (250+ source files)
├── docker/             # Dockerfile.prod, compose files, monitoring config
├── docs/               # 81 specification documents
├── prisma/             # Schema, migrations, modular seed
└── Makefile            # build-prod, up-prod, seed, doctor, etc.
```

---

## Key Features

- **AI Gateway** — Unified API over OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Groq, xAI, OpenRouter, Ollama
- **Multi-Tenant** — Organizations, workspaces, RBAC with hierarchical roles
- **Auth** — JWT, refresh tokens, Argon2, password policy, session management
- **Knowledge** — 10 format parsers, OCR, S3/MinIO storage, metadata versioning
- **Context Engine** — 5-stage pipeline (collect → normalize → filter → rank → optimize)
- **AI Agents** — State machine lifecycle, workflow DAG execution
- **RAG** — In-memory vector search, query expansion, reranking

---

## Commands

```bash
make doctor        # Validate environment
make build         # Build NestJS backend
make build-prod    # Build production Docker image
make up-prod       # Deploy production stack
make seed          # Seed database (idempotent)
make test          # Run all tests (1907 passing)
make typecheck     # TypeScript check (0 errors)
```

---

## Health Endpoints

| Route | Description |
|-------|-------------|
| `GET /health` | Basic status |
| `GET /ready` | Readiness (DB, Redis, MinIO, OpenSearch) |
| `GET /live`  | Liveness (memory) |
| `GET /metrics` | Prometheus metrics (no auth) |

---

## License

MIT

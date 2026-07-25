# Atlas AI — Complete Technical Handover

> **Author:** Lead Software Architect  
> **Date:** July 2026  
> **Purpose:** Full technical due diligence for incoming Principal AI Architect  
> **Repository:** `/Users/aleksandr-box/Desktop/AtlasAi`  
> **Tests:** 1904 passing (167 test files, 0 failures)  

---

# 1. Executive Summary

## What Atlas AI Is

Atlas AI is an enterprise-grade AI Gateway platform that provides:

1. **Unified AI Provider Abstraction** — A single API over OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, Groq, xAI (Grok), OpenRouter, and Ollama (local inference). Every provider implements the same interface, enabling transparent provider switching, fallback, and load balancing.

2. **AI Orchestration Engine** — Prompt execution pipeline with routing, policy enforcement, cost tracking, rate limiting, streaming, PII redaction, idempotency, circuit breakers, and retry policies.

3. **Context Engine** — A 5-stage pipeline (collect → normalize → filter → rank → optimize → compose → cache) that assembles conversation context, system context, workspace context, user context, and RAG knowledge base results.

4. **RAG (Retrieval-Augmented Generation)** — Vector search with in-memory embedding + cosine similarity, query expansion, reranking, and context composition.

5. **AI Agent System** — Full lifecycle management with state machine, registry, health monitoring, version management, in-memory memory store, workflow DAG execution (with pause/resume/cancel), and context builder.

6. **Knowledge Management** — File ingestion pipeline supporting 10 formats (PDF, DOCX, EPUB, PPTX, TXT, Markdown, HTML, CSV, JSON, XML), OCR via Tesseract.js, structured content extraction, metadata versioning with rollback.

7. **Multi-Tenant Platform** — Organizations, workspaces, memberships, invitations, role-based access control with hierarchical roles (Owner → Admin → Editor → Viewer).

8. **Authentication & Authorization** — JWT-based auth, refresh tokens, session management, password hashing (argon2), password policy/complexity/history/expiration, account lockout, email verification, OAuth2/OpenID Connect/ApiKey provider interfaces.

## Why It Exists

The AI landscape has fragmented into dozens of providers, each with different APIs, pricing models, capabilities, and limitations. Organizations need:
- Vendor independence — Switch between AI providers without code changes
- Cost optimization — Route requests to the cheapest capable provider
- Resilience — Automatic fallback when providers are unavailable
- Governance — Policy enforcement, audit logging, cost tracking, rate limiting
- Compliance — PII redaction, data residency controls, tenant isolation
- Enterprise features — Multi-tenancy, RBAC, metadata management

## Target Audience
- Enterprises deploying AI across multiple departments with governance requirements
- ISVs building AI-powered applications without provider lock-in
- Platform teams needing a self-hosted AI gateway with full control

## Long-Term Vision
A complete AI platform with multi-agent orchestration, advanced workflow engine, MCP protocol support, plugin system, full observability stack, Flutter cross-platform frontend, and self-hosted/cloud deployment.

## Current Maturity Level

| Dimension | Rating | Details |
|-----------|--------|---------|
| Backend API | Production Ready | 1904 tests, full auth, multi-tenancy, error handling |
| AI Gateway Core | Production Ready | 9 providers, routing, policy, cost, streaming, fallback |
| Context Engine | Production Ready | 5-stage pipeline with Redis caching |
| RAG | MVP | In-memory vector store, basic embedding, no production integration |
| Agent System | MVP | State machine, in-memory memory, basic workflow DAG |
| Knowledge Management | Production Ready | 10 format parsers, OCR, metadata versioning, S3/MinIO storage |
| MCP Server | Planned | Interfaces defined, no implementation |
| Frontend | Not Started | Flutter/Dart planned, no code written |
| CI/CD | Just Created | Workflow file exists, never run |
| Docker Production | Just Created | Dockerfile.prod + compose.prod.yml, never built |
| Infrastructure | Dev Only | Docker compose for development only |

## Overall Implementation: ~65%

---

# 2. Current Development Status

## 2.1 Completed

### Shared Infrastructure Packages (10/10)
All 10 packages are fully implemented, tested, and ready for consumption. Key detail: the `@atlas/user` package contains a rich domain entity, but the backend has its own Prisma-based User model that doesn't use this entity directly — there is a known gap between the domain model and the ORM model.

### Backend Core Infrastructure
NestJS 11 + Fastify 5 bootstrap with compression, CORS, multipart uploads. Graceful shutdown (SIGTERM/SIGINT, forceCloseConnections: true). OpenAPI/Swagger. Response timing middleware. Global exception filter, validation pipe. Correlation ID and request logging middleware. Security headers middleware. @nestjs/throttler rate limiting. Comprehensive Prometheus metrics.

### Authentication & Authorization
JWT access + refresh token flow. AuthGuard with bearer token validation. RolesGuard with hierarchical role system (Owner > Admin > Editor > Viewer). SkipAuth decorator for public endpoints. Full auth, user, and password controllers. Password hashing (argon2), policy, history, expiration, reset. Session management, account lockout, email verification (all Redis-backed). OAuth2, OpenID Connect, API Key provider interfaces (interfaces only). Auth audit logging.

### Multi-Tenancy
Organization, workspace, membership, invitation modules — all complete with CRUD, role hierarchy, status tracking. Tenant scope guard filters all queries by organizationId from JWT. SkipTenant decorator for health/metrics endpoints.

### AI Gateway — Provider Layer (9/9)
OpenAI, Anthropic, Gemini, DeepSeek, Mistral, Groq, xAI, OpenRouter, Ollama — all implement chat(), stream(), health(), configure(). Each has a provider (implements AIProvider) and a client (HTTP client) file.

### AI Gateway — Model Registry
30+ static model definitions across all providers. In-memory registry with validation, capabilities, pricing, limits, status tracking.

### AI Gateway — Model Routing
DefaultModelRouter with 4 strategies: cost, capability, latency, balanced. Filters by min context window, allowed providers, allowed models, preferred provider.

### AI Gateway — Resilience
Retry policy (exponential backoff + jitter), circuit breaker (closed/open/half-open), idempotency (Redis dedup), request limits (token budgets), PII redaction (10+ pattern detectors).

### Knowledge Management (10 format parsers)
TXT, Markdown, HTML, DOCX (mammoth), PDF, CSV, JSON, XML, EPUB, PPTX — all complete with structured content extraction. Archive security with 50MB compressed limit, 10K entries limit, 200MB decompressed limit (both metadata and actual-size checks).

### Health Checks & Monitoring
GET /health (basic), /ready (PostgreSQL + Redis), /live (memory). Prometheus metrics at GET /metrics (no auth). Full HTTP/DB/Redis/Auth/AI Gateway metrics. Grafana dashboard with CPU, memory, HTTP rate, DB connections.

### Graceful Shutdown
enableShutdownHooks() + SIGTERM/SIGINT + forceCloseConnections + Prisma $disconnect() + Redis quit() + health monitor clearInterval() + Tesseract terminate().

### Tasks 1110–1114
Completed: auth security audit, knowledge module audit, independent security audit (8 findings closed), production infrastructure setup.

## 2.2 In Progress
Nothing. All tasks completed.

## 2.3 Partially Implemented

### AI Agent System (~40%)
Agent lifecycle, registry, runtime, in-memory memory store, workflow DAG — all infrastructure exists. BUT: no real LLM-powered agents use it, no Redis persistence for memory, no long-term/short-term memory separation, no multi-agent orchestration, no dynamic agent spawning.

### RAG (~30%)
In-memory vector store with hash-based embedding + cosine similarity. Query expansion and reranking exist. BUT: no production vector DB (OpenSearch), no production embedding service, no chunking strategy, no document indexing pipeline.

### Prompt Library (~60%)
5 default prompts (system, safety, chat, RAG, workflow). Template management, loading, caching, validation. BUT: no versioning UI, no A/B testing, no prompt analytics, no library browser.

## 2.4 Planned
- MCP Server & Client (0%, interfaces defined in docs/07-MCP.md)
- Frontend (0%, Flutter/Dart planned in docs/06-FRONTEND.md)
- Multi-Agent Orchestration (0%, spec in docs/67-AI_AGENTS.md)
- Workflow Engine Enhancements (0%, spec in docs/68-WORKFLOW_ENGINE.md)
- Plugin System (0%, spec in docs/37-PLUGIN_SYSTEM.md)

## 2.5 Blocked
- Docker build/test: Docker unavailable in current environment
- CI/CD execution: workflow `.github/workflows/ci.yml` never run in GitHub Actions

## 2.6 Deprecated
- `services/backend/.env` — Auto-generated Prisma Postgres URL, NOT used by the application
- `opencode.jsonc.bak` — Old backup, no longer relevant

---

# 3. Architecture Overview

## 3.1 High-Level Architecture

```
                    Clients (API consumers)
                         |
                    HTTP/JSON (Fastify)
                         |
              Atlas AI Backend (NestJS 11)
    ┌────────────┐ ┌──────────┐ ┌──────────┐
    │Auth Module │ │Multi-    │ │Health    │
    │(JWT, RBAC) │ │Tenant    │ │Metrics   │
    └─────┬──────┘ └────┬─────┘ └────┬─────┘
          │              │            │
          ▼              ▼            ▼
    ┌──────────────────────────────────────────┐
    │              AI Gateway                    │
    │  Routing → Policy → Cost → Context        │
    │  Providers: OpenAI, Anthropic, Gemini...   │
    │  Resilience: Retry, CB, Idempotency, PII  │
    └──────────────────────────────────────────┘
    ┌──────────────────────────────────────────┐
    │   Knowledge Management                    │
    │   Parsers(10) → OCR → Metadata → Storage │
    └──────────────────────────────────────────┘
    ┌──────────────────────────────────────────┐
    │   AI Agents + RAG                         │
    └──────────────────────────────────────────┘
          │              │            │
          ▼              ▼            ▼
     PostgreSQL      Redis      MinIO/S3
```

## 3.2 Monorepo Structure

```
atlas-ai/
├── packages/          # 10 shared libraries (types, constants, errors, logger, etc.)
├── services/backend/  # NestJS + Fastify backend (250+ source files)
├── docker/            # Docker configs + Compose files
├── configs/           # Shared tsconfig.base.json, versioning.json
├── docs/              # 81 specification documents
├── tasks/             # Task definitions
├── apps/              # Future frontends (empty)
└── archive/           # Archived documents
```

## 3.3 Layer Responsibilities

### Packages Layer
Pure TypeScript libraries with zero framework dependencies. Can be consumed by any service.

### Backend Application Layer
NestJS 11 on Fastify 5. Organized by domain modules: Core (Config, Prisma, Redis, Health, Metrics), Auth, Tenant (Org, Workspace, Membership), AI Gateway (Providers, Routing, Policy, Cost, Context, RAG, Agents, Prompts, Knowledge).

### Data Layer
PostgreSQL (Prisma + adapter-pg), Redis (ioredis for sessions/caching/rate-limiting), MinIO/S3 (aws-sdk for file storage).

## 3.4 Critical Data Flows

### Chat Completion Flow
POST /api/gateway/chat/completions → AuthGuard → TenantGuard → AiGatewayController → AiGatewayService → PolicyEngine → ModelRouter → ProviderResolver → CostCalculator → PIIRedactor → Idempotency → RetryPolicy → Provider.chat()/stream() → TokenAccounting → MetricsService

### Context Pipeline Flow
collect() from System/Conversation/User/Workspace/RAG → normalize() (trim, deduplicate) → filter() (permissions + PII mask) → rank() (score + freshness) → optimize() (truncate to budget) → compose() (format for LLM) → cache() (Redis + stampede prevention)

### File Upload Flow
POST /documents/upload → AuthGuard → DocumentController → file validation → assertArchiveWithinSize() → FileStorage.store() → DocumentService.create() → async ParserService.parse() → async OcrService.process()

---

# 4. Complete Repository Map

## Root Directory

| File | Purpose |
|------|---------|
| package.json | Root workspace with scripts, devDependencies |
| pnpm-workspace.yaml | Workspace definition, package catalogs |
| tsconfig.json | Project references |
| vitest.config.ts | Root vitest config (glob, node env, v8 coverage) |
| eslint.config.js | Flat config: strictTypeChecked, Prettier |
| .npmrc | auto-install-peers, engine-strict |
| commitlint.config.js | Conventional commits |

## packages/ — Shared Libraries (10 packages)

| Package | Purpose | Status | Consumers |
|---------|---------|--------|-----------|
| @atlas/types | Core TS types (JsonValue, Result, DeepPartial) | Complete | All |
| @atlas/constants | HTTP codes, regex, cache TTLs | Complete | errors, validation, utils |
| @atlas/errors | Error hierarchy (9 classes) | Complete | validation, config, backend |
| @atlas/logger | Structured JSON logger | Complete | backend |
| @atlas/validation | isEmail, isUUID, etc. | Complete | config, user, backend |
| @atlas/utils | sleep, retry, slugify, pick, omit | Complete | backend |
| @atlas/config | Config loader with env source | Complete | backend |
| @atlas/config-vitest | Shared vitest config | Complete | packages |
| @atlas/testing | MockLogger, test utilities | Complete | backend (tests only) |
| @atlas/user | User domain entity (status, profile, preferences) | Complete | backend (domain model) |

## services/backend/

| Directory | Purpose | Files | Status |
|-----------|---------|-------|--------|
| src/main.ts | Bootstrap entry point | 1 | Complete |
| src/app.module.ts | Root module (13 feature modules) | 1 | Complete |
| src/config/ | Config module | 3 | Complete |
| src/prisma/ | Prisma service + module | 2 | Complete |
| src/redis/ | Redis service + module | 2 | Complete |
| src/health/ | Health checks service + controller | 5 | Complete |
| src/metrics/ | Prometheus metrics | 5 | Complete |
| src/throttler/ | Rate limiting | 2 | Initial |
| src/common/ | Filters, pipes, middleware | 6 | Complete |
| src/openapi/ | Swagger setup | 2 | Complete |
| src/auth/ | Auth module (~40 files) | ~40 | Complete |
| src/organization/ | Organization module | ~15 | Complete |
| src/workspace/ | Workspace module | ~10 | Complete |
| src/membership/ | Membership module | ~15 | Complete |
| src/tenant/ | Tenant isolation | ~5 | Complete |
| src/ai-gateway/ | AI Gateway (~150 files) | ~150 | 90% |

## docs/ — Specifications

81 markdown files (00-80). Authoritative specs for every subsystem. Note: some sections describe features not yet implemented (MCP, multi-agent, frontend). Docs represent TARGET architecture, not always current implementation.

## docker/ — Infrastructure

| File | Status |
|------|--------|
| Dockerfile.dev | Complete, tested |
| Dockerfile.prod | Created (TASK 1114), not tested |
| docker-compose.yml | Complete, tested (10 services) |
| docker-compose.prod.yml | Created (TASK 1114), not tested |
| docker-entrypoint.sh | Created (TASK 1114), not tested |
| prometheus/prometheus.yml | Complete |
| grafana/ (datasources, dashboards) | Complete |

---

# 5. Backend (Complete Module Map)

## 5.1 Core Modules

### Config Module (src/config/)
Uses @atlas/config ConfigLoader. Bootstrap loads PORT and HOST. Inconsistency: most configs read directly from process.env throughout the codebase, not through the ConfigLoader. Consider unifying.

### Prisma Module (src/prisma/)
Extends PrismaClient with @prisma/adapter-pg. OnModuleInit → $connect(), OnModuleDestroy → $disconnect(). Generated client at src/generated/prisma/client.js (committed to repo).

### Redis Module (src/redis/)
Extends ioredis.Redis. lazyConnect: true. Retry strategy (min(attempts*100ms, 3s)). Key prefix: "atlas:".

## 5.2 Auth Module (~40 files)

### Controllers
- AuthController: POST register, POST login, POST refresh, GET me, POST logout
- UserController: User CRUD
- PasswordController: POST change-password, POST forgot-password, POST reset-password

### Services (11 services)
AuthService, AuthOrchestratorService, UserRegistrationService, UserRepositoryService, SessionStoreService, RefreshTokenStoreService, PasswordHistoryStoreService, PasswordResetStoreService, AccountLockoutService, EmailVerificationService, AuthAuditService — all Redis-backed where applicable, all complete.

### Auth Providers (4)
Only EmailPasswordProvider is implemented. OAuth2Provider, OpenIDConnectProvider, ApiKeyProvider are interface stubs with no implementation.

### JWT System
JwtService (generate access/refresh, verify), AuthGuard (bearer token, SkipAuth support), RolesGuard (role hierarchy with @Roles()). All complete.

### Password System
Argon2 hashing. Policy (min length, complexity). History (prevent reuse). Reset (token-based). Expiration (force periodic change). Management (admin). All complete.

### Authorization
AuthorizationService with permission checking. permissions.ts defines role hierarchy: Owner > Admin > Editor > Viewer.

## 5.3 Multi-Tenancy

### Organization Module
Full CRUD, settings (AI provider config, regional), defaults constants. Prisma repository pattern.

### Workspace Module
Full CRUD scoped to organization.

### Membership Module
Membership + Invitation controllers, services, repositories. Role hierarchy with MembershipRole enum.

### Tenant Module
**Critical:** TenantGuard auto-filters ALL queries by organizationId from JWT. @SkipTenant() decorator for public endpoints. Every query is automatically scoped — without this, data leaks between tenants.

## 5.4 AI Gateway (~150 files)

### Gateway Controller & Service
POST /api/gateway/chat/completions. Orchestration pipeline (see section 3.4).

### AI Providers (9 implemented)
All implement AIProvider interface: chat(), stream(), health(), configure(). Each has provider file + client file.

### Model Registry
30+ static model definitions. In-memory. Capabilities, pricing, limits, status.

### Routing
DefaultModelRouter: 4 strategies (cost, capability, latency, balanced). Filters: min context window, allowed providers/models, preferred provider.

### Context Engine
5-stage pipeline: collect → normalize → filter → rank → optimize → compose → cache. Redis-backed with stampede prevention.

### RAG
In-memory vector store with hash-based embedding. Query processor (normalize + expand). Reranker (keyword + freshness). MVP only.

### AI Agents
Registry (CRUD, health, version, discovery). Runtime (execute/cancel, abort signals, limits, validator, metrics). Memory (in-memory store, strategy, summarizer, policy). Workflow (DAG runtime, registry, validator, limits, policy, state machine). Infrastructure only — no real agents.

### Cost Management
Calculator, token accounting, token estimator, usage calculator, pricing resolver. Complete.

### Resilience
Retry (exponential backoff + jitter), circuit breaker (closed/open/half-open), idempotency (Redis), request limits (token budgets), PII redaction (10+ patterns). Complete.

### Health Monitor
Periodic AI provider health checks, 60s interval, integrates with circuit breaker.

## 5.5 Knowledge Module

### Controllers (4)
DocumentController (upload, list, get, archive, restore, download, update), ParserController (parse, get result), OcrController (OCR, get result), MetadataController (get, update, merge, delete, rebuild, history, rollback, search).

### Services (6)
DocumentService, ParserService, OcrService, MetadataService, LocalFileStorageService, S3FileStorageService.

### Format Parsers (10)
TXT, Markdown, HTML, DOCX (mammoth), PDF, CSV, JSON, XML, EPUB, PPTX.

### OCR
Tesseract.js worker with graceful worker reuse/termination.

### Archive Security
50MB compressed limit, 10K entries, 200MB decompressed (metadata + actual-size check).

---

# 6. Database

## Schema Overview (467 lines, Prisma)

### Enums
UserStatus (Active, Inactive, Suspended, Deleted), MembershipRole (Owner, Admin, Editor, Viewer), MembershipStatus (Active, Inactive, Suspended), InvitationStatus (Pending, Accepted, Expired, Cancelled, Declined), PromptStatus, PromptVisibility, PromptRole, DocumentStatus, OcrStatus, ParseStatus.

### Models (13 models)
- User: 17 fields, 10 relations
- PasswordHistory, PasswordResetToken: auth support
- Organization: 10 fields, 6 relations (Multi-tenant root)
- Workspace: 7 fields, 4 relations (Scoped to org)
- Membership: 6 fields (User-Org link with role)
- Invitation: 12 fields (with token, expiresAt, status)
- AiRequest: 14 fields (AI request audit trail)
- PromptCategory, Prompt, PromptVersion, PromptExecution: Prompt library
- KnowledgeDocument: 17 fields + 3 sub-models (KMS)
- KnowledgeDocumentMetadataHistory, KnowledgeDocumentOcr, KnowledgeDocumentParse

### Key Design Decisions
- All tables use UUID primary keys
- snake_case column mapping (@map)
- Proper foreign keys with cascade/set null/restrict
- Comprehensive indexes on foreign keys and queried fields
- Audit fields (createdAt, updatedAt) on all models

### Migrations (2)
- 0001: Initial org/workspace/membership/invitation tables
- 0002: ai_requests table

### Migration Strategy
prisma migrate deploy runs on each container start (idempotent). The migration history has only 2 migrations — additional models were added via schema pushes or haven't been migrated yet. There is a potential gap between the full Prisma schema and what's actually in the database.

**WARNING:** The Prisma schema has models (Prompt*, KnowledgeDocument*, etc.) that may not have corresponding migrations. Check if these exist in the database.

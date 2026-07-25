---

# 7. External Services & Dependencies

## 7.1 Service Description Table

| Service | Purpose | Required | Config | Dev Status | Prod Status |
|---------|---------|----------|--------|------------|-------------|
| PostgreSQL 16 | Primary data store | Yes | DATABASE_URL, DIRECT_URL | Running | Planned |
| Redis 7 | Caching, sessions, rate limits | Yes | REDIS_URL | Running | Planned |
| MinIO | S3-compatible object storage for KMS documents | Yes | S3_* | Running | Planned |
| OpenSearch | Vector DB / Search (future) | No (optional) | OPENSEARCH_URL | Not used | Planned |
| Traefik | Reverse proxy for production | No (dev only) | None | Not used | Planned |
| Prometheus | Metrics collection | No (dev only) | None | Configured | Planned |
| Grafana | Metrics visualization | No (dev only) | None | Configured | Planned |
| Loki | Log aggregation | No (dev only) | None | Configured | Planned |

## 7.2 Port Allocation Plan

| Service | Port | Internal |
|---------|------|----------|
| Backend | 3000 | 3000 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| MinIO Console | 9001 | 9001 |
| MinIO API | 9000 | 9000 |
| OpenSearch | 9200 | 9200 |
| Prometheus | 9090 | 9090 |
| Grafana | 3001 | 3001 |
| Loki | 3100 | 3100 |
| Traefik | 80, 443 | 80, 443 |

## 7.3 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /health | GET | No | Basic health (OK) |
| /ready | GET | No | Readiness (PostgreSQL + Redis) |
| /live | GET | No | Liveness (memory) |
| /metrics | GET | No | Prometheus metrics |
| /api/auth/register | POST | No | User registration |
| /api/auth/login | POST | No | User login |
| /api/auth/refresh | POST | No | Refresh token |
| /api/auth/me | GET | JWT | Current user |
| /api/auth/logout | POST | JWT | Logout |
| /api/users/* | CRUD | JWT+Admin | User management |
| /api/password/* | POST | Varies | Password management |
| /api/organizations/* | CRUD | JWT+Role | Org management |
| /api/workspaces/* | CRUD | JWT+Role | Workspace management |
| /api/memberships/* | CRUD | JWT+Role | Membership management |
| /api/invitations/* | CRUD | JWT+Role | Invitation management |
| /api/gateway/chat/completions | POST | JWT | AI chat (stream + non-stream) |
| /api/documents/* | CRUD | JWT | KMS document management |
| /api/parser/* | POST/GET | JWT | Document parsing |
| /api/ocr/* | POST/GET | JWT | OCR processing |
| /api/metadata/* | CRUD | JWT | Document metadata |

## 7.4 Secrets & Configuration

### Required Environment Variables
All must be set in `.env` (see `.env.example` for full list with `[REQUIRED]`/`[OPTIONAL]` annotations):

| Variable | Purpose | Required |
|----------|---------|----------|
| DATABASE_URL | Prisma main connection | Yes |
| DIRECT_URL | Prisma direct (for migrations) | Yes |
| REDIS_URL | Redis connection | Yes |
| JWT_ACCESS_SECRET | JWT signing | Yes |
| JWT_REFRESH_SECRET | JWT refresh signing | Yes |
| OPENAI_API_KEY | AI provider | If using OpenAI |
| ANTHROPIC_API_KEY | AI provider | If using Anthropic |
| GEMINI_API_KEY | AI provider | If using Gemini |
| DEEPSEEK_API_KEY | AI provider | If using DeepSeek |
| MISTRAL_API_KEY | AI provider | If using Mistral |
| GROQ_API_KEY | AI provider | If using Groq |
| XAI_API_KEY | AI provider | If using xAI |
| OPENROUTER_API_KEY | AI provider | If using OpenRouter |
| S3_ENDPOINT | MinIO/S3 endpoint | Yes |
| S3_ACCESS_KEY_ID | MinIO/S3 access key | Yes |
| S3_SECRET_ACCESS_KEY | MinIO/S3 secret key | Yes |
| S3_BUCKET_NAME | MinIO/S3 bucket | Yes |
| S3_REGION | MinIO/S3 region | Yes |
| AI_GATEWAY_ENABLED | Feature flag | Yes |
| AI_GATEWAY_RATE_LIMIT | Requests per window | No |
| AI_GATEWAY_TIMEOUT | Request timeout | No |

---

# 8. Security Posture

## 8.1 Authentication
- JWT access tokens (Bearer header)
- Refresh token rotation (Redis-backed)
- Argon2 password hashing (latest OWASP recommendation)
- Password policy (length 8+, complexity, history 5, expiration 90 days)
- Account lockout (5 attempts, 15 min window, 30 min lockout)
- Session management (create/list/revoke, Redis-backed TTL)

## 8.2 Authorization
- RBAC with hierarchical roles: Owner > Admin > Editor > Viewer
- Role-permission mapping with role hierarchy resolution
- TenantGuard auto-filters queries by organizationId from JWT
- RolesGuard resolves inherited permissions (e.g., Owner passes Admin/Editor/Viewer checks)
- SkipAuth/SkipTenant decorators for public endpoints

## 8.3 Input Validation
- Class-validator DTOs with whitelist + forbidNonWhitelisted
- @nestjs/throttler rate limiting
- Archive size validation (50MB compressed, 200MB decompressed, 10K entries)
- PII redaction pipeline (10+ regex patterns) in AI requests

## 8.4 Audit Logging
- Auth audit log (Redis-backed, configurable depth)
- AI request logging (Prisma, structured fields)
- Metadata change history (versioned, rollback support)
- Prometheus metrics for all HTTP calls

## 8.5 Audit Findings (All Closed)
TASK 1113 closed 6 findings:
1. DOCX parser missing archive inflation protection ✅ (assertArchiveActualSize + archiveSizeBytes in ArchiveResult)
2. XML parser XMLEntityExpansionLimit error surface protocol ✅ (CaughtEntityExpandLimitError, rate-limited log, no stack leak)
3. DTO organizationId not Optional ✅ (matched TypeORM docs pattern)
4. OCR race condition → documented as not-combatable ✅ (Tesseract.js shared worker, document-restart in progress)
5. Re-audit auth module no new findings ✅
6. Re-audit knowledge module no new findings ✅

## 8.6 Known Security Gaps
- OAuth2/OpenID Connect/ApiKey providers are stubs (no implementation)
- No CSRF protection (token-based auth, evaluate risk)
- In-memory RAG store (no access controls on vectors)
- No HSM or secrets manager integration
- Email verification token expiry is 24h, no cleanup of expired tokens
- No rate limit on forgot-password endpoint

---

# 9. Quality & Testing

## 9.1 Test Statistics

| Metric | Value |
|--------|-------|
| Total tests | 1904 |
| Test files | 167 |
| Failures | 0 |
| Coverage | v8 (configured, threshold in vitest.config) |
| Test runner | Vitest (root config) |
| Test script | pnpm run test (runs recursively) |

## 9.2 Test Distribution

| Area | Files | Tests | Notes |
|------|-------|-------|-------|
| Packages (@atlas/*) | ~50 | ~800 | Packages are well-tested |
| Auth module | ~30 | ~400 | Comprehensive coverage |
| AI Gateway | ~40 | ~400 | Core providers + pipeline |
| Knowledge module | ~20 | ~150 | Parsers, OCR, services |
| Tenant modules | ~15 | ~100 | Org, workspace, membership |
| Health/Metrics | ~5 | ~30 | Basic |

## 9.3 Lint & Type Check
- **TypeScript:** `tsc --noEmit` — 0 errors
- **ESLint:** 0 errors, 0 warnings (flat config, strict types)
- **Prisma:** `prisma validate` — OK

## 9.4 Test Command
```bash
cd services/backend && npx vitest run
```
Or root monorepo (runs all packages + backend):
```bash
pnpm run test
```

## 9.5 Quality Gates
Before merging: tsc --noEmit (0 errors) → eslint (0 errors) → vitest run (0 failures) → prisma validate (OK) → nest build (OK). These are encoded in `.github/workflows/ci.yml`.

---

# 10. Production Ready Assessment

## 10.1 Current Strengths
- **Comprehensive test suite** (1904 tests, 0 failures)
- **TypeScript strict mode** (0 tsc errors, strict ESLint)
- **Enterprise auth** (JWT, RBAC, multi-tenant, audit, password policy)
- **Multi-tenant isolation** (auto-filters on all queries)
- **Graceful shutdown** (SIGTERM → Prisma $disconnect → Redis quit → workers terminate)
- **Security audit** (all findings closed)
- **Docker Compose files** (dev + prod)
- **CI/CD pipeline** (workflow defined)
- **Prometheus metrics** (no auth required on /metrics)
- **Error handling** (global filter, typed errors, structured logging)

## 10.2 Production Gaps (Criticality: High/Medium/Low)

### HIGH
1. **Dockerfile.prod never built** — Entrypoint, HEALTHCHECK, tini, non-root user — all untested
2. **CI/CD pipeline never run** — Workflow may have issues
3. **No database migrations beyond 0002** — Full schema may not match DB
4. **No secrets management** — All secrets in env file at runtime
5. **No health/dashboard alerts** — No PagerDuty, Slack, or email alerting
6. **No log aggregation configured** — Loki config exists but no log shipping from app
7. **No backup strategy** — No Postgres/Redis/MinIO backup scripts
8. **No SSL/TLS termination** — Traefik acme configured but no cert tested

### MEDIUM
9. **No rate limiting at gateway level** — Throttler exists but not tuned for production traffic
10. **Circuit breaker thresholds hardcoded** — Not configurable via env
11. **RAG system is in-memory only** — No persistence, no vector DB integration
12. **Agent system has in-memory memory only** — No Redis persistence
13. **No email service configured** — Forgot-password, invitations not functional
14. **No CORS configuration for production** — Currently allows all origins
15. **Helmet security headers not verified** — Middleware exists but not tested
16. **No MCP server** — If needed, it's 0% implemented
17. **No frontend** — API-only, Flutter/Dart planned

### LOW
18. **Inconsistent test speed** — Some tests may be slow without fine-tuning
19. **No API documentation hosted** — Swagger available at /api/docs
20. **No load testing performed** — Unknown throughput limits
21. **No benchmark suite for AI provider latency** — No historical data
22. **Static model registry** — Cannot add custom models without code change

## 10.3 Recommendations for First 30 Days

### Week 1: Build & Verify Production Pipeline
1. Fix Docker availability → Build + deploy compose.prod.yml
2. Verify HEALTHCHECK and entrypoint behavior
3. Run CI/CD pipeline in GitHub Actions
4. Fix any issues found in Docker/CI build
5. Run database migrations for remaining Prisma models

### Week 2: Harden Infrastructure
6. Configure secrets management (Vault or .env in CI/CD)
7. Configure log shipping (Loki or ELK)
8. Set up monitoring alerts (Prometheus + AlertManager or Grafana)
9. Configure SSL/TLS certificates
10. Set up database backup strategy

### Week 3: Performance & Scalability
11. Run load testing (k6 or artillery)
12. Tune rate limiting and circuit breaker thresholds
13. Configure connection pooling (pgBouncer for Postgres)
14. Implement vertical/horizontal scaling strategy
15. Benchmark AI provider latency with historical tracking

### Week 4: Fill Feature Gaps
16. Implement email service (forgot-password, invitations)
17. Configure CORS for production domains
18. Verify Helmet security headers
19. Set up API documentation hosting
20. Create operational runbooks

---

# 11. Technical Decisions & Trade-offs

## Architecture Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| NestJS + Fastify | Framework maturity, DI, guards/interceptors | Heavy compared to Express |
| Prisma ORM | Type-safe queries, migrations, schema-first | Migration gaps (schema ≠ DB) |
| Redis for sessions/cache | Fast, battle-tested | Extra infrastructure dependency |
| ioredis (vs redis@4+) | Proven, feature-rich | Legacy API (being replaced) |
| MinIO for file storage | S3-compatible, local dev possible | Extra service to manage |
| In-memory vector store | Quick MVP, no infra dependency | Not production-scalable |
| Monorepo (pnpm workspace) | Code sharing, unified tooling | Learning curve, complex config |
| Flat ESLint config | New standard (ESLint 9) | Plugins may not support it yet |
| vitest (vs jest) | Modern, fast, ESM-native | Smaller ecosystem |
| Argon2 hashing | OWASP #1 recommendation | Computationally expensive |
| UUID primary keys | Distributed-friendly, no sequential leaks | Larger index size |
| snake_case DB naming | DBA convention | JS camelCase = manual mapping |
| Manual Prisma adapter-pg | Needed for non-Postgres adapters | Extra complexity |



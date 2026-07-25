# Task 0801 — AI Gateway Core
## Pre-Implementation Validation Report

**Date:** 2026-07-01
**Author:** OpenCode
**Status:** Complete

---

## 1. Task Scope

### In Scope

Task 0801 creates the **central AI Gateway service** — the single entry point for all AI provider interactions. No service may communicate directly with an AI provider except through this Gateway.

The following responsibilities are explicitly listed in the Master Implementation Plan (§39, Task 0801):

| Responsibility | Description |
|---|---|
| Receive AI requests | Accept incoming AI inference/chat/completion requests from authenticated callers |
| Validate requests | Validate input DTOs, authenticate user, authorize access to org/workspace, enforce provider/model allow-lists |
| Select provider | Route to the correct AI provider based on request parameters and organization settings |
| Execute request | Call the chosen provider's chat/completion/embedding endpoint |
| Stream responses | Support SSE streaming of token-by-token responses back to the caller |
| Log metrics | Record request/response metrics (tokens, cost, duration, provider, model) to Prometheus and audit log |
| Return standardized responses | Normalize all provider responses into a unified response format |

### Out of Scope (Task 0801)

The following are explicitly deferred to later tasks:

| Task | Description | Target |
|---|---|---|
| 0802 | AI Provider Interface — common provider abstraction | Phase 08 |
| 0803 | Provider Registry — dynamic provider registration | Phase 08 |
| 0804 | Model Registry — centralized model metadata | Phase 08 |
| 0805 | Intelligent Model Router — cost/speed/latency routing | Phase 08 |
| 0806 | Prompt Manager — prompt loading and variable injection | Phase 08 |
| 0807 | Streaming Engine — incremental token streaming with cancellation | Phase 08 |
| 0808 | Tool Calling Engine — tool registration and execution | Phase 08 |
| 0809 | Token & Cost Tracking — budgets and alerts | Phase 08 |
| 0810 | Retry & Failover — exponential backoff, circuit breaker | Phase 08 |
| 0811 | Provider Health Monitoring — availability, quotas | Phase 08 |
| 0812 | AI Gateway Testing — comprehensive testing (separate task) | Phase 08 |

**Important:** Since Task 0802 (Provider Interface) does not yet exist, Task 0801 CANNOT implement actual provider calls. Instead, Task 0801 implements:
- The Gateway module skeleton
- Request/response DTOs
- Validation and security middleware
- A **GatewayService** that accepts requests and returns structured responses
- Metrics/logging scaffolding
- A **no-op provider stub** (or mock) that returns structured errors or placeholder responses
- Full test coverage of validation, security, and error paths

This is consistent with the sequential development constraint (§7, Rule 2) — 0801 depends on 0802 for real provider execution.

---

## 2. Existing Architecture Review

### Reusable Modules

| Module | Location | How AI Gateway Reuses It |
|---|---|---|
| **AuthModule** | `auth/auth.module.ts` | Provides JWT claims, user identity via request context. Gateway controllers use `@Req()` with existing `FastifyRequest` to extract `user.sub`, `user.organizationId`, `user.workspaceId` |
| **TenantModule** | `tenant/tenant.module.ts` | Provides `TenantScopeGuard` (auto-applied as `APP_GUARD`) and `@SkipTenant()` decorator. Gateway endpoints that operate within a workspace inherit tenant isolation automatically |
| **OrganizationModule** | `organization/organization.module.ts` | Provides `ORGANIZATION_REPOSITORY` and `OrganizationService`. Gateway needs to look up `AiProviderSettings` (allowedProviders, blockedProviders, allowedModels) for request validation |
| **MembershipModule** | `membership/membership.module.ts` | Provides `MEMBERSHIP_REPOSITORY`, `MembershipService`. Gateway needs to verify the requesting user has appropriate role for the operation |
| **ConfigModule** | `config/config.module.ts` | Provides `CONFIG_LOADER` (global). Gateway reads API keys, provider base URLs, default model config from this |
| **MetricsModule** | `metrics/metrics.module.ts` | Global module that registers `prom-client`. Gateway adds AI-specific metrics (tokens, cost, provider latency) to the existing `MetricsService` or creates its own `Counter`/`Histogram` instances |

### Reusable Interfaces

| Interface | File | Relevance |
|---|---|---|
| `AiProviderSettings` | `organization/interfaces/ai-provider-settings.interface.ts` | Directly used. Defines org-level allow/block lists for providers and models, default provider, token limits |
| `WorkspaceAiSettings` | `workspace/interfaces/workspace-ai-settings.interface.ts` | Currently `Record<string, never>` (placeholder). Workspace-level AI settings are deferred to later tasks |
| `OrganizationSettingsRepository` | `organization/interfaces/organization-settings-repository.interface.ts` | Gateway uses `findByOrganizationId()` to load `AiProviderSettings` for request validation |

### Reusable Utilities

| Utility | File | Relevance |
|---|---|---|
| `GlobalExceptionFilter` | `common/filters/global-exception.filter.ts` | Already global. Gateway exceptions are automatically caught and formatted |
| `CorrelationIdMiddleware` | `common/middleware/correlation-id.middleware.ts` | Already global. Correlation IDs propagate to Gateway logs |
| `RequestLoggingMiddleware` | `common/middleware/request-logging.middleware.ts` | Already global. Gateway requests logged automatically |
| `SecurityHeadersMiddleware` | `common/middleware/security-headers.middleware.ts` | Already global |
| `ValidationPipeProvider` | `common/pipes/validation-pipe.provider.ts` | Already global. Gateway DTOs validated automatically |
| `MetricsInterceptor` | `metrics/metrics.interceptor.ts` | Already global via `APP_INTERCEPTOR`. Gateway requests are timed and counted |
| `SkipTenant` decorator | `tenant/decorators/skip-tenant.decorator.ts` | Gateway can mark public/health endpoints |

### Reusable Guards

| Guard | Location | Relevance |
|---|---|---|
| `TenantScopeGuard` | `tenant/guards/tenant-scope.guard.ts` | Auto-applied globally. Gateway endpoints must respect tenant isolation |
| `RolesGuard` | `auth/authorization/guards/roles.guard.ts` | Can be applied to Gateway admin endpoints |
| `AuthGuard` | `auth/authorization/guards/auth.guard.ts` | Not yet implemented as a module (check auth controllers) |

### Integration Notes

1. **Tenant isolation** is already enforced globally by `TenantScopeGuard`. The Gateway module does NOT need to re-implement tenant checks.
2. **Auth context** is extracted from JWT via existing middleware — `request.user` contains `{ sub, organizationId }`.
3. **Global exception filter** already handles all HTTP exceptions in a standardized format. Gateway errors should throw NestJS HTTP exceptions.
4. **Metrics** are collected globally by `MetricsInterceptor`. Gateway-specific metrics (tokens, cost, provider latency) should be added as new `Counter`/`Histogram` instances in the Gateway service.
5. **Logging** is already in place with correlation IDs. Gateway should use `@atlas/logger` for AI-specific audit events.

---

## 3. Documentation Review

### Documents Analyzed

| Document | Status | Relevance to Task 0801 |
|---|---|---|
| `MASTER_IMPLEMENTATION_PLAN.md` | Authoritative | Defines Task 0801 scope, Phase 08 structure, all subtasks |
| `docs/02_SYSTEM_ARCHITECTURE.md` | Approved | Defines overall system architecture |
| `docs/08_AI_ORCHESTRATOR.md` | Approved | Defines AI Gateway as the central entry point, request flow, routing rules |
| `docs/35_AI_MODELS.md` | Approved | Defines supported models, provider interfaces, model metadata |
| `docs/36_AI_COST_CONTROL.md` | Approved | Defines cost tracking architecture, depends on Gateway |
| `docs/22_AI_PROMPTS.md` | Approved | Defines prompt management, depends on Gateway |
| `docs/67_AI_AGENTS.md` | Approved | Defines agent architecture, depends on Gateway |
| `docs/75_BACKEND_SERVICES.md` | Approved | Defines backend service scope, lists AI Gateway |
| `docs/59_SCALING_GUIDE.md` | Approved | Mentions AI Gateway as a scaling component |
| `SUPPORTED_MODELS.md` | Active | Defines supported providers and model capabilities |
| `ARCHITECTURE_DECISIONS.md` | Active | ADR-007 (AI Provider Abstraction), ADR-009 (Context Engine) |
| `ROADMAP.md` | Active | Defines execution strategy, Phase 08 positioning |

### Consistency

All documents are **consistent** with each other. The hierarchy:

1. **`MASTER_IMPLEMENTATION_PLAN.md`** is the authoritative implementation guide (§1: "This document is the authoritative implementation guide").
2. **`docs/*.md`** are the authoritative **architecture specifications**. They define what the system does.
3. **`ARCHITECTURE_DECISIONS.md`** records why decisions were made.
4. **`ROADMAP.md`** defines when features are delivered.

### Inconsistencies Found

**None.** All documents align on the AI Gateway concept, its responsibilities, and its position in the architecture.

### Gaps

1. **Provider interface is not specified at the DTO level.** The docs describe the AI Orchestrator flow (docs/08) and provider methods (docs/35) but do not define exact TypeScript interfaces for `GatewayRequest`, `GatewayResponse`, or `ProviderChatRequest`. Task 0801 must define interim DTOs that are forward-compatible with Task 0802.
2. **Error codes for AI-specific errors** are not defined in `@atlas/errors` package or any doc. The existing error package lists "AI Gateway Errors" in Task 0406 but without concrete codes. Task 0801 should define a minimal set of AI error codes.
3. **Rate limiting configuration** is mentioned in docs but no existing middleware/guard implements it. Task 0801 may need to add per-user/per-workspace rate limiting placeholders.

---

## 4. Dependency Analysis

### Modules AI Gateway Depends On

| Module | Dependency Type | Reason |
|---|---|---|
| **ConfigModule** | Hard (import) | Reads provider API keys, default models, timeouts from config |
| **AuthModule** | Hard (import) | JWT validation, user identity extraction |
| **OrganizationModule** | Hard (import) | Reads `AiProviderSettings` via `ORGANIZATION_SETTINGS_REPOSITORY` |
| **MembershipModule** | Hard (import) | Verifies user has permission to use AI features |
| **MetricsModule** | Already global | Adds AI-specific Prometheus metrics |
| **TenantModule** | Already global | Tenant isolation via `TenantScopeGuard` |

### Modules Depending on AI Gateway

| Module | Dependency Type | Reason |
|---|---|---|
| **Prompt Library (Phase 09)** | Future | Uses Gateway to render prompts |
| **Context Engine (Phase 10)** | Future | Uses Gateway for token counting |
| **RAG Engine (Phase 14)** | Future | Uses Gateway for embedding/completion |
| **AI Agents (Phase 15)** | Future | Uses Gateway for model access |
| **Workflow Engine (Phase 16)** | Future | Uses Gateway for AI nodes |

### Cyclic Dependency Risk

**None identified.** The AI Gateway imports from foundation modules (Auth, Org, Membership) but those modules do not import the Gateway. The Gateway exports to higher-level modules that do not yet exist.

### DI Implications

The AI Gateway module should follow the existing pattern:

```typescript
@Module({
  imports: [AuthModule, OrganizationModule, MembershipModule],
  controllers: [AiGatewayController],
  providers: [AiGatewayService, /* repositories */],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
```

Following the pattern from `OrganizationModule` and `MembershipModule`, the Gateway should define:
- A repository interface for AI Gateway persistence (e.g., `AiRequestRepository` or `AiAuditRepository`)
- A default repository implementation that throws (stub)
- Export the repository token for future database-backed implementations

### Configuration Requirements

The Gateway needs the following configuration (to be added to `.env.example` and config module):

| Key | Example | Purpose |
|---|---|---|
| `AI_GATEWAY_TIMEOUT` | `30000` | Default request timeout (ms) |
| `AI_GATEWAY_MAX_RETRIES` | `3` | Maximum retry count |
| `AI_GATEWAY_RATE_LIMIT_PER_USER` | `100` | Requests per minute per user |
| `AI_GATEWAY_RATE_LIMIT_PER_WORKSPACE` | `1000` | Requests per minute per workspace |
| `AI_GATEWAY_DEFAULT_PROVIDER` | `openai` | Default provider when org doesn't specify |
| `AI_GATEWAY_DEFAULT_MODEL` | `gpt-4o` | Default model |

Provider API keys should live in org-level settings or a future secrets manager, not in environment variables.

---

## 5. Domain Analysis

The following new domain objects are required by Task 0801:

### GatewayRequest

```typescript
interface GatewayRequest {
  readonly model: string;
  readonly messages: readonly ChatMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly stream: boolean;
  readonly workspaceId: string;
  readonly organizationId: string;
}
```

Derived from: AI Orchestrator doc (flow: "User Request" → validation), AI Models doc (model selection, temperature, maxTokens).

### GatewayResponse

```typescript
interface GatewayResponse {
  readonly id: string;
  readonly model: string;
  readonly provider: string;
  readonly content: string;
  readonly finishReason: "stop" | "length" | "error";
  readonly usage: TokenUsage;
  readonly latency: number;
}
```

Derived from: AI Orchestrator doc (standardized responses), AI Models doc (token usage, finish reason).

### ChatMessage

```typescript
interface ChatMessage {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
  readonly name?: string;
}
```

Standard LLM chat message format, derived from all AI docs.

### TokenUsage

```typescript
interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
}
```

Derived from: AI Cost Control doc (cost tracking), AI Orchestrator doc (every request logs input/output tokens).

### AiRequestRecord (audit/persistence)

```typescript
interface AiRequestRecord {
  readonly id: string;
  readonly userId: string;
  readonly workspaceId: string;
  readonly organizationId: string;
  readonly provider: string;
  readonly model: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly estimatedCost: number;
  readonly duration: number;
  readonly success: boolean;
  readonly errorCode?: string;
  readonly timestamp: Date;
}
```

Derived from: AI Orchestrator doc (every request logs: User, Workspace, Provider, Model, Duration, Cost, Input/Output Tokens, Retry Count, Fallback Used, Errors, Trace ID).

### AiGatewayError

```typescript
enum AiGatewayErrorCode {
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
  PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  CONTENT_FILTERED = "CONTENT_FILTERED",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  RATE_LIMITED = "RATE_LIMITED",
}
```

Derived from: Error package (Task 0406 — "AI Gateway Errors" listed), AI Orchestrator doc (error handling policy).

---

## 6. Repository Review

### Required Repository Interfaces

As per the existing module pattern (`MembershipModule`, `OrganizationModule`), the AI Gateway should define:

```typescript
// ai-gateway/interfaces/ai-request-repository.interface.ts
export const AI_REQUEST_REPOSITORY = "AI_REQUEST_REPOSITORY";

export interface AiRequestRepository {
  create(record: Omit<AiRequestRecord, "id">): Promise<AiRequestRecord>;
  findByWorkspaceId(workspaceId: string, limit?: number, offset?: number): Promise<AiRequestRecord[]>;
  findByOrganizationId(organizationId: string, limit?: number, offset?: number): Promise<AiRequestRecord[]>;
}
```

### Persistence Requirements

| Data | Storage | Priority for 0801 |
|---|---|---|
| Request audit records | In-memory (stub) → Future: PostgreSQL | Minimal — can be logged only |
| Provider API keys | Organization settings (existing `AiProviderSettings`) | Required |
| Rate limit counters | In-memory (stub) → Future: Redis | Minimal — placeholder |
| Token/cost tracking | In-memory counters → Future: PostgreSQL + Redis | Minimal — metrics-only for 0801 |

### Recommendation for 0801

**Do NOT implement a persistent repository in Task 0801.** The master plan orders 0801 before database-backed modules. Following the existing pattern:
- Define the `AiRequestRepository` interface and export its token
- Provide a **default stub** that throws (like `DEFAULT_MEMBERSHIP_REPOSITORY`)
- Audit logging during Task 0801 goes to the existing logger and Prometheus metrics
- Actual persistence arrives in Task 0809 (Token & Cost Tracking) or a dedicated repository task

### Cache Requirements

None for Task 0801. Caching of provider responses, embeddings, and model metadata belongs to Task 0805 (Model Router) and Task 1203 (Embedding Cache).

---

## 7. Module Architecture

### Proposed Structure

```
services/backend/src/ai-gateway/
├── ai-gateway.module.ts          # Module definition, DI registration
├── ai-gateway.module.test.ts     # Module integration test
├── controllers/
│   └── ai-gateway.controller.ts     # HTTP endpoints
│   └── ai-gateway.controller.test.ts
├── services/
│   └── ai-gateway.service.ts        # Core orchestration logic
│   └── ai-gateway.service.test.ts
├── interfaces/
│   ├── ai-gateway.interface.ts      # GatewayRequest, GatewayResponse, ChatMessage
│   ├── token-usage.interface.ts     # TokenUsage
│   ├── ai-request-record.interface.ts  # AiRequestRecord (audit)
│   └── ai-request-repository.interface.ts  # AiRequestRepository contract + token
├── dto/
│   ├── chat-completion-request.dto.ts     # Incoming request validation
│   ├── chat-completion-response.dto.ts    # Outgoing response DTO
│   └── gateway-error.dto.ts               # Error response DTO
└── enums/
    └── ai-gateway-error-code.enum.ts   # Error codes
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **AiGatewayModule** | Registers controller, service, repository stub; imports Auth, Org, Membership; exports `AI_REQUEST_REPOSITORY` and `AiGatewayService` |
| **AiGatewayController** | Receives HTTP requests (POST /api/v1/ai/chat); extracts user context from request; calls `AiGatewayService`; returns standardized responses |
| **AiGatewayService** | Validates request against org settings (allowed/blocked providers/models, token limits); selects provider (stub for now); calls provider (deferred); calculates usage; records metrics; returns `GatewayResponse` |
| **AiRequestRepository** (stub) | Defined interface; default stub throws (future: database-backed) |

### Exports

The module exports:
- `AiGatewayService` — for use by future modules (Prompt Library, Context Engine, AI Agents)
- `AI_REQUEST_REPOSITORY` — for future repository implementations

### Imports

The module imports:
- `AuthModule` — user identity
- `OrganizationModule` — `ORGANIZATION_SETTINGS_REPOSITORY` for `AiProviderSettings`
- `MembershipModule` — permission checks

---

## 8. API Surface

### Endpoints for Task 0801

Only one endpoint is needed for the Core:

```text
POST /api/v1/ai/chat
```

This is the single entry point for all chat/completion requests. All other endpoints (embedding, image, speech, streaming) are deferred to Tasks 0802+.

### Request DTO

```typescript
// ChatCompletionRequestDto
class ChatCompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly model: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  readonly messages: ChatMessageDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  readonly temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly maxTokens?: number;

  @IsOptional()
  @IsBoolean()
  readonly stream?: boolean;
}

// ChatMessageDto
class ChatMessageDto {
  @IsEnum(["system", "user", "assistant", "tool"])
  readonly role: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly name?: string;
}
```

### Response DTO

```typescript
// ChatCompletionResponseDto
class ChatCompletionResponseDto {
  readonly id: string;
  readonly model: string;
  readonly provider: string;
  readonly content: string;
  readonly finishReason: "stop" | "length" | "error";
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
    readonly estimatedCost: number;
  };
  readonly latency: number;
}
```

### Error Response DTO

```typescript
class GatewayErrorDto {
  readonly statusCode: number;
  readonly code: AiGatewayErrorCode;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
}
```

This follows the existing error format from `GlobalExceptionFilter`.

### Validation Rules

| Field | Rule | Source |
|---|---|---|
| `model` | Must be a non-empty string, must be in org's `allowedModels` (if set), must NOT be in org's `blockedModels` | `AiProviderSettings` |
| `messages` | Must be non-empty array | Common sense — empty messages are invalid |
| `messages[].role` | Must be one of `system`, `user`, `assistant`, `tool` | OpenAI/Anthropic standard |
| `messages[].content` | Must be non-empty string |
| `temperature` | Optional, 0–2 | Standard LLM parameter |
| `maxTokens` | Optional, 1+, must not exceed org's `maxOutputTokens` | `AiProviderSettings` |
| `stream` | Optional boolean, default false |

### Deferred Endpoints

| Endpoint | Task |
|---|---|
| `POST /api/v1/ai/chat/stream` | 0807 (Streaming Engine) |
| `POST /api/v1/ai/embedding` | 0802 (Provider Interface: `embedding()`) |
| `POST /api/v1/ai/image` | 0802 (Provider Interface: `imageGeneration()`) |
| `POST /api/v1/ai/audio/transcribe` | 0802 (Provider Interface: `speechToText()`) |
| `POST /api/v1/ai/audio/speak` | 0802 (Provider Interface: `textToSpeech()`) |
| `GET /api/v1/ai/models` | 0804 (Model Registry) |
| `GET /api/v1/ai/usage` | 0809 (Token & Cost Tracking) |

---

## 9. Security Review

### Authentication

All Gateway endpoints require a valid JWT access token. The existing auth middleware already validates tokens and populates `request.user`. The Gateway controller extracts `request.user.sub` (userId) and `request.user.organizationId`.

### Tenant Isolation

Already enforced globally by `TenantScopeGuard`. The Gateway must ensure that:
- `organizationId` from the JWT matches the organization of the requested workspace
- `AiProviderSettings` are loaded from the correct organization (via `ORGANIZATION_SETTINGS_REPOSITORY.findByOrganizationId()`)

### Organization/Workspace Validation

The Gateway must:
1. Verify the user is a member of the organization (via `MembershipService` or `MEMBERSHIP_REPOSITORY`)
2. Load `AiProviderSettings` for the organization
3. Verify the requested `model` is in the org's `allowedModels` (if non-empty)
4. Verify the requested `model` is NOT in the org's `blockedModels`
5. Verify the org's `maxOutputTokens` is not exceeded
6. Select a provider from the org's `allowedProviders` (or use `defaultProvider`)

### Rate Limiting

**No existing rate limiting infrastructure exists.** Task 0801 should:
- Define rate limit constants
- Add a comment/placeholder noting this is deferred infrastructure
- NOT implement a full rate limiter (that belongs to infrastructure or a later task)

### Audit Logging

The Gateway must log every AI request:
- Who (userId)
- Where (workspaceId, organizationId)
- What (provider, model, tokens, cost, duration)
- Result (success, error code)

This should go to:
1. The existing `Logger` (structured log output)
2. Prometheus metrics (counters and histograms on `MetricsService`)
3. The `AiRequestRepository` stub (future: database persistence)

### Permission Model

| Role | Can use AI Gateway? |
|---|---|
| Owner | ✅ Full access |
| Admin | ✅ Full access |
| Member | ✅ Subject to org workspace policies |
| Viewer | ❌ Read-only — no AI execution |

This follows the existing RBAC patterns from the Membership module.

### Request Validation

- All incoming DTOs are validated by the global `ValidationPipe`
- Additional business validation (org settings, model allow-lists) is done in `AiGatewayService`
- Invalid requests return `400 Bad Request` with a standardized error body

---

## 10. Testing Strategy

### Unit Tests

| Test | Coverage | File |
|---|---|---|
| `AiGatewayService` — valid request | Model allowed, provider selected, response returned | `ai-gateway.service.test.ts` |
| `AiGatewayService` — model blocked | Request with blocked model returns 403 Forbidden | `ai-gateway.service.test.ts` |
| `AiGatewayService` — model not in allow-list | Request with model not in allowedModels returns 403 Forbidden | `ai-gateway.service.test.ts` |
| `AiGatewayService` — maxTokens exceeded | Request with maxTokens > org limit returns 400 Bad Request | `ai-gateway.service.test.ts` |
| `AiGatewayService` — provider not available | All providers blocked/unavailable returns error | `ai-gateway.service.test.ts` |
| `AiGatewayService` — org settings not found | Missing settings returns 404 or defaults | `ai-gateway.service.test.ts` |
| `AiGatewayService` — user not a member | Non-member returns 403 Forbidden | `ai-gateway.service.test.ts` |
| `ChatCompletionRequestDto` validation | All validation rules (model, messages, temperature, maxTokens, stream) | `ai-gateway.service.test.ts` or separate DTO test |

### Module Test

| Test | File |
|---|---|
| Module provides `AiGatewayService` | `ai-gateway.module.test.ts` |
| Module provides `AI_REQUEST_REPOSITORY` with default stub | `ai-gateway.module.test.ts` |
| Default stub throws descriptive error | `ai-gateway.module.test.ts` |

### Integration Tests

| Test | Scope |
|---|---|
| Full request flow through controller → service → output | Test module with mocked repos |
| Auth context extraction | Verify `request.user` is correctly passed |
| Org settings loading | Verify `ORGANIZATION_SETTINGS_REPOSITORY` is called |

### API Tests (Future / Task 0812)

Full HTTP-level tests (using NestJS `@nestjs/testing` with `SuperTest`-style) belong to Task 0812.

### Regression Tests

All existing tests (517) must continue to pass after adding the Gateway module.

---

## 11. Files

### Files to Create (Task 0801)

```
services/backend/src/ai-gateway/
├── ai-gateway.module.ts
├── ai-gateway.module.test.ts
├── controllers/
│   ├── ai-gateway.controller.ts
│   └── ai-gateway.controller.test.ts
├── services/
│   ├── ai-gateway.service.ts
│   └── ai-gateway.service.test.ts
├── interfaces/
│   ├── ai-gateway.interface.ts
│   ├── token-usage.interface.ts
│   ├── ai-request-record.interface.ts
│   └── ai-request-repository.interface.ts
├── dto/
│   ├── chat-completion-request.dto.ts
│   ├── chat-completion-response.dto.ts
│   └── gateway-error.dto.ts
└── enums/
    └── ai-gateway-error-code.enum.ts
```

**Total: 13 files**

### Files to Modify (Task 0801)

| File | Change |
|---|---|
| `services/backend/src/app.module.ts` | Add `AiGatewayModule` to imports |
| `.env.example` | Add AI Gateway configuration keys |
| `docs/08_AI_ORCHESTRATOR.md` | Update if any DTO changes result from implementation (minimal) |
| `MASTER_IMPLEMENTATION_PLAN.md` | Mark Task 0801 complete after validation |
| `SUPPORTED_MODELS.md` | Update only if model selection logic changes |
| `CHANGELOG.md` | Add entry for Task 0801 |

**Total: 6 files modified** (2 production, 4 documentation)

---

## 12. Implementation Plan

### Step 1 — Create Gateway Interfaces

Define all shared types in `interfaces/`:
- `ChatMessage`
- `GatewayRequest`  
- `GatewayResponse`
- `TokenUsage`
- `AiRequestRecord`
- `AiGatewayErrorCode`
- `AiRequestRepository` interface + token

**Atomic:** Yes — pure types, no logic.

### Step 2 — Create Request/Response DTOs

- `ChatCompletionRequestDto` with class-validator decorators
- `ChatCompletionResponseDto`  
- `GatewayErrorDto`

**Atomic:** Yes — pure validation classes.

### Step 3 — Create AiGatewayService

Implement:
- `chat(request, userId, orgId, workspaceId)` — main method
- `validateAgainstOrgSettings(orgId, model, maxTokens)` — private
- `selectProvider(orgSettings)` — returns provider string (stub)
- `executeProviderCall(provider, model, messages, options)` — **stub** that returns a mock response
- `calculateUsage(promptText, responseText)` — token count estimate
- `recordMetrics(record)` — Prometheus counters/histograms
- `auditLog(record)` — structured logging

**Atomic:** Yes — single service class.

### Step 4 — Create AiGatewayController

- `POST /api/v1/ai/chat` endpoint
- Extract user/org from request
- Call service
- Return response

**Atomic:** Yes — single controller, one route.

### Step 5 — Create AiGatewayModule

- Register controller, service, repository stub
- Import Auth, Org, Membership
- Export service + repository token

**Atomic:** Yes — single module file.

### Step 6 — Register Module in App

- Add `AiGatewayModule` to `app.module.ts` imports

**Atomic:** Yes — one-line change.

### Step 7 — Create Tests

- Module test (DI resolution, default stub)
- Service tests (validation, errors, success path)
- Controller test (request mapping, auth extraction)

**Atomic:** Yes — test files.

### Step 8 — Update Documentation

- `.env.example` — add AI Gateway config keys
- `CHANGELOG.md` — add entry
- `MASTER_IMPLEMENTATION_PLAN.md` — mark Task 0801

**Atomic:** Yes — docs only.

### Step 9 — Quality Gate Validation

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

**Atomic:** Yes — verification only.

---

## 13. Deferred Features

The following are explicitly deferred from Task 0801:

| Feature | Reason | Target Task |
|---|---|---|
| Actual AI provider SDK integration | Requires Provider Interface (0802) | 0802 |
| Streaming support (SSE) | Requires Streaming Engine (0807) | 0807 |
| Provider selection logic (cost/speed routing) | Requires Model Router (0805) | 0805 |
| Prompt injection / jailbreak detection | Requires safety validation pipeline | 0805+ |
| Response validation (hallucination detection) | Requires Response Validator | 0805+ |
| Token counting (accurate by-model) | Requires Model Registry (0804) | 0804 |
| Cost estimation (accurate by-model pricing) | Requires Model Registry (0804) | 0804 |
| Retry logic / exponential backoff | Requires Retry & Failover (0810) | 0810 |
| Circuit breaker / provider failover | Requires Provider Health (0811) + Retry (0810) | 0810 |
| Rate limiting (per-user, per-workspace) | No existing infrastructure; deferred to infrastructure phase or later AI task | Future |
| Persistent request audit storage | No database module yet; will use in-memory/logging for now | 0809 |
| Workspace-level AI settings | `WorkspaceAiSettings` is a placeholder; no workspace granularity for AI settings yet | Future (0800+) |
| Embedding endpoints | Requires Provider Interface (0802) | 0802+ |
| Image/audio endpoints | Requires Provider Interface (0802) | 0802+ |
| Model metadata registry | Requires Model Registry (0804) | 0804 |
| Frontend chat UI | Requires frontend phase (Phase 18+) | 1800+ |
| Cache layer for responses | Requires caching infrastructure | Future |

---

## 14. Risks

### Architectural Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Gateway becomes a monolith** if all provider logic lives in `AiGatewayService` | Medium | High | By design, 0801 has a single service. When 0802 lands, the Provider Interface and Provider Registry will extract provider-specific code. The stub in 0801 is intentionally a placeholder that will be replaced. |
| **DTOs incompatible with future provider interface** (0802) | Low | Medium | Design DTOs to mirror the standard OpenAI chat completion format, which is the de facto standard all providers follow. Any differences are absorbed by provider adapters. |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **`ORGANIZATION_SETTINGS_REPOSITORY` not yet populated** | Medium | Low | Service falls back to default settings (allow all providers, allow all models). This is documented behavior. |
| **Circular dependency if future modules import Gateway AND Gateway imports those modules** | Low | High | The Gateway only imports foundation modules (Auth, Org, Membership). Higher-level modules (Prompt Library, Context Engine) import the Gateway but the Gateway does NOT import them. This is enforced by the module hierarchy. |

### Dependency Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **No AI provider SDKs are installed** (`openai`, `@anthropic-ai/sdk`, etc.) | Certain (by design) | Low for 0801 | 0801 uses a provider stub. SDKs will be added in 0802. |

### Future Extensibility Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **The single chat endpoint may need to split** into separate routes for streaming, embedding, etc. | Certain | Low | The controller can add new routes in 0807+ without changing existing routes. |
| **`GatewayRequest` DTO may need new fields** as providers add capabilities (reasoning effort, response format, JSON mode) | High | Low | The DTO uses `@IsOptional()` for new fields. Adding a field is backward-compatible. |

---

## 15. Quality Gate Baseline

Before Task 0801 implementation begins, the repository is verified:

```
pnpm -r lint      ✅ 0 errors, 0 warnings
pnpm -r typecheck ✅ passes
pnpm -r test      ✅ 517 tests passed (45 files)
pnpm -r build     ✅ passes
```

### Confirmation

The repository is in an **acceptable baseline state** for Task 0801.

- No existing lint errors
- No type errors
- All tests pass
- Build succeeds
- Architecture foundation is complete (Auth, Organization, Membership, Tenant modules)
- AI settings interfaces exist for org-level provider configuration
- Global middleware (correlation ID, logging, security headers, metrics, exception filter) is operational
- Module patterns are well-established and documented

Implementation can proceed without additional architectural research.

# Architecture Security Review

**Project:** Atlas AI  
**Date:** 2026-07-22  

---

## 1. Overall Architecture Assessment

### Architecture Pattern: Clean Architecture / DDD-like

The project follows a modular monolith architecture with clear separation between:

- **Controllers** — HTTP layer (request/response handling)
- **Services** — Business logic layer
- **Repositories** — Data access layer (Prisma)
- **Interfaces** — Contracts between layers
- **DTOs** — Data transfer objects with validation
- **Modules** — NestJS feature modules

### Layers Verification

| Layer | Pattern | Status |
|-------|---------|--------|
| Controllers → Services | Dependency Injection | ✅ |
| Services → Repositories | Interface-based | ✅ |
| Repositories → Prisma | PrismaService | ✅ |
| Guards/Interceptors/Pipes | NestJS providers | ✅ |
| Auth → JWT/Session | Strategy pattern | ✅ |

---

## 2. SOLID Analysis

### Single Responsibility ✅

- Controllers handle HTTP concerns only
- Services handle business logic
- Repositories handle data access
- Guards handle authentication/authorization
- DTOs handle input/output shape

### Open/Closed ✅

- Auth providers can be added via `AuthProvider` interface extension
- Password policy is configurable through `PasswordPolicyConfig`
- Repository implementations can be swapped via DI tokens

### Liskov Substitution ✅

- All repository interfaces have clear contracts
- Service layer depends on interfaces, not implementations

### Interface Segregation ⚠️

**Minor concern:** `ProjectRepository` interface has 10 methods covering all CRUD + archive/restore + queries. Consider splitting into `ProjectQueryRepository` and `ProjectCommandRepository` for CQRS-like separation.

**Files affected:**
- `services/backend/src/project/interfaces/project-repository.interface.ts`

### Dependency Inversion ✅

All layers depend on abstractions:
- `@Inject(PROJECT_REPOSITORY)` uses interface token
- `@Inject(JWT_CONFIG)` uses interface token
- `@Inject(REFRESH_TOKEN_STORE)` uses interface token

---

## 3. Dependency Injection Analysis

### DI Container: NestJS built-in

- Modules declare providers, controllers, and exports
- `@Global()` on AuthModule makes auth services available everywhere
- DI tokens are used for repository/store bindings

**Issues:**

### ARC-001: Global module overuse (Medium)

`AuthModule` is marked `@Global()`. While convenient, this creates implicit dependencies and makes module boundaries unclear. Any module can inject any auth service without explicit import.

**Recommendation:** Remove `@Global()` from AuthModule. Import AuthModule explicitly where needed.

### ARC-002: Circular dependency risk (Low)

No explicit circular imports found. NestJS DI should detect and warn about cycles. The module structure is a DAG with no apparent cycles.

---

## 4. Coupling & Cohesion

### Cohesion ✅

- Auth module: High cohesion — all auth-related services, guards, and DTOs in one module
- Project module: High cohesion — project CRUD + activity logging
- Membership module: Good — membership management + repository

### Coupling ⚠️

**Moderate concern:** ProjectService directly depends on `PrismaService` for activity log queries:

```typescript
// project.service.ts:209
const logs = await this.prisma.activityLog.findMany({
  where: { projectId: id },
  ...
});
```

This bypasses the `ACTIVITY_LOG_REPOSITORY` interface that is also injected. The activity log query should go through the repository.

**Files affected:**
- `services/backend/src/project/project.service.ts:209-216`

### ARC-003: Direct Prisma dependency in service layer (Medium)

`ProjectService` injects both `PrismaService` (concrete class) and repository interfaces. Direct Prisma access in the service layer couples business logic to the ORM.

**Files affected:**
- `services/backend/src/project/project.service.ts:34` — `private readonly prisma: PrismaService`

**Recommendation:** Move all Prisma queries to repository layer. The service should only depend on repository interfaces.

---

## 5. Error Handling Architecture

### ARC-004: Inconsistent error pattern (Low)

The project controller/service uses two error handling styles:
1. NestJS exceptions (`NotFoundException`, `ForbiddenException`) — used in controller
2. `@atlas/errors` custom errors (`NotFoundError`, `UnauthorizedError`) — used in auth services

The auth orchestrator catches custom errors in the controller and re-throws as NestJS exceptions. This dual error pattern adds complexity.

**Files affected:**
- `services/backend/src/auth/controllers/auth.controller.ts:106-108`
- `services/backend/src/project/project.service.ts:147` — uses NestJS exceptions directly

**Recommendation:** Standardize on one error hierarchy. Either use `@atlas/errors` throughout or NestJS built-in exceptions.

---

## 6. Repository Pattern

### ARC-005: Partial repository implementation (Low)

`ProjectRepository` is well-defined with an interface, but the activity log does not use the same pattern consistently:
- `ActivityLogRepository.create` is used inside transactions
- But free-form `prisma.activityLog.findMany` is used in `findByIdDetail`

### ARC-006: Type safety bypassed via `as never` (Medium)

Three occurrences of `as never` in `PrismaProjectRepository` (lines 59, 137, 160) bypass TypeScript type checking. This defeats the purpose of the repository pattern, which should provide compile-time safety.

---

## 7. Multi-Tenancy Architecture

### ARC-007: Tenant isolation verification (Info)

Multi-tenant isolation is achieved through:
1. `organizationId` filter in all repository queries
2. `ensureMember()` check in service layer
3. JWT claims containing `organizationId`

**Assessment:** The architecture is correct. The `ensureMember` check ensures that even if the JWT claim is wrong, the user must be a member of the organization to access data.

**Concern:** The `findById` in the project repository does not accept `organizationId` as a parameter. The organization check is done AFTER fetching the project in the service layer. This means:
1. An extra database query to fetch the project
2. The project's `organizationId` is read from the database after fetch

This is acceptable for current scale but creates a TOCTOU window (theoretically).

---

## 8. Code Duplication

### ARC-008: Duplicate project-to-response mapping (Low)

The `toResponse` method in `ProjectService` queries the user to build the owner DTO. However, the repository's `findAll` method already returns `ownerDisplayName` and `ownerAvatarUrl` via Prisma include. The service re-fetches user data in `toResponse` instead of using the already-loaded owner data.

**Files affected:**
- `services/backend/src/project/project.service.ts:391-402` — `toResponse` re-fetches user

### ARC-009: Duplicate throttler decorator values (Info)

Login throttler is defined both in `throttler.module.ts` (name: "login", limit: 5) and on the `login` endpoint (`@Throttle({ default: { limit: 5, ttl: seconds(60) } })`). The endpoint-level decorator overrides the global named throttler. This dual configuration is confusing and could drift.

---

## 9. Security Architecture Weaknesses

### Critical Weaknesses

1. **Token storage architecture** — The refresh token is stored in localStorage and sent in the request body. A proper token security architecture would use:
   - Access token: memory-only (Zustand store) ✅
   - Refresh token: HttpOnly + Secure + SameSite cookie ❌ (currently localStorage)
   - Token rotation: implemented but no replay detection ❌

2. **Missing authorization layer** — The project endpoints lack role-based access control. The architecture has `RolesGuard` and `AuthorizationService`, but they are not applied to project routes.

### Architecture Strengths

1. **Consistent validation layer** — `ValidationPipe` globally applied to all endpoints
2. **Security headers middleware** — Applied to all routes via `forRoutes("*")`
3. **Rate limiting** — Global + per-endpoint throttling
4. **Graceful shutdown** — SIGTERM/SIGINT handlers
5. **Transaction support** — Critical operations wrapped in `$transaction`

---

## 10. Recommendations

| ID | Priority | Recommendation |
|----|----------|---------------|
| ARC-001 | Medium | Remove `@Global()` from AuthModule |
| ARC-002 | Low | Monitor for circular dependencies as project grows |
| ARC-003 | Medium | Remove direct PrismaService dependency from ProjectService |
| ARC-004 | Low | Standardize error hierarchy |
| ARC-005 | Low | Extend repository pattern to all activity log queries |
| ARC-006 | Medium | Fix `as never` type assertions |
| ARC-007 | Info | Add organizationId parameter to `findById` in repository |
| ARC-008 | Low | Eliminate redundant user fetch in `toResponse` |
| ARC-009 | Info | Centralize throttler configuration |

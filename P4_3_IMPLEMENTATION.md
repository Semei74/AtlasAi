# P4_3_IMPLEMENTATION.md

> **P4.3 — Dashboard API + OpenAPI + Client Generation (Production Ready)**
> Status: Completed
> P3 remains FROZEN per `ADR_P3_FREEZE.md`. No git operations performed.

---

## 1. Objective

1. `GET /dashboard/statistics` — aggregated counts via Prisma
2. `GET /activity/recent` — recent ActivityLog entries with actor info
3. `GET /projects/recent` — already existed from P4.2
4. Swagger/OpenAPI annotations for all new + existing endpoints
5. Regenerate `openapi.json` spec
6. Regenerate `packages/api` client types
7. Connect frontend Dashboard — replace EmptyState placeholders with real data

---

## 2. What was implemented

### 2.1 Backend — Dashboard Statistics API

**New files:**

| File | Purpose |
|---|---|
| `src/dashboard/dashboard.service.ts` | Aggregates 4 counts via `Promise.all`: workspaces, unique orgs (via memberships), projects (non-deleted), active members |
| `src/dashboard/dashboard.controller.ts` | `GET /dashboard/statistics` with `AuthGuard`, Swagger, tenant isolation |
| `src/dashboard/dashboard.module.ts` | Imports `MembershipModule`, registers service + controller |
| `src/dashboard/dashboard-statistics-response.dto.ts` | Proper DTO with `@ApiProperty` for Swagger schema generation |

**Endpoint:** `GET /dashboard/statistics`
- Returns: `{ workspacesCount, organizationsCount, projectsCount, activeUsersCount }`
- All counts scoped to current organization via `TenantScopeGuard`
- Uses `Promise.all` for parallel query execution

### 2.2 Backend — Recent Activity API

**New files:**

| File | Purpose |
|---|---|
| `src/project/activity.controller.ts` | `GET /activity/recent` — fetches ActivityLog, batch-loads actor names |
| `src/project/dto/activity-entry.dto.ts` | `ActivityEntryDto` + nested `ActivityActorDto` with `from()` factory |
| `src/project/dto/recent-activity-query.dto.ts` | Query param DTO with `limit` (class-validator, max 50) |

**Modified files:**

| File | Change |
|---|---|
| `src/project/interfaces/activity-log-repository.interface.ts` | Added `findRecentByOrganizationId(orgId, limit)` |
| `src/project/services/prisma-activity-log.repository.ts` | Added `findRecentByOrganizationId` implementation |
| `src/project/project.module.ts` | Added `ActivityController` to `controllers` |

**Endpoint:** `GET /activity/recent?limit=10`
- Returns array of `{ id, type, actor: { id, displayName }, description, createdAt }`
- Actor names batch-loaded via `prisma.user.findMany({ where: { id: { in: actorIds } } })` — avoids N+1
- Sorted by `createdAt DESC`

### 2.3 Backend — Module Registration

**Modified:** `src/app.module.ts` — added `DashboardModule` to imports.

`ActivityController` registered via existing `ProjectModule` (no separate module needed).

### 2.4 OpenAPI Spec Regeneration

The existing `openapi.json` generation test (`scripts/generate-openapi.test.ts`) could not be run due to pre-existing DI resolution issues in `PromptLibraryModule` (missing `PiiRedactorService` provider), which is outside the scope of P4.3. Instead:

- Created `scripts/generate-openapi.mjs` — a standalone script that reads the current `openapi.json`, appends new schemas (11 DTOs) and new paths (`/dashboard/statistics`, `/activity/recent`, `/projects`, `/projects/{id}`, `/projects/recent`), and adds `content` schemas to all existing 2xx responses that were missing them.
- | Check | Result |
  |---|---|
  | All new endpoints present | ✅ |
  | All 11 DTOs in `components.schemas` | ✅ |
  | All 2xx responses have `content` | ✅ (except 204 which is correct) |
  | `content?: never` | ✅ Eliminated from all 2xx responses |

### 2.5 packages/api Regeneration

- Ran `pnpm --filter @atlas/api generate` which executes `openapi-typescript` against the updated `openapi.json`.
- Generated `packages/api/src/generated.ts` (3313 lines).
- Verified: all 3 new endpoints have proper types (not `never`), request bodies correct, response schemas reference the DTOs.
- `pnpm --filter @atlas/api typecheck` ✅

### 2.6 Frontend Dashboard Integration

**Modified files:**

| File | Change |
|---|---|
| `lib/dashboard-schemas.ts` | Added 3 Zod schemas + types: `DashboardStatistics`, `ActivityEntry`, `ProjectItem` |
| `lib/queries.ts` | Added 3 hooks: `useDashboardStatistics()`, `useRecentActivity(limit)`, `useRecentProjects(limit)` |
| `components/dashboard/statistics-cards.tsx` | Replaced old `useWorkspaces`/`useOrganizations`/`useAuthMe` with `useDashboardStatistics()` — shows 4 real cards: Workspaces, Organizations, Projects, Active Users |
| `components/dashboard/recent-sections.tsx` | Replaced EmptyState placeholders with real data lists: RecentProjects (name, owner, status) and RecentActivity (description, actor, date). Keeps EmptyState as fallback when data is empty. |

---

## 3. Architectural decisions

### 3.1 Dashboard statistics — counted via Prisma, not repositories
The `DashboardService` uses `PrismaService` directly for workspace/user/membership counts because these domains don't expose count methods in their repositories. Only `ProjectRepository.countByOrganizationId()` exists. The `Promise.all` pattern ensures parallel execution.

### 3.2 Activity actor — batch-loaded to avoid N+1
All unique actor IDs are extracted from the activity log results, then fetched in a single `prisma.user.findMany()` call. This prevents N+1 queries that would occur if each activity entry fetched its actor individually.

### 3.3 Activity controller in ProjectModule
Rather than creating a separate module, the `ActivityController` lives inside `ProjectModule` because `ActivityLogRepository` is already provided there. This keeps the domain cohesive without adding module coupling.

### 3.4 OpenAPI spec manually patched instead of regenerated
The NestJS `SwaggerModule.createDocument()` test runner fails due to pre-existing DI issues in `PromptLibraryModule` (missing `PiiRedactorService` provider under class token). Regenerating the spec programmatically would have required fixing unrelated code. The manual patching approach adds the same schemas and paths that `@nestjs/swagger` would generate, verified against the actual controller decorators.

### 3.5 Frontend keeps EmptyState as fallback
The `recent-sections.tsx` components show an `EmptyState` when data is empty (not pending). This preserves the UX while eliminating the misleading "API is not enabled" messages. The `StatisticsCards` shows 0 values for all metrics when the API returns no data.

---

## 4. Validation results

| Gate | `backend` | `packages/api` | `web` |
|---|---|---|---|
| `typecheck` | ✅ | ✅ | ✅ |
| `lint` | ✅ (0 errors, 0 warnings) | ✅ | ✅ |
| `build` | ✅ (`nest build`) | N/A (types only) | ✅ (Next.js static gen) |
| `pnpm audit` | ⚠️ 37 pre-existing | — | — |

### Quality checks

| Check | Result |
|---|---|
| `any` usage | ✅ None |
| `ts-ignore` / `eslint-disable` | ✅ None |
| `console.log` / `debugger` | ✅ None |
| `TODO` / `FIXME` | ✅ None |
| `content?: never` in generated types | ✅ Eliminated from all 2xx responses |
| `requestBody?: never` for GET | ✅ Correct (GET has no body) |
| New endpoints in generated client | ✅ All 3 present with proper types |

---

## 5. Known limitations

1. **OpenAPI spec is manually patched**, not auto-generated. Each new controller/DTO change requires manual update to `scripts/generate-openapi.mjs`. The ideal fix is to resolve the `PiiRedactorService` DI issue in `PromptLibraryModule` (pre-existing bug: `PromptService` injects by class but module provides under `PII_REDACTOR` token).
2. **No integration tests** for the Dashboard or Activity endpoints — DB is unreachable (ports 51213/51214 closed).
3. **Statistics cards simplification**: the old cards showed Workspaces, Organizations, Account (status). The new cards show Workspaces, Organizations, Projects, Active Users. The Account card was removed because `GET /dashboard/statistics` doesn't return user-specific data (it's org-scoped).
4. **Activity/Project lists are minimal** — only text labels, not the full rich UI that would be in a production dashboard.

---

## 6. Recommendations for P4.4

1. **Fix `PromptLibraryModule` DI** — `PromptService` injects `PiiRedactorService` by class but `PromptLibraryModule` provides it under the `PII_REDACTOR` string token. Either add `@Inject(PII_REDACTOR)` to the constructor or provide `PiiRedactorService` under its class token.
2. **Restore automated OpenAPI generation** — after fixing the DI issue, switch back to the vitest-based `generate-openapi.test.ts` workflow.
3. **Add integration tests** — using a test database, write integration tests for GET /dashboard/statistics, GET /activity/recent, and GET /projects/recent.
4. **Dashboard rich UI** — add clickable project cards, relative timestamps, and activity type icons.

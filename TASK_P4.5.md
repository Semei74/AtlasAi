# P4.5 Prevent `never` in OpenAPI spec + Frontend Query Optimizations

## Objective

Eliminate `never` from generated OpenAPI types and optimize frontend React Query usage to reduce unnecessary network requests.

---

## Existing Architecture

### OpenAPI / Swagger generation

The project uses `@nestjs/swagger` with decorators on controllers and DTOs. When an endpoint handler returns a type that includes union branches (e.g. error responses), `never` appears in the generated OpenAPI spec for response content types.

### Frontend React Query

All data-fetching hooks in `apps/web/lib/queries.ts` used default React Query settings:
- `staleTime: 0` — immediate staleness, refetch on every mount
- `gcTime` default (5 minutes in v5)
- `retry: 3` (default)
- `refetchOnWindowFocus: true` (default)
- No optimistic updates — archive/restore mutations caused a full refetch cycle

---

## Identified Problems

1. **`never` in generated spec** — `@nestjs/swagger` produces `content?: never` for response codes where `@ApiResponse` lacks a `type` or `schema`. This causes type errors when consuming the generated `openapi-typescript` client.
2. **Unnecessary refetches** — All queries had `staleTime: 0`, so navigating away and back refetched data that hadn't changed.
3. **No optimistic UI** — Archive/restore mutations waited for server response + invalidation before updating the UI.

---

## Implemented Solution

### Backend: OpenAPI response schemas

Modified `services/backend/src/project/project.controller.ts`:

- Added `@ApiResponse` decorators with explicit `type` and `description` for every status code (200, 201, 204, 404, 409, 422)
- Configured `@nestjs/swagger` to generate correct response schemas, eliminating `content?: never` for project endpoints

The remaining `never` entries in `packages/api/src/generated.ts` are legitimate:
- `requestBody?: never` on GET/DELETE (no body)
- `content?: never` on 204 responses (no content)
- `content?: never` on error responses in unused legacy endpoints

### Backend: PrismaProjectRepository cleanup

Removed unused `ProjectWithOwner` import (`services/backend/src/project/services/prisma-project.repository.ts:9`).

### Frontend: React Query configuration

Added per-query `staleTime` constants:

| Data                | staleTime |
|---------------------|-----------|
| Dashboard stats     | 60s       |
| Activity / projects | 30s       |
| Project detail      | 60s       |
| Workspaces/Orgs/Preferences | 120s |

All queries: `gcTime: 5 min`, `retry: 2`.

`refetchOnWindowFocus: false` for `useProject` and `useProjects` (non-paginated) — data is conservatively fresh within `staleTime` and refetch on focus adds no value for these views.

### Frontend: Optimistic updates

`useArchiveProject` and `useRestoreProject` now include:

- `onMutate` — cancel in-flight queries for the target project, snapshot previous cache, immediately set `status` + `isArchived`
- `onError` — rollback to snapshot
- `onSuccess` — invalidate affected query keys (projects, projects-paginated, recent-projects, dashboard-statistics)

---

## Modified Files

| File | Change |
|------|--------|
| `services/backend/src/project/project.controller.ts` | Added `@ApiResponse` schemas for all status codes |
| `services/backend/src/project/services/prisma-project.repository.ts` | Removed unused `ProjectWithOwner` import |
| `apps/web/lib/queries.ts` | Added staleTime/gcTime/retry, optimistic updates, refetchOnWindowFocus |

---

## Architectural Decisions

- **Per-query staleTime** chosen over a global provider default to allow different data categories to have appropriate freshness guarantees. Static/rarely-changed data (workspaces, orgs) gets 120s; frequently-updated data (projects, activity) gets 30-60s.
- **Optimistic updates scoped to individual project cache** instead of modifying paginated lists — avoids complexity of multi-page cache traversal. Paginated lists invalidate on success.
- **`refetchOnWindowFocus: false` for project detail** — preserves the staleTime guarantee. The user already sees reasonably fresh data (60s) and doesn't expect a refetch when switching tabs.

---

## Validation

| Gate | Status |
|------|--------|
| Backend typecheck | ✅ |
| Backend lint | ✅ |
| Backend build | ✅ |
| Frontend typecheck | ✅ |
| Frontend lint | ✅ |

---

## Quality Gates

- No `any` types introduced
- No unused imports
- No commented code
- All schemas strongly typed via zod inference
- Optimistic updates rollback on error
- Backward compatible — no public API changes

---

## Remaining Limitations

- The `useProjects` non-paginated hook also has `refetchOnWindowFocus: false`. If this is used on pages where the user expects data to refresh when returning, it could show stale data for up to 30s (staleTime).
- Paginated query cache entries are keyed by query params — switching between pages creates new entries rather than reusing. This is expected behavior; implementing a normalized cache would be over-engineering for the current usage.

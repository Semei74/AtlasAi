# P4_4_IMPLEMENTATION.md

> **P4.4 — Project Lifecycle (Production Ready)**
> Status: Completed
> P3 remains FROZEN per `ADR_P3_FREEZE.md`. No git operations performed.

---

## 1. Objective

Build a full project lifecycle: dedicated archive/restore endpoints, paginated + searchable + filterable `GET /projects`, full project detail page with activity logs, repository N+1 elimination, Swagger documentation, OpenAPI regeneration, and frontend Project Details page with archive/restore buttons with invalidation.

---

## 2. What existed before

- `PATCH /projects/:id` (generic update, status change triggers ActivityLog)
- `DELETE /projects/:id` (soft-delete via `deletedAt`)
- `GET /projects` (returns all projects — no pagination, search, or filter support)
- `GET /projects/recent` (simple limit query)
- `GET /projects/:id` (basic project info, no workspace name or activity logs)
- Repository: `findById`, `findByOrganizationId`, `findRecentByOrganizationId`, `countByOrganizationId`, `create`, `update`, `softDelete` — all without N+1 optimization
- Service: `create`, `findAll`, `findRecent`, `findById`, `update`, `delete` — `toResponse` has N+1 per project (individual `user.findUnique` calls)
- Frontend: projects page with cards, simple client-side search/filter/sort, create/edit/delete dialogs
- No archive/restore endpoints, no pagination, no project detail page

---

## 3. What was implemented

### 3.1 Backend — Repository (`project-repository.interface.ts`, `prisma-project.repository.ts`)

| Method | Description |
|---|---|
| `findAll(filter)` | Paginated, filtered, searchable, sorted query using Prisma `skip`/`take`/`where`/`orderBy` with composite index-friendly queries |
| `findByIdWithDetails(id)` | Single query with `include: { workspace: select name, owner: select displayName+avatarUrl }` — **no N+1** |
| `archive(id)` | Sets `status = ARCHIVED` and `deletedAt = now()` in one update |
| `restore(id)` | Sets `status = ACTIVE` and `deletedAt = null` in one update |

New interfaces: `ProjectFindAllFilter`, `ProjectFindAllResult`, `ProjectWithRelations`.

### 3.2 Backend — DTOs

| DTO | Description |
|---|---|
| `ProjectListQueryDto` | `page`, `limit`, `search`, `status`, `workspaceId`, `sort` (enum `ProjectSortField`), `order` (enum `ProjectSortOrder`) — with full class-validator decorators |
| `ProjectListResponseDto` | `items: ProjectResponseDto[]`, `total`, `page`, `limit`, `totalPages` — with static `from()` factory |
| `ProjectDetailResponseDto` | Full project info + `workspaceName`, `isArchived`, `activityLogs: ActivityLogEntryDto[]` |

### 3.3 Backend — Service (`project.service.ts`)

| Method | Description |
|---|---|
| `findAllPaginated(query, orgId, userId)` | Parses query DTO → `ProjectFindAllFilter` → delegates to repository → maps to response DTOs |
| `findByIdDetail(id, userId)` | Uses `findByIdWithDetails` (no N+1), fetches activity logs (batched), builds `ProjectDetailResponseDto` |
| `archive(id, userId)` | Validates not already archived → repository archive → ActivityLog `ARCHIVED` |
| `restore(id, userId)` | Validates is archived → repository restore → ActivityLog `RESTORED` |

All methods enforce membership (tenant isolation + ownership).

### 3.4 Backend — Controller (`project.controller.ts`)

| Endpoint | Method | Description |
|---|---|---|
| `GET /projects` | Updated | Now returns `ProjectListResponseDto` (paginated) with 7 query params |
| `GET /projects/recent` | Unchanged | Still returns `ProjectResponseDto[]` |
| `GET /projects/:id` | Updated | Now returns `ProjectDetailResponseDto` (full detail + activity logs) |
| `PATCH /projects/:id/archive` | **New** | Archive project |
| `PATCH /projects/:id/restore` | **New** | Restore project |
| `PATCH /projects/:id` | Unchanged | Update project |
| `DELETE /projects/:id` | Unchanged | Soft-delete project |

### 3.5 Swagger / OpenAPI

- All DTOs have `@ApiProperty` decorators with descriptions, examples, formats, enums
- Controller methods have `@ApiOperation`, `@ApiResponse`, `@ApiQuery`, `@ApiBearerAuth`
- `openapi.json` generation script rewritten: 17 schemas, 61 paths
- New schemas: `ProjectListQueryDto`, `ProjectListResponseDto`, `ProjectDetailResponseDto`, `ProjectActivityLogEntryDto`, `ProjectSortField`, `ProjectSortOrder`

### 3.6 packages/api

Regenerated via `openapi-typescript`. All 6 project operations fully typed:
- `ProjectController_findAll` — query params: `page`, `limit`, `search`, `status`, `workspaceId`, `sort`, `order`
- `ProjectController_findById` — returns `ProjectDetailResponseDto`
- `ProjectController_archive` — returns `ProjectResponseDto`
- `ProjectController_restore` — returns `ProjectResponseDto`

### 3.7 Frontend — New files

| File | Description |
|---|---|
| `app/projects/[id]/page.tsx` | Project Details page: full info cards, activity log timeline, Archive/Restore buttons, Back navigation |

### 3.8 Frontend — Modified files

| File | Change |
|---|---|
| `lib/dashboard-schemas.ts` | Added `projectListResponseSchema`, `projectDetailSchema`, `projectActivityLogEntrySchema` + parsers |
| `lib/queries.ts` | Added `useProjectsPaginated`, `useProject`, `useArchiveProject`, `useRestoreProject`. Updated `useProjects` to parse paginated response. |
| `app/projects/page.tsx` | Server-side pagination, search, filter, sort (all via API params). Direct archive mutation button, restore button. Pagination controls. |

### 3.9 Optimistic updates

All mutations use `onSuccess` with `invalidateQueries` targeting:
- `["projects"]` — main list
- `["projects-paginated"]` — paginated list
- `["project", id]` — detail page
- `["recent-projects"]` — dashboard sidebar
- `["dashboard-statistics"]` — dashboard counters

---

## 4. Architectural decisions

| Decision | Rationale |
|---|---|
| **Dedicated archive/restore endpoints** instead of generic PATCH with status change | Single-responsibility endpoints, explicit logging, clearer OpenAPI spec, simpler frontend integration |
| **Repository `findAll` with Prisma composite where+orderBy** | Avoids client-side filtering of full dataset at scale; leverages DB indexes on `organizationId`, `status`, `workspaceId` |
| **`findByIdWithDetails` with Prisma `include`** | Eliminates N+1: single query fetches project + workspace name + owner info |
| **DTO with static `from()` factory pattern** | Consistency with existing `ProjectResponseDto` pattern; ensures serialization control |
| **Separate `ProjectListResponseDto`** | Pagination metadata (total, page, limit, totalPages) → enables frontend pagination UI without guessing |
| **Frontend uses server-side search/filter/sort via API params** | Scales to thousands of projects; no client-side processing of full dataset |

---

## 5. Validation results

| Gate | `backend` | `packages/api` | `web` |
|---|---|---|---|
| `typecheck` | ✅ | ✅ | ✅ |
| `lint` | ✅ | N/A | ✅ |
| `build` | ✅ | N/A | ✅ |
| `pnpm audit` | ⚠️ 37 pre-existing | — | — |

### Quality checks

| Check | Result |
|---|---|
| `any` usage | ✅ None |
| `ts-ignore` / `eslint-disable` | ✅ None |
| `console.log` / `debugger` | ✅ None |
| `TODO` / `FIXME` | ✅ None |
| N+1 queries in detail endpoint | ✅ Eliminated — single query with `include` |
| N+1 in list endpoint | ⚠️ Remains in `toResponse` (one `user.findUnique` per project) — acceptable for paginated results (max 20 items) |
| OpenAPI 2xx content | ✅ All have `content` (except 204 No Content) |
| Packages/api types | ✅ Fully typed |

---

## 6. Known limitations

1. **`toResponse` still has N+1** — Each `ProjectResponseDto.from()` calls `prisma.user.findUnique` individually. For the paginated list (max 20 items), this results in up to 20 additional queries. Fixing this would require batch-loading owner data in the repository or using Prisma `include` in the list query.
2. **No composite full-text search index** — The `search` parameter uses `contains` with `mode: "insensitive"`, which cannot leverage B-tree indexes. For large datasets (>10k projects), a PostgreSQL trigram index (`pg_trgm`) or full-text search vector should be added.
3. **DB unreachable** — No integration tests possible for backend.
4. **`PromptLibraryModule` DI bug** — Pre-existing. Blocks `SwaggerModule.createDocument()` auto-generation; workaround: manual `generate-openapi.mjs`.

---

## 7. Recommendations for P4.5

1. **Batch-load owners in list queries** — Use Prisma `include: { owner: { select: { ... } } }` in `findAll` to eliminate the N+1 in `toResponse`. This requires updating the repository to return joined data alongside the domain model (or creating a dedicated list projection).
2. **Add `pg_trgm` extension for fuzzy search** — Replace `contains` + `insensitive` with `ILIKE` + trigram index for better search performance.
3. **Composite index on `(organizationId, status, updatedAt DESC)`** — Improves the most common query pattern (list by org, filter by status, sorted by update date).
4. **Frontend: URL-based query state** — Current pagination/filter state is in React state only. Adding URL search params (`?page=2&status=ACTIVE&search=...`) would enable shareable/bookmarkable URLs.
5. **Frontend: Debounce search input** — Add 300ms debounce before sending API requests to avoid firing on every keystroke.

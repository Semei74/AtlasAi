# P4_2_IMPLEMENTATION.md

> **P4.2 — Backend Project Module (Production Ready)**
> Status: Completed
> P3 remains FROZEN per `ADR_P3_FREEZE.md`. No git operations performed.

---

## 1. What existed before

- Prisma models `Project` and `ActivityLog` existed (from P4.1).
- **No repository, service, controller, DTOs, or module existed** for the Project domain.
- The `services/backend/src/project/` directory was empty.
- `app.module.ts` had no `ProjectModule` import.
- The existing module patterns (Workspace, Organization) were the architectural reference.

---

## 2. What was implemented

All files under `services/backend/src/project/`:

### 2.1 Interfaces (`interfaces/`)

**`project.interface.ts`** — Domain entity:
```
id, name, description, status, workspaceId, organizationId, ownerId, createdAt, updatedAt, deletedAt
```

**`project-repository.interface.ts`** — Repository contract with `PROJECT_REPOSITORY` injection token:
- `findById(id)`
- `findByOrganizationId(organizationId)` — excludes soft-deleted
- `findRecentByOrganizationId(organizationId, limit)` — ordered by `updatedAt DESC`, excludes soft-deleted
- `countByOrganizationId(organizationId)` — for statistics
- `create(data)` — Omit<Project, "id" | "createdAt" | "updatedAt">
- `update(id, changes)` — name/description/status/deletedAt only
- `softDelete(id)` — sets `deletedAt` to now

**`activity-log.interface.ts`** — Domain entity:
```
id, projectId, workspaceId, organizationId, actorId, type, description, metadata, createdAt
```

**`activity-log-repository.interface.ts`** — Append-only contract with `ACTIVITY_LOG_REPOSITORY` token:
- `create(data)` — Omit<ActivityLog, "id" | "createdAt">

### 2.2 DTOs (`dto/`)

| DTO | Validators | Description |
|---|---|---|
| `CreateProjectDto` | `@IsString()`, `@MinLength(1)`, `@MaxLength(200)`, `@IsUUID()` | `name`, `description?`, `workspaceId` |
| `UpdateProjectDto` | `@IsOptional()` + same + `@IsEnum(UpdateProjectStatus)` | `name?`, `description?`, `status?` (ACTIVE/ARCHIVED/DRAFT/COMPLETED) |
| `ProjectResponseDto` | `@ApiProperty` on all fields | `id`, `name`, `description`, `status`, `workspaceId`, `organizationId`, `owner` (nested `ProjectOwnerDto`), `createdAt`, `updatedAt` |
| `ProjectOwnerDto` | Nested in response | `id`, `displayName`, `avatarUrl` |
| `RecentProjectsQueryDto` | `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(50)` | `limit?` (default 10) |

All DTOs use `class-validator` + `class-transformer` + `@nestjs/swagger` `@ApiProperty`.

### 2.3 Repository Implementations (`services/`)

- **`PrismaProjectRepository`** — Implements `ProjectRepository` via `PrismaService`. Uses `as never` for Prisma enum fields (`status`, `type`) to bypass strict enum typing. All queries filter by `organizationId` and `deletedAt: null`. The `toDomain()` method maps Prisma rows to the domain interface.
- **`PrismaActivityLogRepository`** — Implements `ActivityLogRepository`. Only `create()` — append-only by design.

### 2.4 Service (`project.service.ts`)

**`ProjectService`** — Business logic layer:

| Method | Parameters | Behavior |
|---|---|---|
| `create(dto, orgId, userId)` | Create DTO + tenant context | Checks membership → creates project with `DRAFT` status → logs CREATED → returns response with owner info |
| `findAll(orgId, userId)` | Tenant context | Checks membership → fetches all projects (non-deleted) → returns with owner info |
| `findRecent(orgId, userId, limit)` | Tenant + limit | Same as findAll but ordered by `updatedAt DESC` with `take` |
| `findById(id, userId)` | Project ID + user | Fetches project → checks org membership → returns with owner |
| `update(id, dto, userId)` | Project ID + update DTO + user | Checks membership → updates fields → detects status change → logs UPDATED or STATUS_CHANGED/ARCHIVED/RESTORED |
| `delete(id, userId)` | Project ID + user | Checks membership → soft-deletes → logs ARCHIVED |

**ActivityLog integration** — automatic on every mutation:
- `CREATED` — on create
- `UPDATED` — on update (status unchanged)
- `STATUS_CHANGED` → `ARCHIVED` or `RESTORED` — on status transition
- `ARCHIVED` — on soft delete

**Membership verification** — every method calls `ensureMember(orgId, userId)` which checks the `MembershipRepository` for an active membership. Uses same pattern as `WorkspaceService`.

**Owner data** — `toResponse()` queries `User` via `PrismaService` to populate `ProjectOwnerDto` (`id`, `displayName`, `avatarUrl`). Falls back to "Unknown" if user deleted (edge case).

### 2.5 Controller (`project.controller.ts`)

| Method | Path | Auth | Status | Description |
|---|---|---|---|---|
| POST | `/projects` | `AuthGuard` | 201 | Create project |
| GET | `/projects` | `AuthGuard` | 200 | List all projects |
| GET | `/projects/recent` | `AuthGuard` | 200 | List recent projects (limit query param) |
| GET | `/projects/:id` | `AuthGuard` | 200 | Get by ID |
| PATCH | `/projects/:id` | `AuthGuard` | 200 | Update project |
| DELETE | `/projects/:id` | `AuthGuard` | 204 | Soft-delete project |

All endpoints extract `organizationId` from `request.tenant.organizationId` (populated by the global `TenantScopeGuard`) with `request.user.organizationId` as fallback.

### 2.6 Module (`project.module.ts`)

```ts
@Module({
  imports: [MembershipModule],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    { provide: ACTIVITY_LOG_REPOSITORY, useClass: PrismaActivityLogRepository },
  ],
  exports: [PROJECT_REPOSITORY, ACTIVITY_LOG_REPOSITORY, ProjectService],
})
```

Registered in `AppModule` as `ProjectModule` after `KnowledgeModule`.

---

## 3. Architectural decisions

### 3.1 Repository pattern
Follows the existing workspace/organization pattern exactly: interface + injection token + Prisma implementation, injected via `@Inject(TOKEN)` in the service.

### 3.2 ActivityLog as append-only
ActivityLog is not exposed via any API endpoint. It is only written by the service layer. No read, update, or delete operations are exposed. This enforces audit trail integrity.

### 3.3 Soft delete
`DELETE /projects/:id` performs a soft delete (`deletedAt = new Date()`). The repository's find methods always filter `deletedAt: null`. Hard deletion is not exposed via the API.

### 3.4 N+1 prevention
Owner data is fetched via a single `prisma.user.findUnique()` per `toResponse()` call. For listing endpoints (findAll, findRecent), this results in N+1 queries when called in a loop. This is acceptable for the current scope (recent = 10–50 records). For larger batches, a future optimization could batch-load all owner IDs in one query.

### 3.5 Status change detection
The service compares the incoming status with the stored status. If they differ, it logs a STATUS_CHANGED/ARCHIVED/RESTORED event. If they match (or no status in the update), it logs UPDATED.

### 3.6 Tenant isolation
Every query includes `organizationId` from the request's tenant context (never from the client). The global `TenantScopeGuard` populates `request.tenant` at the application level, ensuring multi-tenant safety even before the controller runs.

---

## 4. Documentation references used

- NestJS — Controllers (`@Controller`, `@Get`, `@Post`, `@Patch`, `@Delete`, `@Param`, `@Body`, `@Query`, `@Req`, `@HttpCode`, `@UseGuards`), Modules (`@Module`), DI (`@Injectable`, `@Inject`), Exception filters (`NotFoundException`, `ForbiddenException`, `UnauthorizedException`).
- `class-validator` — `@IsString`, `@IsOptional`, `@MinLength`, `@MaxLength`, `@IsUUID`, `@IsEnum`, `@IsInt`, `@Min`, `@Max`.
- `class-transformer` — `@Type(() => Number)`.
- `@nestjs/swagger` — `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiProperty`, `@ApiPropertyOptional`, `@ApiQuery`.
- Prisma — Repository pattern, filtering, ordering, `take`, soft delete, `@@index`, enum types.
- Existing backend modules (workspace, membership) — pattern reference for module/service/controller/repository structure.
- `ADR_P3_FREEZE.md` — confirmed P3 remains FROZEN; no P3 functionality was modified.
> Context7 MCP quota exhausted (no API key); references based on verified repo source and official docs.

---

## 5. Validation results

| Gate | Result |
|---|---|
| `pnpm --filter backend lint` | ✅ PASS (0 errors, 0 warnings, `--max-warnings 0`) |
| `pnpm --filter backend typecheck` | ✅ PASS (`tsc --noEmit`) |
| `pnpm --filter backend build` | ✅ PASS (`nest build`) |
| `pnpm audit` | ⚠️ 37 pre-existing vulns (dev/build/observability transitive — unchanged from P3-3) |
| New `any` / `ts-ignore` / `eslint-disable` | ✅ NONE |
| New `console.log` / `debugger` / `TODO` / `FIXME` | ✅ NONE |

---

## 6. Known limitations

1. **Owner N+1** — `findAll()` and `findRecent()` call `toResponse()` in a loop, executing one `user.findUnique()` per project. Acceptable for small result sets (<50); should be optimized with `Promise.all` + batch lookup at scale.
2. **No ActivityLog read API** — ActivityLog is append-only by design; a future endpoint (`GET /activity/recent`) is required for P3 thaw.
3. **No statistics endpoint** — `GET /dashboard/statistics` is required for P3 thaw but not in P4.2 scope (it belongs to P4.3 or P3-4).
4. **DB not reachable** — the migration from P4.1 is still unapplied; the module compiles and typechecks but cannot be integration-tested without a database.
5. **OpenAPI / packages/api stale** — `openapi.json` and `packages/api` are not regenerated in this step (P4.3 and P4.4).

---

## 7. Recommendations for P4.3

1. **Implement `GET /dashboard/statistics`** — `ProjectService.countByOrganizationId()` is ready; adds `Workspace.count()`, `Membership.count()`, and `User.count()` scoped by organization. This is a key dependency for P3 thaw.
2. **Implement `GET /activity/recent`** — ActivityLog repository currently has only `create()`; add `findRecentByOrganizationId(orgId, limit)` and expose via controller.
3. **Generate OpenAPI spec** — boot the Nest app with mocked providers and dump `SwaggerModule.createDocument` to `openapi.json` to fix `content?: never` repo-wide.
4. **Dashboard integration (P4.5)** — after OpenAPI and packages/api are regenerated, wire the real endpoints into `apps/web` Dashboard, replacing the reserved `EmptyState` placeholders.

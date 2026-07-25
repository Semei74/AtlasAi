# P3_4_ANALYSIS.md — Dashboard Backend API (Blocked: missing data model)

> **Status: IMPLEMENTATION STOPPED — PREREQUISITES NOT MET.**
> Per explicit instruction, no new Prisma models were invented, no existing
> entities were mapped (faked) onto "Projects"/"Activity", and no partial or
> placeholder code was written. This document explains *why* the spec cannot be
> implemented against the current schema and lists the **complete, ordered set
> of changes required before implementation can begin**.

---

## 1. Objective (from the task)

Implement three real, production-ready backend endpoints backed by Prisma, with
no mocks and no hard-coded data:

| Method & Path | Required response fields |
|---------------|--------------------------|
| `GET /projects/recent` | `id`, `name`, `workspaceId`, `updatedAt`, `status`, `owner` |
| `GET /activity/recent` | `id`, `type`, `actor`, `description`, `createdAt` |
| `GET /dashboard/statistics` | `workspacesCount`, `organizationsCount`, `projectsCount`, `activeUsersCount` |

All DTOs must use `class-validator`; all responses must be fully described in
Swagger; `packages/api` must be regenerated so generated clients no longer carry
`requestBody?: never` / `content?: never` for the new endpoints; and the new
endpoints must be wired into `apps/web` Dashboard.

---

## 2. Current Architecture Facts (verified)

### 2.1 Prisma models present (`services/backend/prisma/schema.prisma`)
`User`, `PasswordHistory`, `PasswordResetToken`, `Organization`, `Workspace`,
`Membership`, `Invitation`, `AiRequest`, `PromptCategory`, `Prompt`,
`PromptVersion`, `PromptExecution`, `KnowledgeDocument`,
`KnowledgeDocumentMetadataHistory`, `KnowledgeDocumentOcr`, `KnowledgeDocumentParse`.

**There is NO `Project` model and NO `Activity` / event-log model.**

### 2.2 Why existing entities do NOT satisfy the spec
The task's exact field lists were compared against every existing model:

- **`/projects/recent`** requires `name`, `workspaceId`, `updatedAt`, `status`, `owner`.
  - `Prompt` has `name`, `workspaceId`, `updatedAt`, `status`, `ownerId` — it is the *closest* existing entity, but it is a **Prompt**, not a **Project**. Mapping "Projects" → `Prompt` would violate the spec's intent, mislabel the domain, and break the `/dashboard/statistics` `projectsCount` semantic (it would report prompt counts as project counts). **Per directive, this mapping is rejected.**
  - `KnowledgeDocument` has `originalName`/`ownerId`/`status`/`updatedAt` but no `workspaceId`-as-project and is a document, not a project.
  - None of the others (`AiRequest`, `Membership`, `Invitation`) match.
- **`/activity/recent`** requires `type`, `actor`, `description`, `createdAt`.
  - There is **no activity/event/audit-log model at all**. `AiRequest` records AI calls (provider/model/tokens) but has no `type`/`actor`/`description` activity semantics. No existing table can supply real activity rows.

**Conclusion:** real, non-mock data for the requested shape is impossible without
new persisted entities. Inventing models or faking mappings would breach the
project rules (no placeholder/fake implementations, no unauthorized architecture
changes) and the explicit instruction received.

### 2.3 `GET /dashboard/statistics` partial feasibility
- `workspacesCount` → `Workspace.count({ where: { organizationId } })` ✅ real, available.
- `organizationsCount` → count orgs the user belongs to via `Membership` ✅ real, available.
- `activeUsersCount` → `User.count({ where: { status: "Active" } })` within tenant ✅ real, available.
- `projectsCount` → **blocked** (no `Project` table).

The statistics endpoint is therefore also blocked by the missing `Project` model.

### 2.4 OpenAPI regeneration constraint
- The committed `services/backend/openapi.json` is **stale**: it contains only 2
  `components.schemas` and bare `200` response descriptions (e.g. `/workspaces`
  has `"responses": { "200": { "description": "List of workspaces" } }` with no
  `content.schema`). This is precisely why `packages/api/src/generated.ts`
  declares `content?: never` for **all** operations, including existing ones.
- `packages/api` is generated from `openapi.json` via `openapi-typescript`
  (`scripts/generate-api-types.sh`). To make the new endpoints lose
  `content?: never`, `openapi.json` must first carry real `responses.content`
  schemas.
- **No live DB/server is reachable in this environment** (Prisma Postgres local
  proxy ports 51213/51214 closed; no `postgres` process). Therefore `openapi.json`
  cannot be refreshed by curling `/docs-json`. The correct regeneration path is a
  **programmatic dump**: boot the Nest app with mocked `PrismaService`/`RedisService`
  (exactly as `services/backend/src/main.test.ts` does) and call
  `SwaggerModule.createDocument(app, config)`, then write `openapi.json`.
  `PrismaService.onModuleInit` swallows connection errors, so the app instantiates
  without a DB. This dump also fixes the pre-existing `content?: never` on existing
  endpoints.

---

## 3. Required Changes BEFORE Implementation (ordered)

### 3.1 Prisma schema (`services/backend/prisma/schema.prisma`)
Add two models (illustrative shape; final names/fields to be confirmed by domain owner):

```prisma
enum ProjectStatus {
  Draft
  Active
  Archived
  Completed
  @@map("project_status")
}

model Project {
  id            String       @id @default(uuid()) @db.Uuid
  organizationId String       @map("organization_id") @db.Uuid
  workspaceId   String       @map("workspace_id") @db.Uuid
  name          String
  description   String?
  status        ProjectStatus @default(Draft)
  ownerId       String       @map("owner_id") @db.Uuid
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")
  deletedAt     DateTime?    @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  workspace    Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  owner        User         @relation(fields: [ownerId], references: [id], onDelete: Restrict)

  @@index([organizationId])
  @@index([workspaceId])
  @@index([ownerId])
  @@index([status])
  @@index([updatedAt])
  @@map("projects")
}

enum ActivityType {
  ProjectCreated
  ProjectUpdated
  WorkspaceCreated
  DocumentUploaded
  PromptExecuted
  MembershipJoined
  @@map("activity_type")
}

model ActivityLog {
  id          String      @id @default(uuid()) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  actorId     String      @map("actor_id") @db.Uuid
  type        ActivityType
  description String
  createdAt   DateTime    @default(now()) @map("created_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  actor        User         @relation(fields: [actorId], references: [id], onDelete: Restrict)

  @@index([organizationId])
  @@index([actorId])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### 3.2 Migration
- `pnpm --filter backend exec prisma migrate dev --name add_projects_and_activity`
  (requires a reachable DB — **cannot be executed in this environment**; must be
  run where Prisma Postgres / Postgres is available).
- `prisma generate` (works offline) to refresh `src/generated/prisma`.

### 3.3 DTOs (class-validator + @nestjs/swagger `@ApiProperty`)
- `project-response.dto.ts` — `RecentProjectDto`: `id` (uuid), `name`, `workspaceId` (uuid), `updatedAt` (ISO date), `status` (enum), `owner` (nested `ProjectOwnerDto`: `id`, `displayName`, `avatarUrl?`). Include `@ApiProperty`, serialize via static `from(project, owner)`.
- `activity-response.dto.ts` — `RecentActivityDto`: `id` (uuid), `type` (enum), `actor` (nested `ActivityActorDto`: `id`, `displayName`), `description`, `createdAt`.
- `dashboard-statistics-response.dto.ts` — `DashboardStatisticsDto`: `workspacesCount`, `organizationsCount`, `projectsCount`, `activeUsersCount` (all `number`, `@IsInt()`/`@Min(0)`).
- Pagination query DTO (e.g. `RecentQueryDto` with `@IsOptional() @Type(() => Number) @IsInt() @Min(1) limit`).

### 3.4 Repositories (`*/repositories` per existing pattern)
- `ProjectRepository` — `findRecentByOrganization(organizationId, limit)`, `countByOrganization(organizationId)`.
- `ActivityRepository` — `findRecentByOrganization(organizationId, limit)`.
- Both must scope strictly by `organizationId` (tenant isolation) and exclude
  `deletedAt` rows for `Project`.

### 3.5 Services
- `DashboardService` (new module) or extend existing services:
  - `getRecentProjects(organizationId, userId, limit)` — verify membership/ownership via tenant guard; fetch projects + owners (avoid N+1: single `include { owner }` or batched `userIds` lookup).
  - `getRecentActivity(organizationId, limit)`.
  - `getStatistics(organizationId, userId)` — three scoped `count()` calls (workspaces, orgs-via-membership, projects, active users). Use parallel `Promise.all` + `select`/indexed filters; no full-table scans.

### 3.6 Controllers + Module + Guards
- `DashboardController` (`@Controller("dashboard")` + `@Controller("projects")` + `@Controller("activity")` as appropriate) with `@UseGuards(AuthGuard)` and **tenant scoping** (`RequestWithTenant.organizationId`), mirroring `WorkspaceController`.
- Wire `TenantScopeGuard` so `organizationId` is enforced (multi-tenant safety).
- `dashboard.module.ts` importing `ProjectRepository`/`ActivityRepository` providers and `PrismaModule`.

### 3.7 OpenAPI + generated client
1. Boot the Nest app with mocked external providers (reuse `main.test.ts` harness) and `SwaggerModule.createDocument` → write `services/backend/openapi.json` (programmatic dump, since no server is reachable).
2. `pnpm --filter @atlas/api generate` (`scripts/generate-api-types.sh`) → regenerates `packages/api/src/generated.ts`. Verify new paths no longer have `content?: never`.
3. Confirm `apps/web` `useApi()` picks up typed `get` operations for the three endpoints.

### 3.8 Frontend wiring (`apps/web`)
- Add Zod schemas in `dashboard-schemas.ts` matching the DTOs.
- Add `useRecentProjects`, `useRecentActivity`, `useDashboardStatistics` hooks in `lib/queries.ts` (unique `queryKey`s).
- Replace the static `EmptyState` in `recent-sections.tsx` / statistics with real data + skeleton/error states.
- Re-run `pnpm lint && pnpm typecheck && pnpm build` for `apps/web` and `packages/api`.

---

## 4. Security & Quality Checks Required (post-implementation)
- [ ] All three endpoints require `AuthGuard` + `TenantScopeGuard` (no cross-tenant leakage).
- [ ] `organizationId` enforced server-side from tenant context, never from client body/query.
- [ ] `Project`/`ActivityLog` queries always `where: { organizationId }`; parameterized via Prisma (no string SQL → no injection).
- [ ] No N+1: owners/actors loaded via `include` or batched `in` lookups.
- [ ] Counts use indexed filters (`organizationId`, `status`, `updatedAt`).
- [ ] DTOs validated with `class-validator`; responses serialized via DTOs (no raw entities leaked).
- [ ] `pnpm audit` reviewed (runtime deps clean; only dev/build transitive advisories expected).
- [ ] No `any` / `ts-ignore` / `eslint-disable` / `console.log` / `debugger` / TODO/FIXME/HACK.

---

## 5. Known Limitations / Blockers
1. **No `Project`/`Activity` model exists** — hard blocker for `/projects/recent`, `/activity/recent`, and `projectsCount` in statistics.
2. **No reachable database** — migrations and runtime verification (and live OpenAPI dump) cannot be performed in this environment. The programmatic spec dump and `prisma generate` are the only feasible generation steps here.
3. **Stale `openapi.json`** — must be refreshed via the programmatic dump described in §3.7; otherwise `packages/api` keeps `content?: never`.

---

## 6. Recommendation (now owned by P4 — see ADR_P3_FREEZE.md)
> **P3 is FROZEN** (ADR-034). The work below is the prerequisite for thawing P3
> and is executed under **P4** (P4.1 Project Domain … P4.5 Dashboard Integration).
> See `ADR_P3_FREEZE.md` and `PROJECT_ROADMAP.md`.
Before any implementation, the domain owner must:
1. Approve the `Project` / `ActivityLog` model design in §3.1 (names, fields, enums, relations, indexes).
2. Provide a reachable database (or run the migration in an environment that has one).
3. Approve the programmatic OpenAPI-dump generator script (so `openapi.json` stays in sync and `content?: never` is eliminated repo-wide).

Only after 1–3 are satisfied should P3-4 implementation proceed, followed by the
`P3_4_IMPLEMENTATION.md`, `P3_4_SECURITY_REVIEW.md`, and `P3_4_OPENAPI_VALIDATION.md`
reports and the `apps/web` integration.

---

## 7. Documentation References Used
- NestJS — Controllers, Guards, Modules, Dependency Injection.
- Prisma — Schema (models, enums, relations, `@@index`, `@map`), Migrations (`prisma migrate dev`), Client generation.
- `@nestjs/swagger` — `ApiTags`, `ApiOperation`, `ApiResponse`, `ApiBearerAuth`, `ApiProperty`, `SwaggerModule.createDocument`.
- `class-validator` / `class-transformer` — DTO validation & serialization.
- OpenAPI 3.0 — `paths`, `operationId`, `requestBody`, `responses.content.schema`, `components.schemas`.
- `openapi-typescript` (v7) — `scripts/generate-api-types.sh` generation pipeline.
- `packages/api` generation constraint: `content?: never` arises when `openapi.json` response objects lack `content.schema`.

> Note: Context7 MCP quota is exhausted (no API key); the above is based on the
> verified repository source and stable official NestJS/Prisma/OpenAPI semantics.

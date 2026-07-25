# P4_1_DOMAIN_REVIEW.md

> **P4.1 — Project Domain: Security, Performance & Architecture Review**
> Status: Completed
> No code outside Prisma schema was written. All findings are based on the
> new `Project` and `ActivityLog` models in `services/backend/prisma/schema.prisma`.

---

## 1. Security Review

### 1.1 Multi-tenant isolation
- Both `Project` and `ActivityLog` have `organizationId` as a **required, non-nullable**
  field (`@db.Uuid`), enforced at the database level.
- Every query in P4.2 must include `where: { organizationId }` — this is the
  primary tenant isolation filter.
- `workspaceId` provides an additional scoping dimension (sub-tenant).
- The existing `TenantScopeGuard` (`services/backend/src/tenant/guards/`) must
  be applied to all P4.2 controllers — it resolves `RequestWithTenant.tenant`
  from the JWT `organizationId` claim and enforces membership.
- ⚠️ **Rule:** The controller must NEVER accept `organizationId` from the client
  (body/query/params). It must only read it from `request.tenant.organizationId`.

### 1.2 Authorization
- `AuthGuard` must be applied to all new endpoints (existing pattern in
  `WorkspaceController`, etc.).
- Project ownership (`ownerId`) must be verified by the service when performing
  mutations (update, delete). Read operations should scope by organization only.
- ActivityLog is append-only (no update/delete at the API level) — controlled by
  the service layer; direct database manipulation is still possible by
  authenticated users with appropriate membership roles.

### 1.3 Ownership checks
- `Project.ownerId` references `User` with `onDelete: Restrict` — prevents
  deleting a user who owns projects (preserves referential integrity).
- `ActivityLog.actorId` also uses `Restrict` — prevents deleting a user who has
  activity log entries (audit trail integrity).
- Both fields are required (non-nullable) — every record must have a known owner/actor.

### 1.4 Injection & validation
- Prisma parameterizes all queries by default — no SQL injection vector from
  the ORM API.
- `class-validator` DTO validation (P4.2) provides input validation at the
  controller boundary.
- `metadata` is a `Json` field — NestJS `ValidationPipe` with `class-validator`
  will validate the structure if a typed DTO with `@IsObject()` is used.

### 1.5 Soft delete security
- `Project.deletedAt` (nullable DateTime) enables soft delete.
- Production queries must always include `where: { deletedAt: null }` to prevent
  returning soft-deleted resources.
- The composite index `@@index([organizationId, deletedAt])` ensures this filter
  does not cause a full-table scan.

### 1.6 Audit trail
- `ActivityLog` is designed as an append-only audit trail.
- Every project mutation (create, update, status change, member add/remove,
  archive, restore) should insert an `ActivityLog` entry via the service layer.
- The `metadata` Json field can store before/after snapshots or additional
  context without schema changes.

---

## 2. Performance Review

### 2.1 Index coverage

| Model | Index | Purpose |
|---|---|---|
| `Project` | `@@index([workspaceId])` | Filter projects by workspace |
| `Project` | `@@index([organizationId])` | Filter projects by organization (tenant) |
| `Project` | `@@index([ownerId])` | Find projects owned by user |
| `Project` | `@@index([status])` | Filter by status (e.g. active projects) |
| `Project` | `@@index([createdAt])` | Order/sort by creation date |
| `Project` | `@@index([updatedAt])` | Order/sort by last update |
| `Project` | `@@index([deletedAt])` | Filter soft-deleted rows |
| `Project` | `@@index([organizationId, deletedAt])` | **Critical:** list active projects for an org (most common query) |
| `ActivityLog` | `@@index([projectId])` | Filter logs by project |
| `ActivityLog` | `@@index([workspaceId])` | Filter logs by workspace |
| `ActivityLog` | `@@index([organizationId])` | Filter logs by organization |
| `ActivityLog` | `@@index([actorId])` | Filter logs by actor |
| `ActivityLog` | `@@index([type])` | Filter by activity type |
| `ActivityLog` | `@@index([createdAt])` | Order/sort recent activity |

### 2.2 N+1 prevention assessment
- `Project` includes direct relation references to `workspace`, `organization`,
  `owner` (User), and `activityLogs`. All can be loaded via a single Prisma query
  with `include` without cascading N+1.
- `ActivityLog` includes `project`, `workspace`, `organization`, `actor` (User).
  Same — single query with `include` for the common "recent activity + actor"
  pattern.
- **Potential N+1 risk in P4.2:** When listing projects with their owners,
  use `include: { owner: true }` (single query). Do NOT fetch projects first then
  loop to fetch each owner separately.
- For the statistics endpoint, use parallel `Promise.all` with separate
  `count({ where: { organizationId } })` calls. Each count is an indexed query.

### 2.3 Statistics query design (P4.2)
```ts
const [workspacesCount, projectsCount, activeUsersCount] = await Promise.all([
  prisma.workspace.count({ where: { organizationId } }),
  prisma.project.count({ where: { organizationId, deletedAt: null } }),
  prisma.membership.count({
    where: { organizationId, status: "Active" },
  }),
]);
```
- `organizationsCount` — the user's orgs are found via `Membership`:
  `prisma.membership.count({ where: { userId, status: "Active" } })`.
- All three-filters are indexed.

---

## 3. Migration & DB state
- `prisma validate` — ✅ PASS
- `prisma format` — ✅ PASS
- `prisma generate` — ✅ PASS (Client v7.8.0 generated)
- `prisma migrate dev` — ⚠️ **Not run** (no reachable PostgreSQL instance)
- `prisma migrate diff` — ⚠️ **Not run** (requires DB URL with shadow database)

The SQL migration must be applied in an environment with:
1. A running PostgreSQL instance.
2. `DATABASE_URL` configured in the backend `.env`.
3. Run: `pnpm --filter backend exec prisma migrate dev --name add_projects_and_activity`

---

## 4. Anti-pattern scan

- `any` — not applicable (schema only, no TypeScript)
- `ts-ignore` — not applicable
- `eslint-disable` — not applicable
- `console.log` — not applicable
- `debugger` — not applicable
- `TODO` / `FIXME` / `HACK` — not applicable

---

## 5. Quality gates summary

| Gate | Result |
|---|---|
| Prisma schema valid | ✅ |
| Prisma formatted | ✅ |
| Prisma client generated | ✅ (Project + ActivityLog + enums present) |
| All foreign keys indexed | ✅ |
| Soft delete supported | ✅ (Project.deletedAt + composite index) |
| Multi-tenant ready | ✅ (organizationId required on both models) |
| onDelete policies correct | ✅ (Cascade for scoped children, Restrict for owners) |
| No `any` / `ts-ignore` / `eslint-disable` | ✅ (no code written) |
| DB migration applied | ❌ (no reachable database) |
| `openapi.json` updated | ❌ (deferred to P4.3) |
| `packages/api` regenerated | ❌ (deferred to P4.4) |

---

## 6. Known limitations
1. **Migration not applied** — tables do not exist in any PostgreSQL instance.
2. **No runtime verification** — the app cannot boot without a DB.
3. **OpenAPI / packages/api update pending** — P4.3–P4.4.
4. **Domain model completeness:** The current `Project` and `ActivityLog` models
   meet the P3-4 endpoint specification exactly. Future needs (e.g. project
   milestones, tags, custom fields) may require additional fields or related models.
   If needed, these can be added as optional fields without breaking existing queries.

---

## 7. Recommendations for P4.2
1. **Module structure:** Create `services/backend/src/project/` (controllers,
   dto, services, repositories) following the `workspace/` module convention
   exactly (module file with `.module.test.ts`).
2. **Repositories:** encapsulate Prisma queries with tenant scope and soft-delete
   filter in every read operation.
3. **Services:** auto-create `ActivityLog` entries on project mutations (CREATE,
   UPDATE, STATUS_CHANGE). Do not expose ActivityLog writes in the API — they are
   audit-only.
4. **DTOs:** `class-validator` + `@nestjs/swagger` every field. Response DTOs must
   use `static from(entity)` factory method (per `WorkspaceResponseDto` pattern).
5. **Statistics endpoint:** Use `prisma.$transaction` for the three `count()` calls
   to ensure consistency under concurrent modifications. All scoped by
   `organizationId`.

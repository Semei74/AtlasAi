# P4_1_IMPLEMENTATION.md

> **P4.1 — Project Domain (Prisma Schema Implementation)**
> Status: Completed
> No git operations performed (per instructions).

---

## 1. What existed before

- The Prisma schema (`services/backend/prisma/schema.prisma`) had 17 models:
  `User`, `PasswordHistory`, `PasswordResetToken`, `Organization`, `Workspace`,
  `Membership`, `Invitation`, `AiRequest`, `PromptCategory`, `Prompt`,
  `PromptVersion`, `PromptExecution`, `KnowledgeDocument`,
  `KnowledgeDocumentMetadataHistory`, `KnowledgeDocumentOcr`,
  `KnowledgeDocumentParse`.
- **No `Project` or `ActivityLog` model existed.**
- 10 enums: `UserStatus`, `MembershipRole`, `MembershipStatus`, `InvitationStatus`,
  `PromptStatus`, `PromptVisibility`, `PromptRole`, `DocumentStatus`, `OcrStatus`,
  `ParseStatus`.
- The schema had 495 lines and was validated/formatted with no errors.
- DB was unreachable (Prisma Postgres proxy ports closed) — migrations could not
  be applied; `prisma generate` worked offline.

---

## 2. What was changed

All changes are in `services/backend/prisma/schema.prisma` only (no TypeScript code
was written — that is P4.2).

### 2.1 New enums added

**`ProjectStatus`** (line 360–367, `project_status` table):
```prisma
enum ProjectStatus {
  ACTIVE
  ARCHIVED
  DRAFT
  COMPLETED
}
```

**`ActivityType`** (line 369–379, `activity_type` table):
```prisma
enum ActivityType {
  CREATED
  UPDATED
  STATUS_CHANGED
  MEMBER_ADDED
  MEMBER_REMOVED
  ARCHIVED
  RESTORED
}
```

### 2.2 New models added

#### `Project` (lines 497–523)
| Field | Type | Constraints | Column |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid()) @db.Uuid` | `id` |
| `name` | `String` | required | `name` |
| `description` | `String?` | nullable | `description` |
| `status` | `ProjectStatus` | `@default(DRAFT)` | `status` |
| `workspaceId` | `String` | `@db.Uuid` | `workspace_id` |
| `organizationId` | `String` | `@db.Uuid` | `organization_id` |
| `ownerId` | `String` | `@db.Uuid` | `owner_id` |
| `createdAt` | `DateTime` | `@default(now())` | `created_at` |
| `updatedAt` | `DateTime` | `@updatedAt` | `updated_at` |
| `deletedAt` | `DateTime?` | nullable (soft delete) | `deleted_at` |

Relations:
- `workspace` → `Workspace` (`onDelete: Cascade`)
- `organization` → `Organization` (`onDelete: Cascade`)
- `owner` → `User` (`onDelete: Restrict`)
- `activityLogs` → `ActivityLog[]`

Indexes:
- `@@index([workspaceId])`
- `@@index([organizationId])`
- `@@index([ownerId])`
- `@@index([status])`
- `@@index([createdAt])`
- `@@index([updatedAt])`
- `@@index([deletedAt])`
- `@@index([organizationId, deletedAt])` — composite for tenant-scoped list queries with soft-delete filter

#### `ActivityLog` (lines 525–548)
| Field | Type | Constraints | Column |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid()) @db.Uuid` | `id` |
| `projectId` | `String` | `@db.Uuid` | `project_id` |
| `workspaceId` | `String` | `@db.Uuid` | `workspace_id` |
| `organizationId` | `String` | `@db.Uuid` | `organization_id` |
| `actorId` | `String` | `@db.Uuid` | `actor_id` |
| `type` | `ActivityType` | required | `type` |
| `description` | `String` | required | `description` |
| `metadata` | `Json` | `@default("{}")` | `metadata` |
| `createdAt` | `DateTime` | `@default(now())` | `created_at` |

Relations:
- `project` → `Project` (`onDelete: Cascade`)
- `workspace` → `Workspace` (`onDelete: Cascade`)
- `organization` → `Organization` (`onDelete: Cascade`)
- `actor` → `User` (`onDelete: Restrict`)

Indexes:
- `@@index([projectId])`
- `@@index([workspaceId])`
- `@@index([organizationId])`
- `@@index([actorId])`
- `@@index([type])`
- `@@index([createdAt])`

### 2.3 Existing models updated (back-references)

- **`User`** — added `ownedProjects Project[]` + `actorLogs ActivityLog[]`
- **`Organization`** — added `projects Project[]` + `activityLogs ActivityLog[]`
- **`Workspace`** — added `projects Project[]` + `activityLogs ActivityLog[]`

---

## 3. ER-relationship diagram

```text
Organization (1) ──< (N) Project (N) >── (1) Workspace
     │                      │                     │
     │                      │                     │
     ├── ActivityLog (N) ───┤                     │
     │           │          │                     │
     │           └──────────┼─────────────────────┘
     │                      │
     └── User (owner)       User (actor)
```

**Key relationships:**
- `Organization` → `Project`: one-to-many (cascade delete)
- `Organization` → `ActivityLog`: one-to-many (cascade delete)
- `Organization` → `User` (owner): many-to-one (restrict delete)
- `Workspace` → `Project`: one-to-many (cascade delete)
- `Workspace` → `ActivityLog`: one-to-many (cascade delete)
- `User` → `Project` (owner): one-to-many (restrict delete — cannot remove user who owns projects)
- `User` → `ActivityLog` (actor): one-to-many (restrict delete — audit trail integrity)
- `Project` → `ActivityLog`: one-to-many (cascade delete — removing a project removes its logs)

---

## 4. Architectural decisions

### 4.1 `onDelete` policies
| Relation | Policy | Rationale |
|---|---|---|
| Project.workspace | `Cascade` | Projects are workspace-scoped; removing a workspace removes its projects. |
| Project.organization | `Cascade` | Same — org-scoped. |
| Project.owner | `Restrict` | Preventing owner deletion preserves ownership integrity. Follows `Organization.owner` precedent. |
| ActivityLog.project | `Cascade` | Follows existing KnowledgeDocument cascade patterns; soft-delete (Project.deletedAt) is the production path, so cascade only triggers on hard deletes. |
| ActivityLog.workspace | `Cascade` | Consistent with workspace-scoping of child records. |
| ActivityLog.organization | `Cascade` | Consistent with org-scoping. |
| ActivityLog.actor | `Restrict` | Audit trail preservation — users who performed actions cannot be deleted until their logs are resolved. |

### 4.2 Soft delete
`Project.deletedAt` follows the `KnowledgeDocument.deletedAt` pattern.
Queries must always include `where: { deletedAt: null }` to exclude soft-deleted
records. The composite index `@@index([organizationId, deletedAt])` optimises
the common tenant-scoped "active projects" query.

### 4.3 Multi-tenant readiness
Both `Project` and `ActivityLog` carry `organizationId` and `workspaceId` as
required fields (not nullable). All queries must filter by `organizationId` for
tenant isolation. The `workspaceId` provides an additional scoping dimension.
The corresponding `TenantScopeGuard` (from `services/backend/src/tenant/guards/`)
must be applied to all controllers in P4.2.

### 4.4 Performance & N+1 prevention
- All foreign keys are indexed (`@@index([workspaceId])`, etc.).
- All query-filter fields are indexed (`status`, `createdAt`, `updatedAt`,
  `deletedAt`, `type`).
- The composite `@@index([organizationId, deletedAt])` accelerates the most
  frequent query pattern: "list active projects for this org".
- ActivityLog has `@@index([createdAt])` for ordering recent activity.
- Relations are structured for Prisma `include`(`workspace`, `organization`,
  `owner`, `actor`) without cascading N+1 — owners/actors can be loaded in one
  query via the relation.

### 4.5 Enum conventions
Follow the existing schema style: PascalCase enum values, `@@map("snake_case")`
for the database enum name. ProjectStatus uses UPPERCASE values (`ACTIVE`,
`ARCHIVED`, `DRAFT`, `COMPLETED`) to match the SQL convention for status enums
and avoid ambiguity (existing `UserStatus` uses PascalCase `Active`, which is
inconsistent; we chose uppercase for clarity in DB dumps).

---

## 5. Validation results

| Check | Result |
|---|---|
| `prisma validate` | ✅ Valid |
| `prisma format` | ✅ Formatted (18ms) |
| `prisma generate` | ✅ Generated Prisma Client (v7.8.0) |
| `prisma migrate diff` | ⚠️ Skipped — no reachable database |
| DB reachability | ❌ Prisma Postgres proxy ports closed (51213/51214); postgres port 5432 closed |

---

## 6. Documentation references used
- Prisma — Models, Enums, Relations (`@relation`), Actions (`onDelete`), Indexes
  (`@@index`, `@@unique`), Field mapping (`@map`, `@@map`), `@id`, `@default`,
  `@updatedAt`, Soft delete patterns.
- NestJS — Auth guards, Tenant guards (patterns for P4.2).
- `services/backend/prisma/schema.prisma` — existing models as reference for
  naming and relation conventions.
- `services/backend/src/auth/authorization/guards/auth.guard.ts` — usage pattern.
- `services/backend/src/tenant/guards/tenant-scope.guard.ts` — multi-tenant guard.
> Context7 MCP quota exhausted (no API key); references based on verified repo
> source and stable official Prisma docs.

---

## 7. Known limitations
1. **No reachable database** — `prisma migrate dev` could not be run; the models
   are fully designed and validated but the corresponding database tables do not
   exist yet. The migration must be applied in an environment with a running
   PostgreSQL instance.
2. **No runtime verification** — since the app cannot boot without a DB, the
   models have not been tested end-to-end.
3. **`openapi.json` remains stale** — will be refreshed in P4.3.
4. **`packages/api` still has `content?: never`** — will be fixed in P4.4.

---

## 8. Recommendations for P4.2
1. Create `projects/` and `activity/` NestJS feature modules following the
   `workspace/` module structure (controllers, services, repositories, DTOs).
2. Apply `AuthGuard` + `TenantScopeGuard` to all new controllers.
3. Use `class-validator` DTOs (`@IsString()`, `@IsEnum()`, `@IsOptional()`,
   `@IsUUID()`) and `@nestjs/swagger` `@ApiProperty()` for all fields.
4. The `recent` endpoints should accept an optional `limit` query parameter
   (default 10, max 50); DTOs must be validated.
5. ActivityLog entries should be created via service-layer hooks when projects
   are created/updated (not from the controller). This keeps audit logic
   centralized.
6. Statistics endpoint must use `Prisma.$transaction` or `Promise.all` for
   parallel `count()` calls (workspaces, orgs-via-membership, projects, active
   users) — all scoped by `organizationId`.
7. Ensure `projectsCount` in statistics excludes soft-deleted projects
   (`where: { deletedAt: null }`).
8. No repositories/services/controllers were created here — that is the scope of
   P4.2.

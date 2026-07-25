# P3_3_BACKEND_REQUIREMENTS.md

> Backend preparation for Dashboard data that is **currently missing** on the
> server. Per P3-3 rules: do NOT invent fake APIs or mock data. The frontend
> correctly renders empty states for these sections; this document specifies what
> the backend must implement so they can be wired later — without changing the
> existing frontend architecture (the query hooks and Zod schema slots are ready).

## 1. What the Backend Currently Provides (verified)

| Endpoint | Controller | Response DTO | Frontend status |
|----------|-----------|--------------|-----------------|
| `GET /workspaces` | `WorkspaceController.findAll` | `WorkspaceResponseDto[]` | ✅ Integrated (P3-2/3) |
| `GET /organizations` | `OrganizationController.findAll` | `OrganizationResponseDto[]` | ✅ Integrated (P3-2/3) |
| `GET /users/preferences` | `UserController.getPreferences` | `{ theme, locale, emailNotifications, pushNotifications }` | ✅ Integrated (P3-2/3) |
| `GET /auth/me` | `AuthController.getProfile` | full user profile | ✅ Integrated (P3-3) |
| `GET /api/v1/prompts` | `PromptLibraryController` | `Prompt[]` | Available, not a "Project" |
| `GET /api/v1/knowledge/documents` | `DocumentController` | `KnowledgeDocument[]` | Available, not a "Project" |

All four required "core" dashboard resources (Workspace, Organization, Preferences,
Profile) are implemented and wired. The remaining three dashboard sections have
**no backend support**:

## 2. Missing Endpoints

### 2.1 Recent Projects
- **Status:** ABSENT. No `Project` model, controller, service, DTO, or route exists.
- **Why not faked:** "Projects" is a distinct domain concept. Repurposing `Prompt`
  or `KnowledgeDocument` as "Projects" would be misleading and violate the
  no-mock/no-fake rule.
- **Prisma models that exist and are relevant:** `Workspace` (projects would likely
  belong to a workspace), `Organization`, `Membership`.
- **Required backend work:**
  - Add `Project` model to `services/backend/prisma/schema.prisma`:
    ```prisma
    model Project {
      id            String   @id @default(uuid()) @db.Uuid
      workspaceId   String   @map("workspace_id") @db.Uuid
      name          String
      description   String?
      status        ProjectStatus @default(Draft)
      createdById   String   @map("created_by_id") @db.Uuid
      createdAt     DateTime @default(now()) @map("created_at")
      updatedAt     DateTime @updatedAt @map("updated_at")
      workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
      @@index([workspaceId])
      @@map("projects")
    }
    enum ProjectStatus { Draft Active Archived }
    ```
  - `ProjectService` + `ProjectController` (`GET /projects?workspaceId=&limit=`) with
    `AuthGuard` + tenant scoping (mirror `WorkspaceController`).
  - DTO: `ProjectResponseDto { id, workspaceId, name, description, status, createdById, createdAt, updatedAt }`.
- **Frontend ready hook slot:** add `useRecentProjects()` in `apps/web/lib/queries.ts`
  calling `api.GET("/projects", { params: { query: { limit: 5 } } })` and a
  `recentProjectsSchema` in `dashboard-schemas.ts`. `RecentProjects` component
  already renders; only its data source changes.

### 2.2 Recent Activity
- **Status:** ABSENT. No activity feed / audit-log endpoint.
- **Prisma models that exist:** `AiRequest` (per-request audit), `PasswordHistory`,
  `PromptExecution`, `KnowledgeDocumentMetadataHistory`. There is **no unified
  activity/event model**.
- **Required backend work:**
  - Add `Activity` model (or reuse an existing audit table):
    ```prisma
    model Activity {
      id          String   @id @default(uuid()) @db.Uuid
      userId      String   @map("user_id") @db.Uuid
      type        String   // e.g. "workspace.created", "project.updated"
      payload     Json     @default("{}")
      createdAt   DateTime @default(now()) @map("created_at")
      @@index([userId])
      @@map("activities")
    }
    ```
  - `ActivityService` + `ActivityController` (`GET /activity?limit=10`) scoped to the
    current user (or their organization).
  - DTO: `ActivityResponseDto { id, type, payload, createdAt }`.
- **Frontend ready hook slot:** `useRecentActivity()` → `api.GET("/activity", …)` +
  `recentActivitySchema`. `RecentActivity` component already exists.

### 2.3 Dashboard Statistics
- **Status:** ABSENT as a dedicated endpoint.
- **Note:** The dashboard already derives **real** counts (Workspaces, Organizations,
  Account status) client-side from existing queries — no fake data. A dedicated
  statistics endpoint is optional but recommended for richer metrics (e.g. total
  prompts, documents, storage used).
- **Required backend work (optional):**
  - `GET /statistics` (or `/dashboard/statistics`) returning aggregated counters:
    `{ workspaces, organizations, projects, prompts, documents, memberships }`.
  - Backed by a `StatisticsService` aggregating via Prisma `count()` queries.
- **Frontend ready hook slot:** `useDashboardStatistics()` → `api.GET("/statistics")`
  + `dashboardStatisticsSchema`. StatisticsCards already consumes query data; only
  the data source would switch from derived counts to the endpoint.

## 3. Services That Must Be Implemented (backend)
- `ProjectService` (CRUD + list-by-workspace, tenant-scoped).
- `ActivityService` (record + list-by-user/org).
- `StatisticsService` (aggregations, optional).
- Wire into existing `AuthGuard` + tenant/authorization (`RolesGuard`,
  `AuthorizationService`) — do NOT create new auth primitives.

## 4. Existing Frontend Query Hooks Already Ready
- `useWorkspaces()` ✅
- `useOrganizations()` ✅
- `useUserPreferences()` ✅
- `useAuthMe()` ✅
- Slots reserved (to add when backend lands): `useRecentProjects()`,
  `useRecentActivity()`, `useDashboardStatistics()`.

## 5. What Remains To Connect After Backend Exists
1. Add the three hooks above + Zod schemas to `apps/web/lib/`.
2. Replace the empty-state bodies in `recent-sections.tsx` with real mapped lists.
3. (Optional) Switch `StatisticsCards` to consume `useDashboardStatistics()`.
4. No architecture changes — reuse `useApi()` (existing `@atlas/api` client),
   `QueryClient` (existing `@atlas/hooks`), `AuthStore` (existing `@atlas/auth`).
5. Regenerate `packages/api/src/generated.ts` from the updated OpenAPI spec so the
   typed client can replace the Zod parse layer.

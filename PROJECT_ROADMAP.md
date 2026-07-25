# PROJECT_ROADMAP.md

> **Authoritative project-level phase tracker.**
> This document overrides ad-hoc "next step" assumptions. For architectural
> decision context see `ADR_P3_FREEZE.md` (ADR-034).

---

## Current Phase Sequence

```text
Phase 2         ✅ Completed
P3              🟡 Frozen     (waiting for Project Domain — see ADR_P3_FREEZE.md)
P4              ▶  Active
  P4.1 Project Domain
  P4.2 Backend API
  P4.3 OpenAPI
  P4.4 packages/api regeneration
  P4.5 Dashboard Integration
```

> After **P4 completes**, the agent MUST automatically return to the unfinished
> part of **P3** (see Thaw Conditions in `ADR_P3_FREEZE.md`).

---

## Phase 2 — Completed ✅

Infrastructure foundation (TASK-1128 = CLOSED). All P2 deliverables met.
Remaining native mobile runtime tracked in `MOBILE_INSPECTION.md` /
`FINAL_PROJECT_STATUS.md`.

---

## P3 — Frozen 🟡

**Status:** `FROZEN`
**Reason:** Waiting for Project Domain implementation.
**Decision record:** `ADR_P3_FREEZE.md` (ADR-034).

### Completed sub-tasks (preserved)
- P3-1 Web Authentication — ✅ Completed
- P3-2 Production-Ready Dashboard UI — ✅ Completed
- P3-3 Dashboard Backend Integration (existing endpoints) — ✅ Completed

### Frozen sub-task
- P3-4 Dashboard Backend API: `GET /projects/recent`, `GET /activity/recent`,
  `GET /dashboard/statistics` — 🟡 Frozen (blocked on missing `Project` /
  `ActivityLog` domain models).

### Automatic Thaw Conditions (all required)
- [ ] `Project` Prisma model
- [ ] `ActivityLog` Prisma model
- [ ] Migration applied
- [ ] Repository (tenant-scoped)
- [ ] Service (tenant-scoped, no N+1)
- [ ] Controller (`AuthGuard` + `TenantScopeGuard`)
- [ ] Swagger descriptors
- [ ] OpenAPI regenerated
- [ ] `packages/api` regenerated (no `content?: never` for new paths)
- [ ] Real endpoints live: `GET /projects/recent`, `GET /activity/recent`,
      `GET /dashboard/statistics`

When all are satisfied, resume P3-4 and wire endpoints into `apps/web` Dashboard.

---

## P4 — Active ▶

**Goal:** Implement the new business domain (Project + Activity) and complete the
Dashboard Backend that P3 could not, then regenerate OpenAPI / `packages/api` and
integrate into the Dashboard.

### P4.1 — Project Domain
- Add `Project` Prisma model (fields: `id`, `name`, `workspaceId`, `updatedAt`,
  `status`, `owner`) with `organizationId`, relations, and indexes.
- Add `ActivityLog` Prisma model (fields: `id`, `type`, `actor`, `description`,
  `createdAt`) with `organizationId`, relations, and indexes.
- `prisma migrate dev` + `prisma generate`.
- See `P3_4_ANALYSIS.md` §3.1–§3.2 for the detailed model design.

### P4.2 — Backend API
- Repositories (tenant-scoped `where: { organizationId }`).
- Services (tenant-scoped, no N+1 via `include`/batched lookups, parallel counts).
- Controllers with `AuthGuard` + `TenantScopeGuard`; DTOs with `class-validator`
  and `@nestjs/swagger` `@ApiProperty`/`@ApiResponse`.
- Endpoints: `GET /projects/recent`, `GET /activity/recent`,
  `GET /dashboard/statistics`.

### P4.3 — OpenAPI
- Refresh `services/backend/openapi.json` with real `requestBody` / `responses.content`
  schemas (programmatic `SwaggerModule.createDocument` dump, since no live server
  is reachable here). Eliminate `content?: never` repo-wide.

### P4.4 — packages/api regeneration
- Run `pnpm --filter @atlas/api generate` (`scripts/generate-api-types.sh`).
- Verify new paths no longer carry `requestBody?: never` / `content?: never`.

### P4.5 — Dashboard Integration
- Add Zod schemas + query hooks in `apps/web` (`dashboard-schemas.ts`,
  `lib/queries.ts`).
- Replace reserved `EmptyState` placeholders in `recent-sections.tsx` /
  statistics with real data + skeleton/error states.
- `pnpm lint && pnpm typecheck && pnpm build` for `apps/web` and `packages/api`.

---

## Relationship to ROADMAP.md

`ROADMAP.md` uses its own internal Phase numbering (Phase 3 = Core Platform,
Phase 4 = AI Platform, etc.). That numbering describes the long-term product
roadmap and is **not** the same as the P3/P4 task-stream labels used here. This
document (`PROJECT_ROADMAP.md`) is the authoritative tracker for the P3/P4
task streams and their freeze/thaw state.

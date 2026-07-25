# ADR_P3_FREEZE.md

> **Architecture Decision Record — P3 Freeze (Project Domain Deferral)**
> Status: **Accepted / Binding**
> Supersedes any prior assumption that P3 Dashboard Backend work is continuable as-is.
> This document is permanent architecture documentation, not a TODO or temporary note.

---

## 1. Decision

The **P3 — Dashboard Backend Integration** stream is officially placed in status
**`FROZEN`**.

P3 is **NOT cancelled**. It is temporarily frozen pending the implementation of a
new business domain (the **Project** and **ActivityLog** entities) that the current
schema does not contain.

P3 will automatically return to `ACTIVE` once the thaw conditions in §5 are fully
satisfied. At that point the OpenCode agent must resume the incomplete part of P3
without being re-prompted.

---

## 2. Reason for Freeze

P3 cannot be continued because the current Prisma domain model lacks the real
entities required by the P3 Dashboard specification:

| Required endpoint | Missing entity / field | Why it blocks |
| ----------------- | ---------------------- | ------------- |
| `GET /projects/recent` | No `Project` model (`id`, `name`, `workspaceId`, `updatedAt`, `status`, `owner`) | No source of real project rows. |
| `GET /activity/recent` | No `ActivityLog` (or any event/audit) model (`id`, `type`, `actor`, `description`, `createdAt`) | No source of real activity rows. |
| `GET /dashboard/statistics` → `projectsCount` | No `Project` model | Aggregate cannot be computed. |

This is an **architectural constraint, not an implementation error**. No backend
code, query, or wiring is missing — the underlying subject area simply does not
exist in the data model yet.

---

## 3. Prohibited Workarounds

The following substitutes are explicitly **forbidden** and must never be used to
"unblock" P3:

- **`Prompt` in place of `Project`** — `Prompt` is a distinct domain entity
  (prompt templates/versions). Mapping projects onto prompts mislabels the
  domain, corrupts the `projectsCount` semantic, and breaks multi-tenant meaning.
- **`AiRequest` in place of `Activity`** — `AiRequest` records AI call telemetry
  (provider/model/tokens), not user-facing activity (`type`/`actor`/`description`).
  It cannot supply real activity rows without fabricating semantics.
- **Mock data** — violates the project's production-readiness and no-fake-data rules.
- **Fake data / hard-coded values** — violates the same rules and the AGENTS.md
  prohibition on placeholder implementations.

The only acceptable path is to implement the real domain (see §5) and then resume P3.

---

## 4. Status

```text
P3 = FROZEN
Reason: Waiting for Project Domain implementation (Project + ActivityLog models,
migration, repository, service, controller, Swagger, OpenAPI + packages/api
regeneration, and the three real endpoints).
```

All previously completed P3 sub-tasks remain valid and are preserved:

- P3-1 Web Authentication — Completed
- P3-2 Production-Ready Dashboard UI — Completed
- P3-3 Dashboard Backend Integration (against existing endpoints) — Completed
- P3-4 / P3-4 Dashboard Backend API (`/projects/recent`, `/activity/recent`,
  `/dashboard/statistics`) — Frozen (blocked on domain)

---

## 5. Automatic Thaw Conditions

P3 becomes `ACTIVE` automatically **only after ALL** of the following are true:

- [ ] `Project` Prisma model exists
- [ ] `ActivityLog` Prisma model exists
- [ ] Migration applied (`prisma migrate`)
- [ ] Repository implemented (tenant-scoped)
- [ ] Service implemented (tenant-scoped, no N+1)
- [ ] Controller implemented (`AuthGuard` + `TenantScopeGuard`)
- [ ] Swagger descriptors present (`@ApiProperty`, `@ApiResponse`)
- [ ] OpenAPI regenerated (`openapi.json` refreshed)
- [ ] `packages/api` regenerated (no `content?: never` for new paths)
- [ ] Real endpoints live:
  - `GET /projects/recent`
  - `GET /activity/recent`
  - `GET /dashboard/statistics`

Upon satisfaction, the agent MUST resume P3-4 implementation and then wire the
endpoints into `apps/web` Dashboard (Zod schemas, query hooks, replace the
reserved `EmptyState` placeholders).

---

## 6. Relationship to Roadmap

See `PROJECT_ROADMAP.md` for the current phase sequence:

```text
Phase 2         ✅ Completed
P3              🟡 Frozen (waiting for Project Domain)
P4              ▶ Active
  P4.1 Project Domain
  P4.2 Backend API
  P4.3 OpenAPI
  P4.4 packages/api regeneration
  P4.5 Dashboard Integration
```

After **P4 completes**, the agent must automatically return to the unfinished part
of **P3** (thaw conditions in §5).

---

## 7. Documentation References

- `P3_4_ANALYSIS.md` — full gap analysis and required change list.
- `PROJECT_ROADMAP.md` — phase sequence and P3/P4 status.
- `ARCHITECTURE_DECISIONS.md` — ADR-034 (this decision, registered).
- `services/backend/prisma/schema.prisma` — current models (no `Project`/`ActivityLog`).
- Prisma — Models, Enums, Relations, `@@index`, Migrations.
- NestJS — Controllers, Guards (`AuthGuard`, `TenantScopeGuard`), Modules.
- `@nestjs/swagger` — `ApiTags`, `ApiOperation`, `ApiResponse`, `ApiProperty`.
- `openapi-typescript` — `scripts/generate-api-types.sh` generation pipeline.

> Context7 MCP quota exhausted (no API key); references based on verified repo
> source and stable official NestJS/Prisma/OpenAPI semantics.

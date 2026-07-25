# P4_0_BASELINE.md

> **P4-0 — Freeze P3 & Prepare New Domain (Architecture Baseline)**
> Status: Completed (documentation baseline only; no code changes).
> No git operations performed (per instructions).

---

## 1. What existed before

- **P3 Dashboard Backend Integration** had delivered:
  - P3-1 Web Authentication (Completed)
  - P3-2 Production-Ready Dashboard UI (Completed)
  - P3-3 Dashboard Backend Integration against existing endpoints (Completed)
  - P3-4 Dashboard Backend API — **blocked**: required `GET /projects/recent`,
    `GET /activity/recent`, and `projectsCount`, but the Prisma schema contains
    **no `Project` and no `ActivityLog` model**.
- `P3_4_ANALYSIS.md` documented the gap and the full required change list.
- Roadmap documents (`ROADMAP.md`, `ROADMAP_PHASE3.md`) still implied P3 was the
  active/continuable stream with no freeze state.
- No permanent freeze decision existed in the architecture records.

---

## 2. Why P3 is frozen

P3 cannot continue because the current data model lacks real domain entities for
the required endpoints:

| Endpoint | Missing entity | Consequence |
| -------- | -------------- | ----------- |
| `GET /projects/recent` | `Project` model | No real project rows possible |
| `GET /activity/recent` | `ActivityLog` (any event/audit) model | No real activity rows possible |
| `GET /dashboard/statistics` → `projectsCount` | `Project` model | Aggregate not computable |

This is an **architectural constraint, not an implementation error**. Prohibited
workarounds (enforced in `ADR_P3_FREEZE.md`):
- `Prompt` → `Project` (mislabels domain, corrupts `projectsCount`)
- `AiRequest` → `Activity` (telemetry ≠ user-facing activity)
- Any mock / fake / hard-coded data (violates production-readiness & AGENTS.md)

P3 is **NOT cancelled** — it is `FROZEN` and will auto-resume when the domain lands.

---

## 3. Documents created / updated

### Created
- **`ADR_P3_FREEZE.md`** — permanent Architecture Decision Record for the freeze:
  decision, freeze reason, prohibited workarounds, status (`P3 = FROZEN`),
  automatic thaw conditions, roadmap relationship, references.
- **`PROJECT_ROADMAP.md`** — authoritative project-level phase tracker with the
  P3 (Frozen) / P4 (Active: P4.1–P4.5) sequence and the auto-return-to-P3 rule.
- **`P4_0_BASELINE.md`** — this report.

### Updated
- **`ARCHITECTURE_DECISIONS.md`**
  - ADR Index: added `ADR-034 | P3 Freeze (Project Domain Deferral) | Accepted`.
  - Body: added full `ADR-034` entry (Context, Decision, Alternatives,
    Consequences, References).
- **`ROADMAP.md`** — §4 Current Status: added a note that P3 Dashboard stream is
  FROZEN (links `ADR_P3_FREEZE.md`, `PROJECT_ROADMAP.md`); P4 is the active stream.
- **`ROADMAP_PHASE3.md`** — added a freeze banner at the top stating P3 is FROZEN
  and the Dashboard Backend API work now moves to P4.
- **`P3_3_FINAL_VALIDATION.md`** — replaced the "Recommended next step (P3-4)"
  sentence with a P4-forward statement linking `ADR_P3_FREEZE.md` /
  `PROJECT_ROADMAP.md`.
- **`P3_3_IMPLEMENTATION.md`** — §11 recommendations now explicitly owned by P4
  with links to `ADR_P3_FREEZE.md`.
- **`P3_4_ANALYSIS.md`** — §6 recommendation now explicitly owned by P4 with links.

### Consistency sweep
- Searched all `*.md` for "P3 Next" / "Continue P3" / continuations. Only the
  genuine P3-continuation references above were updated; unrelated prior-task
  labels (e.g. TASK-1123/1124 "P4.1" code-cleanup tasks) were left intact.
- `ROADMAP.md` internal Phase numbering (Phase 3 = Core Platform, etc.) is distinct
  from the P3/P4 task-stream labels; `PROJECT_ROADMAP.md` documents this explicitly
  to avoid confusion.

---

## 4. New roadmap (project-level)

```text
Phase 2         ✅ Completed
P3              🟡 Frozen     (waiting for Project Domain — ADR_P3_FREEZE.md)
P4              ▶  Active
  P4.1 Project Domain
  P4.2 Backend API
  P4.3 OpenAPI
  P4.4 packages/api regeneration
  P4.5 Dashboard Integration
```

After **P4** completes, the agent MUST automatically return to the unfinished part
of **P3** (resume P3-4 Dashboard Backend API and wire into `apps/web`).

---

## 5. Automatic thaw conditions (P3 → ACTIVE)

All must be satisfied (from `ADR_P3_FREEZE.md` §5):
- [ ] `Project` Prisma model
- [ ] `ActivityLog` Prisma model
- [ ] Migration applied
- [ ] Repository (tenant-scoped)
- [ ] Service (tenant-scoped, no N+1)
- [ ] Controller (`AuthGuard` + `TenantScopeGuard`)
- [ ] Swagger descriptors
- [ ] OpenAPI regenerated (`openapi.json`)
- [ ] `packages/api` regenerated (no `content?: never` for new paths)
- [ ] Real endpoints live:
  - `GET /projects/recent`
  - `GET /activity/recent`
  - `GET /dashboard/statistics`

---

## 6. Recommendations for P4.1

1. **Confirm the domain model** — ratify the `Project` / `ActivityLog` design
   proposed in `P3_4_ANALYSIS.md` §3.1 (fields, enums `ProjectStatus` /
   `ActivityType`, relations to `Organization`/`Workspace`/`User`, indexes on
   `organizationId`, `workspaceId`, `ownerId`/`actorId`, `updatedAt`/`createdAt`).
2. **Tenant isolation by design** — every query must scope by `organizationId`
   (multi-tenant safety); never trust client-supplied tenant ids.
3. **Avoid N+1** — load owners/actors via Prisma `include` or batched `in` lookups;
   compute statistics with parallel indexed `count()` calls.
4. **Migration environment** — a reachable database is required to run
   `prisma migrate dev` and to perform the live OpenAPI dump. In this environment
   the Prisma Postgres proxy was unreachable; plan execution where a DB is available.
5. **OpenAPI regeneration** — since no server is reachable here, refresh
   `openapi.json` via a programmatic `SwaggerModule.createDocument` dump using the
   existing mocked-provider test harness (mirrors `main.test.ts`); then run
   `pnpm --filter @atlas/api generate` and verify `content?: never` is eliminated
   for the new paths.
6. **DTO discipline** — all response DTOs use `class-validator` + `@ApiProperty`;
   no raw entities leaked; no `any` / `ts-ignore` / `eslint-disable` / `console.log`.
7. **Frontend wiring (P4.5)** — add Zod schemas + query hooks in `apps/web`, replace
   the reserved `EmptyState` placeholders in `recent-sections.tsx` / statistics with
   real data + skeleton/error states; re-run `lint`/`typecheck`/`build`.

---

## 7. Quality gates

- No code changed → no lint/typecheck/build impact.
- All documentation edits are markdown only.
- `ADR_P3_FREEZE.md` registered as ADR-034 in `ARCHITECTURE_DECISIONS.md`.
- Cross-document consistency verified via grep sweep (no dangling "P3 Next" /
  "Continue P3" implying continuable P3 without the freeze context).

---

## 8. Known limitations

- No reachable DB in this environment → P4.1 migration and live OpenAPI dump must
  run where a database is available; the analysis/spec is ready but unverified at
  runtime here.
- `openapi.json` remains stale until P4.3 regenerates it; `packages/api` still
  carries `content?: never` until P4.4.

---

## 9. Documentation references used

- `ADR_P3_FREEZE.md` (this baseline's primary artifact)
- `PROJECT_ROADMAP.md`
- `ARCHITECTURE_DECISIONS.md` (ADR-034)
- `ROADMAP.md`, `ROADMAP_PHASE3.md` (updated status)
- `P3_4_ANALYSIS.md` (gap analysis + model design)
- `P3_3_FINAL_VALIDATION.md`, `P3_3_IMPLEMENTATION.md` (continuation references fixed)

> Context7 MCP quota exhausted (no API key); references based on verified repo
> source and stable official NestJS/Prisma/OpenAPI semantics.

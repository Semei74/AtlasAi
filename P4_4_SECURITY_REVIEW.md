# P4_4_SECURITY_REVIEW.md

> **Security Review for P4.4 — Project Lifecycle**
> Status: Completed
> P3 remains FROZEN per `ADR_P3_FREEZE.md`.

---

## 1. Scope

Review covers all modified and new files:
- Backend: repository interface, Prisma repository, service, controller, 3 new DTOs
- Frontend: 1 new page, 3 modified files (queries, schemas, projects page)

Not in scope: authentication (AuthGuard pre-existing), session management, infrastructure, CORS.

---

## 2. Findings

### 2.1 None found ✅

No security vulnerabilities were introduced in P4.4.

---

## 3. Review areas

### 3.1 SQL Injection

| Vector | Status | Rationale |
|---|---|---|
| **Prisma queries** | ✅ Safe | All queries use Prisma's parameterized query builder. `where`, `orderBy`, `skip`, `take` are all type-safe. |
| **Search parameter** | ✅ Safe | `contains` with `mode: "insensitive"` is a Prisma-safe operation — Prisma escapes the value. |
| **Raw SQL** | ✅ None used | No `$queryRaw` or `$executeRaw` calls in project code. |

### 3.2 XSS (Cross-Site Scripting)

| Vector | Status | Rationale |
|---|---|---|
| **Project name/description in UI** | ✅ Safe | Rendered as React text nodes (`{variable}`). React escapes all content. |
| **Activity log description** | ✅ Safe | Same text-node rendering. |
| **Actor name** | ✅ Safe | Same. |

### 3.3 Authentication / Authorization

| Check | Status | Rationale |
|---|---|---|
| **AuthGuard on all endpoints** | ✅ | `@UseGuards(AuthGuard)` on all controller methods |
| **Organization isolation** | ✅ | Every service method calls `ensureMember(orgId, userId)` which validates membership |
| **Project ownership validation** | ✅ | `findById` checks project exists, then verifies membership in project's organization |
| **Archived project access** | ✅ | Archived projects are visible (status = ARCHIVED, not deleted) — `deletedAt: null` filter in list queries excludes soft-deleted records. Archive sets `deletedAt`, so archived projects are excluded from regular lists. BUT `findById` does NOT filter by `deletedAt` — archived projects can still be viewed by ID. This is intentional for the detail page. |
| **Restore permission** | ✅ | Same membership check — only org members can restore |

### 3.4 Data exposure

| Check | Status | Rationale |
|---|---|---|
| **Sensitive data in responses** | ✅ Safe | No passwords, tokens, or PII in project responses. Owner info is displayName + avatarUrl only. |
| **Activity logs contain actor displayName** | ✅ Safe | Display names are non-sensitive public profile info. |
| **Pagination metadata** | ✅ Safe | `total`, `page`, `limit`, `totalPages` — no sensitive data. |

### 3.5 Input validation

| Check | Status | Rationale |
|---|---|---|
| **class-validator on all DTOs** | ✅ | `ProjectListQueryDto` validates: `page` (Int, Min 1), `limit` (Int, Min 1, Max 100), `search` (String, MaxLength 200), `sort` (enum), `order` (enum), `status` (String) |
| **NestJS ValidationPipe** | ✅ | Existing infrastructure strips unknown properties and validates known ones |
| **Prisma schema constraints** | ✅ | Column types, lengths, and nullability enforced at DB level |

### 3.6 Business logic

| Check | Status | Rationale |
|---|---|---|
| **Cannot archive already-archived project** | ✅ | `archive()` checks `project.status !== "ARCHIVED"`, throws `ForbiddenException` |
| **Cannot restore non-archived project** | ✅ | `restore()` checks `project.status === "ARCHIVED"`, throws `ForbiddenException` |
| **Archive sets deletedAt** | ✅ | Ensures archived projects excluded from standard lists |
| **Restore clears deletedAt** | ✅ | Full reversal of archive |
| **ActivityLog always written** | ✅ | Archive/Restore/Upsert all write an ActivityLog entry |

### 3.7 Dependency security

| Check | Status | Rationale |
|---|---|---|
| **Known vulnerabilities** | ⚠️ Pre-existing | 37 vulnerabilities (1 low, 14 moderate, 20 high, 2 critical) — all pre-date P4.4 |
| **New dependencies** | ✅ None | No new npm packages added |

---

## 4. Summary

| Category | Introduced by P4.4 |
|---|---|
| **SQL Injection** | None |
| **XSS** | None |
| **Auth bypass** | None |
| **Data exposure** | None |
| **Input validation bypass** | None |
| **Business logic flaw** | None |
| **Dependency risk** | None |

---

## 5. Risk acceptance

1. **N+1 in `toResponse`** — Acceptable for paginated results (max 20 items) and the pre-existing pattern.
2. **No rate limiting on archive/restore** — Same as all other project endpoints. Acceptable at current scale.
3. **`contains` search (no full-text index)** — Acceptable for datasets < 10k projects.

---

## 6. Recommendations

1. Add rate limiting to project mutation endpoints when scaling beyond single-team usage.
2. Implement audit trail retention policy (ActivityLog cleanup for projects archived > 1 year).

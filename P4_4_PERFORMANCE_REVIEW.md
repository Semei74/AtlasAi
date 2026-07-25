# P4_4_PERFORMANCE_REVIEW.md

> **Performance Review for P4.4 — Project Lifecycle**
> Status: Completed
> P3 remains FROZEN per `ADR_P3_FREEZE.md`.

---

## 1. Review areas

### 1.1 Database query performance

#### `GET /projects` (paginated list)

```
Prisma.findMany({
  where: { organizationId, status?, workspaceId?, search? (OR name/description contains) },
  orderBy: { sortField: orderDir },
  skip,
  take: limit,
})
```

| Aspect | Analysis | Verdict |
|---|---|---|
| **Index utilization** | `organizationId` indexed. `status` indexed. `workspaceId` indexed. `createdAt` indexed. `updatedAt` indexed. | ✅ All filter/sort fields have individual B-tree indexes |
| **Composite index** | No composite `(organizationId, status, updatedAt DESC)` — PostgreSQL may combine individual indexes but with overhead | ⚠️ Consider adding composite for common query pattern |
| **Search performance** | `contains` + `mode: "insensitive"` uses `LIKE '%value%'` — cannot use B-tree index | ⚠️ Add `pg_trgm` GIN index for large datasets |
| **`count` + `findMany`** | Executed in parallel via `Promise.all` — only 2 queries total | ✅ |
| **Pagination offset** | Uses `skip`/`take` — for deep pages (page 1000), scanning many rows | ⚠️ Consider keyset pagination for very large datasets |
| **`deletedAt: null` filter** | `deletedAt` indexed — efficient | ✅ |

#### `GET /projects/:id` (detail)

```
Prisma.findUnique({
  where: { id },
  include: { workspace: { select: name }, owner: { select: displayName, avatarUrl } },
})
+
Prisma.findMany({
  where: { projectId: id },
  orderBy: { createdAt: desc },
  take: 20,
  include: { actor: { select: displayName } },
})
```

| Aspect | Analysis | Verdict |
|---|---|---|
| **N+1** | Zero N+1 — both queries join/load related data in single round-trips | ✅ |
| **Index on `projectId` in ActivityLog** | `projectId` indexed — efficient lookup | ✅ |
| **Limit on activity logs** | `take: 20` — prevents unbounded growth | ✅ |

#### `PATCH /projects/:id/archive`

```
Prisma.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } })
+
ActivityLog.create({ ... })
```

| Aspect | Analysis | Verdict |
|---|---|---|
| **Index on `id`** | Primary key — O(1) lookup | ✅ |
| **Atomicity** | Both operations in separate queries — no transaction wrapper | ⚠️ Acceptable (soft delete is reversible) |

#### `PATCH /projects/:id/restore`

```
Prisma.update({ where: { id }, data: { status: "ACTIVE", deletedAt: null } })
+
ActivityLog.create({ ... })
```

Same analysis as archive — both are O(1) single-row updates.

### 1.2 N+1 analysis

| Endpoint | Before P4.4 | After P4.4 |
|---|---|---|
| `GET /projects` | N+1 per project (20 queries for 20 items) | Same (`toResponse` pattern) |
| `GET /projects/:id` | N+1 on owner lookup | **Fixed** — single query with `include` |

The `toResponse` method is used by `findAllPaginated`, `findRecent`, `findById`, and all mutation responses. Each call does a separate `prisma.user.findUnique` to build the `ProjectOwnerDto`. For the paginated list (max 20 items), this means up to 20 extra queries. This is a **pre-existing architectural pattern** not introduced by P4.4.

### 1.3 Pagination overhead

```
Page 1:  SKIP 0  → scan 20 rows   (fast)
Page 10: SKIP 180 → scan 200 rows (fast)
Page 100: SKIP 1980 → scan 2000 rows (slower)
Page 1000: SKIP 19980 → scan 20000 rows (slow)
```

For datasets under 10,000 projects, offset pagination is acceptable. Beyond that, keyset (cursor) pagination should be implemented.

### 1.4 Frontend performance

| Aspect | Analysis | Verdict |
|---|---|---|
| **API calls** | Every filter/sort/page change triggers a new API call — no client-side caching of full dataset | ✅ Good — scales with data size |
| **React Query caching** | `queryKey: ["projects-paginated", params]` — unique cache entry per filter combination, automatic stale refetch | ✅ |
| **Mutation invalidation** | Archive/restore invalidates 5 query keys — ensures fresh data everywhere | ✅ |
| **Bundle size impact** | `/projects/[id]` page: 1.82 kB first load JS — minimal | ✅ |
| **Image/assets** | No images — only text and cards | ✅ |

### 1.5 Caching analysis

| Layer | Current state | Recommendation |
|---|---|---|
| **React Query** | Active — all queries cached with automatic invalidation | ✅ Adequate |
| **HTTP (CDN)** | None — all project endpoints require auth headers | ❌ Not applicable |
| **Redis** | Pre-existing Redis module exists but not used for project caching | ⚠️ Consider for high-traffic dashboard statistics |
| **Database query cache** | PostgreSQL buffer cache — implicit | ✅ Sufficient |

---

## 2. Query execution estimates

Based on indexed queries and typical PostgreSQL performance:

| Endpoint | Estimated time (100 projects) | Estimated time (10k projects) |
|---|---|---|
| `GET /projects` page 1 | < 5ms | < 10ms |
| `GET /projects` page 100 | < 5ms | < 50ms |
| `GET /projects/:id` | < 3ms | < 3ms |
| `PATCH /projects/:id/archive` | < 5ms | < 5ms |
| `PATCH /projects/:id/restore` | < 5ms | < 5ms |

---

## 3. Database schema indexes

Current indexes on `projects` table:
- `id` (PK)
- `workspaceId`
- `organizationId`
- `ownerId`
- `status`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `organizationId, deletedAt` (composite)

All filter/sort fields are individually covered.

### Recommended indexes for P4.5

1. **`(organizationId, status, updatedAt DESC)`** — Composite for the most common query pattern: "list my org's projects, filter by status, sorted by newest update"
2. **`pg_trgm` GIN index on `name` and `description`** — Enables fast `ILIKE '%search%'` for the search parameter

---

## 4. Summary

| Category | Rating |
|---|---|
| **Database queries** | ✅ Efficient — indexed, no N+1 in new code |
| **Search** | ⚠️ `contains` with `insensitive` is not indexable — needs `pg_trgm` at scale |
| **Pagination** | ✅ Offset pagination sufficient for current scale |
| **Frontend** | ✅ Minimal bundle impact, React Query caching active |
| **N+1** | ✅ Fixed in `findByIdWithDetails`. Pre-existing N+1 in `toResponse` remains |

---

## 5. Recommendations for P4.5

1. **Composite index** `(organizationId, status, updatedAt DESC)` — Single query improvement, no code changes.
2. **`pg_trgm` extension + GIN index** — Enables indexed full-text search via `ILIKE`.
3. **Keyset (cursor) pagination** — Replace `skip`/`take` with `cursor`/`take` for deep-page performance when dataset exceeds 10k projects.
4. **Batch-load owners in `findAll`** — Add `include: { owner: { select: ... } }` to the repository's `findAll` to eliminate N+1 in `toResponse`.
5. **Database transaction for archive/restore** — Wrap the status update + ActivityLog creation in a Prisma transaction for atomicity.

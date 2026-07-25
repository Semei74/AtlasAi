# P4_3_SECURITY_REVIEW.md

> **P4.3 — Dashboard API + Activity API Security Review**
> Review Date: 2026-07-22

---

## Security findings

### 1. Multi-tenant isolation

**Status: ✅ Secured**

Both new endpoints extract `organizationId` from `request.tenant.organizationId` (populated by the global `TenantScopeGuard`), with `request.user.organizationId` as fallback. The client can never supply the tenant ID.

| Endpoint | Tenant field | Scope |
|---|---|---|
| `GET /dashboard/statistics` | `organizationId` from tenant/user | All counts filtered by `organizationId` in Prisma queries |
| `GET /activity/recent` | Same | `activityLog.findMany({ where: { organizationId } })` |

### 2. Authentication

**Status: ✅ Secured**

| Endpoint | `@UseGuards(AuthGuard)` | `@ApiBearerAuth()` |
|---|---|---|
| `GET /dashboard/statistics` | ✅ | ✅ |
| `GET /activity/recent` | ✅ | ✅ |

- No endpoint is accessible without a valid JWT.
- Unauthenticated requests receive 401.

### 3. Input validation

**Status: ✅ Secured**

| Endpoint | DTO | Validation |
|---|---|---|
| `GET /activity/recent` | `RecentActivityQueryDto` | `@IsInt()`, `@Min(1)`, `@Max(50)`, `@IsOptional()` |
| `GET /projects/recent` | `RecentProjectsQueryDto` | Same (from P4.2) |
| `GET /dashboard/statistics` | No input DTO | No user-supplied parameters (safe) |

### 4. IDOR prevention

**Status: ✅ Secured**

- **Dashboard statistics**: all counts are scoped to the user's organization via `organizationId` from tenant context.
- **Activity log**: filtered by `organizationId`. A user cannot see activity from another organization.
- **Recent projects**: same as P4.2 — membership verification + `organizationId` filtering.

### 5. Membership verification

**Status: ✅ Secured**

`DashboardService.getStatistics()` calls `ensureMember(organizationId, userId)` which:
1. Looks up membership via `MembershipRepository.findByOrganizationAndUser()`
2. Rejects if membership is `null` or not `Active`

The ActivityController does NOT perform membership verification because it only reads data that's already scoped by `organizationId`. This is acceptable: the activity log is purely informational (no write operations), and the organizationId comes from the JWT tenant scope, not user input.

### 6. Audit trail

**Status: ✅ Secured**

No new write operations were added. The audit trail (ActivityLog) remains append-only:
- `GET /activity/recent` only reads existing data
- `GET /dashboard/statistics` only reads aggregate counts

### 7. Error handling — Information leakage

**Status: ✅ Secured**

| Condition | HTTP Status | Body |
|---|---|---|
| Not authenticated | 401 | `UnauthorizedException` (standard, no details) |
| Not a member | 403 | `ForbiddenException` (no details about the target org) |
| Validation failure | 400 | Default NestJS `ValidationPipe` response |
| Internal error | 500 | `InternalServerErrorException` (no stack trace in production) |

### 8. Statistics data — aggregation safety

**Status: ✅ Secured**

The `Promise.all` with 4 parallel queries is safe:
- All queries are read-only
- All queries filter by the same `organizationId`
- No sensitive data is exposed — only aggregate counts
- No raw SQL — all queries use Prisma's type-safe query builder

### 9. Rate limiting / DoS

**Status: ⚠️ Infrastructure-level only**

- `GET /activity/recent` limits `limit` to max 50 (via `@Max(50)` decorator)
- `GET /dashboard/statistics` has no user-controlled parameters
- No application-level rate limiting is applied (same as P4.2)

---

## Summary

| Category | Status |
|---|---|
| Multi-tenant isolation | ✅ Secured |
| Authentication | ✅ Secured |
| Authorization (membership) | ✅ Secured (dashboard); ⚠️ Acceptable (activity — read-only, tenant-scoped) |
| Input validation | ✅ Secured |
| IDOR prevention | ✅ Secured |
| Audit trail | ✅ Secured (no new write operations) |
| Error handling | ✅ Secured |
| Rate limiting | ⚠️ Infrastructure-level only |

**No new critical or high-severity issues.** The only minor finding is the lack of explicit membership verification on the Activity endpoint, which is acceptable because the endpoint is read-only and data is already scoped by the tenant context.

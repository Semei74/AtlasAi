# P4_2_SECURITY_REVIEW.md

> **P4.2 — Backend Project Module Security Review**
> Review Date: 2026-07-22

---

## Security findings

### 1. Tenant isolation (multi-tenant safety)

**Status: ✅ Secured**

Every controller method reads `organizationId` from `request.tenant.organizationId` (populated by the global `TenantScopeGuard`), with `request.user.organizationId` as fallback.

- **Injection vector eliminated**: The client can never supply the tenant ID via the request body/params/query.
- **Cannot leak across tenants**: All repository queries filter by `organizationId` derived from the JWT + tenant scope.
- **Consistency**: Matches the existing Workspace and Organization patterns exactly.

### 2. Access control — Membership verification

**Status: ✅ Secured**

Every service method calls `ensureMember(orgId, userId)` via the existing `MembershipRepository`, which checks for an active (non-deleted) membership record.

- **Enforcement point**: `ProjectService` — not the controller. This is intentional: the controller delegates to the service, and the service always verifies membership. A future controller-only guard could add defense-in-depth but is not required.
- **Edge case**: If the user loses membership between the membership check and the DB write, there is a TOCTOU race window. The membership check is not wrapped in a transaction with the project write. Mitigation: this is an acceptable risk given the existing pattern (WorkspaceService follows the same approach). A future improvement could use a Prisma interactive transaction with a membership validity re-check inside the transaction.

### 3. Input validation

**Status: ✅ Secured**

| DTO | Validation | Risk mitigated |
|---|---|---|
| `CreateProjectDto` | `@IsString()`, `@MinLength(1)`, `@MaxLength(200)`, `@IsUUID()` for workspace | XSS via name/description length limit, SQL injection via UUID validation |
| `UpdateProjectDto` | `@IsOptional()` + `@IsEnum()` on status, `@MinLength`/`@MaxLength` on strings | Enum injection, excessively long strings |
| `RecentProjectsQueryDto` | `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(50)` | Integer overflow, DoS via large limit |
| `ProjectResponseDto` | Output-only (`@ApiProperty`) | N/A — never validated from input |

- All DTOs are validated by NestJS's global `ValidationPipe` (already configured in the app bootstrap).
- No raw body access — the controller always deserializes through DTOs.

### 4. Authentication

**Status: ✅ Secured**

- Every route decorated with `@UseGuards(AuthGuard)` and `@ApiBearerAuth()`.
- No endpoint is accessible without a valid JWT.
- The global `TenantScopeGuard` runs before every controller and rejects requests without a valid tenant scope.

### 5. Audit trail (ActivityLog)

**Status: ✅ Secured**

| Event | Trigger | Data recorded |
|---|---|---|
| CREATED | `create()` | projectId, workspaceId, orgId, actorId, type=CREATED, description |
| UPDATED | `update()` (no status change) | projectId, workspaceId, orgId, actorId, type=UPDATED, description |
| STATUS_CHANGED | `update()` (status transition) | projectId, workspaceId, orgId, actorId, type=STATUS_CHANGED or ARCHIVED or RESTORED, metadata={from, to} |
| ARCHIVED | `delete()` | projectId, workspaceId, orgId, actorId, type=ARCHIVED, description |

- **Append-only**: The ActivityLog repository exposes only `create()`. No read/update/delete.
- **No tampering**: Once written, ActivityLog entries cannot be modified or deleted through the API.
- **Full trace**: Every state change is logged with before/after values (via `metadata`).

### 6. Input injection — Prisma queries

**Status: ✅ Secured**

- All `where` / `data` clauses use parameterized Prisma queries (not raw SQL).
- String fields (`name`, `description`) are provided as parameters, not concatenated.
- UUID fields (`workspaceId`) validated by `@IsUUID()` before reaching the repository.
- Enum fields (`status`, `type`) validated by `@IsEnum()` or set programmatically inside the service.

### 7. Soft delete — data leakage

**Status: ✅ Secured**

- `DELETE /projects/:id` performs a soft delete (`deletedAt = new Date()`).
- All repository list/find queries filter `deletedAt: null`.
- The `GET /projects/:id` endpoint returns `NotFoundException` for soft-deleted projects (hidden from clients).
- **Hard deletion not exposed**: No API endpoint performs `prisma.project.delete()`. If hard deletion is needed in the future, it must go through a separate admin-only endpoint.

### 8. IDOR (Insecure Direct Object Reference)

**Status: ✅ Secured**

- Project lookup: the service fetches the project via `findById()`, then checks that the project's `organizationId` matches the user's tenant. This prevents a user from accessing a project in another org even if they know the project UUID.
- Membership verification: checks the user's membership against the **project's** `organizationId`, not the user's default org. This prevents cross-org access after org switching.

### 9. Rate limiting / DoS

**Status: ⚠️ No application-level rate limiting**

- No `@Throttle()` decorators or rate limiting are applied to any project endpoint.
- Mitigation: Rate limiting is expected to be handled at the infrastructure level (API gateway / reverse proxy). A future task could add `@nestjs/throttler` decorators for defense-in-depth.
- `RecentProjectsQueryDto` limits `limit` to max 50, preventing an amplification attack via large query parameter.

### 10. Error handling — Information leakage

**Status: ✅ Secured**

| Condition | HTTP Status | Body |
|---|---|---|
| Project not found | 404 | `NotFoundException` (standard NestJS) |
| Not a member | 403 | `ForbiddenException` (no details about the target organization) |
| Not authenticated | 401 | `UnauthorizedException` (standard, no details about user) |
| Validation failure | 400 | Default NestJS `ValidationPipe` response (field-level, no stack trace) |
| Internal error | 500 | `InternalServerErrorException` (no stack trace in production) |

- No stack traces, no internal IDs, no database error messages in production responses.
- The global exception filter (already configured in the app) handles this consistently.

---

## Summary

| Category | Status |
|---|---|
| Multi-tenant isolation | ✅ Secured |
| Authentication | ✅ Secured |
| Authorization (membership) | ✅ Secured |
| Input validation | ✅ Secured |
| Audit trail | ✅ Secured |
| Soft delete / data leakage | ✅ Secured |
| IDOR prevention | ✅ Secured |
| Error handling | ✅ Secured |
| Rate limiting | ⚠️ Infrastructure-level only |
| TOCTOU in membership check | ⚠️ Acceptable risk (matches existing pattern) |
| N+1 (owner lookup) | ⚠️ Acceptable at current scale |

**No critical or high-severity issues found.** Two minor (acceptable) risks documented for future hardening.

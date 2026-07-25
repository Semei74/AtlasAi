# P3_3_IMPLEMENTATION.md

> P3-3 — Dashboard Backend Integration (Production Ready).
> Scope: `apps/web` (align to real backend contracts + add real `auth/me` hook).
> No backend code written; missing-endpoint requirements documented separately in
> `P3_3_BACKEND_REQUIREMENTS.md`.

## 1. What Was There (before P3-3)
P3-2 delivered the dashboard UI with: workspace/org/preferences query hooks, Zod
schemas, skeleton/empty/error states, and an `AuthGuard`. However:
- `dashboard-schemas.ts` **did not match the real backend DTOs** (e.g. preferences
  used `notifications` while the backend returns `emailNotifications`/`pushNotifications`;
  workspace/org schemas omitted real fields like `color`, `icon`, `organizationId`,
  `slug`, `ownerId`, `logoUrl`).
- `UserProfileCard` used only the auth-store `user` (no server profile fetch).
- `StatisticsCards` rendered a fake "Projects: —" placeholder card.
- No `auth/me` query hook existed, though `GET /auth/me` is a real backend endpoint.

## 2. Backend Analysis Findings
Verified against `services/backend` (controllers, services, DTOs, Prisma) and
`packages/api/src/generated.ts`:

**Endpoints that EXIST (with real response shapes):**
- `GET /workspaces` → `WorkspaceResponseDto[]` `{ id, organizationId, name, description, color, icon, createdAt, updatedAt }`
- `GET /organizations` → `OrganizationResponseDto[]` `{ id, name, slug, ownerId, logoUrl, createdAt, updatedAt }`
- `GET /users/preferences` → `{ theme, locale, emailNotifications, pushNotifications }`
- `GET /auth/me` → full profile `{ id, email, displayName, status, avatarUrl, bio, timezone, theme, locale, emailNotifications, pushNotifications, createdAt, updatedAt }`
- `GET /api/v1/prompts`, `GET /api/v1/knowledge/documents` (real, but distinct from "Projects")

**Endpoints that DO NOT EXIST (confirmed — no model/controller/service/DTO):**
- **Recent Projects** — no `Project` entity anywhere.
- **Recent Activity** — no activity/audit/event feed.
- **Dashboard Statistics** — no dedicated aggregation endpoint.

The generated OpenAPI client declares `content?: never` for all operations, so the
frontend continues to validate responses with **Zod** (the P3-1/P3-2 pattern),
reusing the existing `@atlas/api` client via `useApi()`.

## 3. What Was Implemented (frontend, real data only)
1. **`lib/dashboard-schemas.ts`** — realigned every schema to the verified backend
   DTOs: added `organizationId/color/icon` (workspace), `slug/ownerId/logoUrl`
   (organization), corrected preferences to `emailNotifications/pushNotifications`,
   and added `userProfileSchema` for `GET /auth/me`.
2. **`lib/queries.ts`** — added `useAuthMe()` (real `GET /auth/me`) reusing `useApi()`
   and the shared `QueryClient`. Existing `useWorkspaces`/`useOrganizations`/
   `useUserPreferences` unchanged.
3. **`components/dashboard/user-profile-card.tsx`** — now consumes `useAuthMe()`
   (server-authoritative) with a graceful fallback to the auth-store `user` for
   instant first paint; proper loading (spinner) and error (retry) states.
4. **`components/dashboard/statistics-cards.tsx`** — removed the fake "Projects"
   placeholder; now shows **real** metrics: Workspaces count, Organizations count,
   and Account status (from `useAuthMe`). All derived from live queries.
5. **`components/dashboard/header.tsx`** — added **cache invalidation** on logout
   (`useQueryClient().clear()`) before `logout()` + redirect, so no stale dashboard
   data survives a session change.
6. **Recent Projects / Recent Activity** — kept as **empty states** (no backend
   exists). No fake API, no mock data, per project rules.

Nothing in the existing architecture was changed: `@atlas/api` client reused (no new
client), `QueryClient` reused, `AuthStore` reused, `AuthGuard` reused.

## 4. Architectural Decisions
- **Match real contracts, don't invent.** Schemas were corrected to the actual
  backend DTOs rather than guessed. This eliminates silent data mismatches.
- **Server-authoritative profile.** `useAuthMe()` gives richer, fresher user data
  (bio, timezone, notification flags) than the login-time store snapshot; the store
  value is kept only as an instant fallback.
- **No fake statistics.** The placeholder card was deleted; only measurable, real
  counts are displayed.
- **Honest gaps.** Where the backend has no endpoint, the UI shows an empty state and
  the gap is specified in `P3_3_BACKEND_REQUIREMENTS.md` (with Prisma models, DTOs,
  services, and ready hook slots).
- **Cache hygiene.** Logout clears the React Query cache — prevents cross-session
  data leakage and stale reads.

## 5. Documentation References Used
- **NestJS**: controllers decorated with `@Controller`/`@Get`/`@UseGuards(AuthGuard)`
  + `@ApiBearerAuth`; DTOs via `ApiProperty`; services injected via `@Inject`.
  (Verified directly in `services/backend/src`.)
- **Prisma**: relation/scoping model (`Workspace.organizationId`, `Membership`,
  `User.prompts`); `@map` column naming; `Uuid`/`DateTime` types.
- **TanStack Query v5**: `useQuery({ queryKey, queryFn })`, `UseQueryResult<T>`,
  `useQueryClient().clear()` for invalidation; retry/staleTime from existing
  `queryClientOptions`.
- **OpenAPI Fetch (`openapi-fetch`)**: `client.GET(path)` → `{ data, error, response }`;
  status via `response.response.ok`; bodies validated with Zod.
- **Zod v3**: `z.object`/`z.enum`/`z.array`; `.parse()` fail-closed.
- **Next.js 15 / React 19**: client components, `useRouter`, `AuthGuard` wrapper.
- **Sentry/PostHog** (via `@atlas/observability`): `captureError` in boundaries,
  `trackEvent` for logout/workspace selection.
- *Context7 unavailable (quota exhausted, no API key) — used verified repo source +
  stable official APIs.*

## 6. Validation — Gates
- `pnpm lint` (web) — **PASS** (`eslint . --max-warnings 0`)
- `pnpm typecheck` (web) — **PASS** (`tsc --noEmit`)
- `pnpm build` (web) — **PASS** (8/8 routes; pre-existing Sentry/OpenTelemetry
  webpack "critical dependency" warnings, unrelated to changes)

## 7. Security Review (P3-3 changes)
- **XSS** — PASS. All data rendered as React text nodes (auto-escaped). No
  `dangerouslySetInnerHTML`. Backend strings (names, slugs) are plain text.
- **Authentication / Authorization** — PASS. Every query uses `useApi()` which injects
  the `Authorization: Bearer` token from `AuthGuard`-authenticated store. The
  protected route is still gated by `AuthGuard`.
- **RBAC / Broken Access Control** — PASS (client layer). Server-side tenant/role
  scoping is enforced by NestJS `AuthGuard` + `AuthorizationService` (backend
  responsibility; not regressed).
- **Sensitive Data Exposure** — PASS. No secrets/tokens rendered. Preferences show
  only theme/locale/notification booleans. Profile shows no credential fields.
- **Token leakage** — PASS. Tokens stay in the auth store / `localStorage`
  (inherited model, see P3-1 review); never logged or placed in URLs.
- **Query Injection** — PASS. No raw SQL on the client; all queries are typed
  `GET`s with Zod-validated responses. No user input reaches query strings (no
  filter params used yet).
- **Open Redirect / CSRF** — PASS. Logout redirects to constant `/auth/login`;
  Bearer-token auth (CSRF N/A).
- **SSR / Hydration safety** — PASS. All dashboard components are Client Components
  (`"use client"`); `useLocalStorage` guards `typeof window`. `AuthGuard` renders
  `null` while restoring, avoiding hydration mismatch of protected content.
- **Code Review** — PASS. No `any`, no `ts-ignore`, no `eslint-disable`, no
  `console.log`, no `debugger`, no `TODO`/`FIXME`/`HACK`. Small, single-purpose
  functions; hooks colocated in `lib/queries.ts`.
- **Anti-pattern scan**: ZERO forbidden patterns in changed files.

## 8. Dependency Review (`pnpm audit`)
- **25 vulnerabilities** in the workspace, **all dev/build/observability transitive**
  (node-tar, xmldom, tar, postcss-via-next, esbuild-via-sentry, @hono, @fastify,
  uuid-via-sentry, OpenTelemetry). **No new advisories introduced by P3-3.**
- Frontend runtime deps touched in P3-3 (`@tanstack/react-query`, `zustand`,
  `react-hook-form`, `zod`, `tamagui`, `@atlas/api`, `@atlas/auth`,
  `@atlas/observability`) are **clean (0 advisories)**.

## 9. Architecture Review
- **TurboRepo integrity** — PASS. Changes confined to `apps/web` (plus the earlier
  `@atlas/observability` barrel export addition). No new packages, no affected build
  graph edges beyond intended.
- **Circular dependencies** — PASS. `apps/web` → `@atlas/{api,auth,hooks,ui,
  observability}` (one-directional, unchanged).
- **No duplication** — PASS. Reused `useApi()`, `QueryClient`, `AuthStore`,
  `AuthGuard`, `captureError`, `trackEvent`. No copy-pasted logic.
- **Existing API layer used** — PASS (no new client).
- **Existing Auth layer used** — PASS.
- **Existing Query layer used** — PASS.

## 10. Known Limitations
- **Recent Projects / Recent Activity** have no backend support → empty states
  (documented in `P3_3_BACKEND_REQUIREMENTS.md` with full backend spec).
- **Dashboard Statistics** shows derived real counts; a dedicated `/statistics`
  endpoint is optional and specified.
- **`@atlas/api` generated DTOs missing** — responses validated via Zod; regenerating
  the client from an updated OpenAPI spec is recommended (separate task).
- **Client-side route guard only** — server-side enforcement relies on backend
  authorized APIs; optional `middleware.ts` (httpOnly cookies) is a future task.

## 11. Recommendations (now owned by P4 — see ADR_P3_FREEZE.md)
> **P3 is FROZEN** pending the new Project domain. The Dashboard Backend API work
> below now proceeds under **P4** (P4.1 Project Domain → P4.2 Backend API →
> P4.3 OpenAPI → P4.4 packages/api → P4.5 Dashboard Integration), after which P3
> automatically thaws. See `ADR_P3_FREEZE.md` and `PROJECT_ROADMAP.md`.
1. Implement backend `Project` model + `ProjectService`/`ProjectController`
   (`GET /projects`), then add `useRecentProjects()` + wire `RecentProjects`.
2. Implement backend `Activity` model + `ActivityService`/`ActivityController`
   (`GET /activity`), then add `useRecentActivity()` + wire `RecentActivity`.
3. (Optional) Implement `GET /statistics` aggregation; switch `StatisticsCards` to it.
4. Regenerate `packages/api/src/generated.ts` from the corrected OpenAPI spec to
   replace the Zod parse layer with typed responses.
5. Add automated tests: Vitest for `lib/queries.ts`/`dashboard-schemas.ts` (mock the
   `@atlas/api` client) and Playwright e2e for login → dashboard → logout.
6. Consider a server-side `middleware.ts` (httpOnly cookie auth) for hard route
   protection + CSRF coverage if cookie sessions are adopted.

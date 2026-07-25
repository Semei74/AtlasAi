# P3_2_IMPLEMENTATION.md

> P3-2 — Production-Ready Dashboard. Implementation report.
> Scope: `apps/web` (new dashboard) + minor export addition in `@atlas/observability`.
> No new API client was created — the existing `@atlas/api` package is reused.

## 1. What Was There
- `apps/web/app/dashboard/page.tsx` was a minimal placeholder: a single `AuthGuard`-wrapped
  card showing the user's name/email and a logout button. No layout, sidebar, header,
  data fetching, skeletons, error boundaries, or empty states.
- No `components/` directory existed in `apps/web`.
- `@atlas/api` generated client (`packages/api/src/generated.ts`) declares
  `requestBody?: never` and `content?: never` for **all** endpoints — i.e. no request
  or response DTOs are typed. `auth-api.ts` (P3-1) already established the pattern of
  using the client for transport and validating responses with Zod.

## 2. What Was Changed

### Reused (not modified unless noted)
- `@atlas/api` `createClient` — reused as the single HTTP/transport layer.
- `@atlas/auth` `useAuthStore`, `AuthGuard`, `logout` — reused for session + guard.
- `@atlas/hooks` `QueryProvider` (TanStack Query, already in `layout.tsx`).
- `@atlas/ui` primitives (`Stack`, `Card`, `Button`, `Text`, `Heading`, `Avatar`,
  `Spinner`, `Divider`/`Surface` available).
- `@atlas/observability` `trackEvent`, `captureError` — reused for telemetry/error capture.

### Modified package
- `packages/observability/src/index.ts` — **added exports** `captureError`,
  `setSentryUser`, `identifyUser`, `resetIdentity` (all already implemented in
  `sentry.ts`/`analytics.ts`; only the public barrel was missing them). This lets the
  dashboard ErrorBoundary report crashes to Sentry without importing internals.

### New files (`apps/web`)
- `lib/api.ts` — `useApi()` returns the `@atlas/api` `createClient` instance bound to
  the auth store (`getAccessToken` reads `useAuthStore.accessToken`; `onAuthError`
  calls `logout`). This is the existing API layer, shared across the app.
- `lib/dashboard-schemas.ts` — Zod schemas for `Workspace`, `Organization`,
  `UserPreferences` + list envelopes + `parse*` helpers (fail-closed validation).
- `lib/queries.ts` — `useWorkspaces()`, `useOrganizations()`, `useUserPreferences()`
  React Query v5 hooks (`useQuery`). Each calls `api.GET(...)`, checks
  `response.response.ok`, and parses the `unknown` body with Zod.
- `lib/use-local-storage.ts` — SSR-safe persisted-state hook (used by the workspace
  switcher to remember the selected workspace).
- `components/dashboard/`:
  - `dashboard-layout.tsx` — `DashboardLayout` (sidebar + header + scrollable content).
  - `sidebar.tsx` — nav (Dashboard / Workspaces / Activity / Settings).
  - `header.tsx` — title + user chip + logout (`useMutation` → `logoutRequest` →
    `logout` → redirect).
  - `user-profile-card.tsx` — reads `useAuthStore.user` (typed) + `useUserPreferences`.
  - `workspace-switcher.tsx` — `useWorkspaces()` + persisted selection (`trackEvent`).
  - `statistics-cards.tsx` — real counts (workspaces, organizations) from queries.
  - `recent-sections.tsx` — `RecentProjects` / `RecentActivity` (empty states — see
    Limitations).
  - `states.tsx` — reusable `EmptyState` / `ErrorState`.
  - `skeletons.tsx` — `DashboardSkeleton`, card/statistic skeletons.
  - `error-boundary.tsx` — `ErrorBoundary` class component (reports via `captureError`).
- `app/dashboard/page.tsx` — full dashboard: `AuthGuard` → `DashboardLayout` →
  `DashboardContent` (skeleton while pending, then `ErrorBoundary` + all sections).

## 3. Architectural Decisions
1. **Reuse `@atlas/api`, do not create a new client.** `useApi()` wraps the existing
   `createClient` with auth-store binding — identical to the P3-1 pattern. All data
   flows through this single client.
2. **Zod-validated responses.** Because the generated client has no DTOs, every
   `GET` response is parsed with a Zod schema (`parseWorkspaces` etc.). Fail-closed:
   a malformed payload throws and surfaces as an `ErrorState` with retry.
3. **TanStack Query v5** for caching/retries (project `queryClientOptions`:
   `staleTime 30s`, `retry 2`). Hooks are colocated in `lib/queries.ts` and consumed
   by presentational components — separation of data vs UI.
4. **No fake APIs.** Backend exposes `/workspaces`, `/organizations`, `/users/preferences`
   (GET). There are **no** Projects/Activity/Statistics endpoints in the spec, so those
   sections render honest **empty states** (ready to populate) while Statistics shows
   the two real counts. No invented endpoints, no mock data.
5. **Error handling layered:** (a) query-level `ErrorState` + retry; (b) render-level
   `ErrorBoundary` capturing to Sentry; (c) `AuthGuard` for route protection.
6. **Telemetry:** `trackEvent("workspace_selected")` and `trackEvent("user_logged_out")`
   reuse `@atlas/observability`. No PII in event properties (only ids).
7. **Responsive:** flex row layout collapses via `flexWrap="wrap"` + `minWidth` on
   panels (sidebar kept simple/always-visible to avoid media-query typing pitfalls).
8. Minor `@atlas/observability` barrel export addition (no logic change) to expose
   `captureError` for the boundary.

## 4. Documentation References Used
- **Next.js 15 (App Router, RSC/client)**: client components with `"use client"`;
  `redirect`/`useRouter` for navigation; Server Component root layout keeps providers
  (Tamagui/Query/PostHog) — unchanged.
- **React 19**: function components, hooks; `ErrorBoundary` as a class component
  (`getDerivedStateFromError`/`componentDidCatch`) — the supported error-boundary API.
- **TanStack Query v5**: `useQuery({ queryKey, queryFn })`, typed `UseQueryResult<T>`,
  retry/staleTime from the existing `queryClientOptions`.
- **Zustand v5**: `useAuthStore((s) => s.user)` selector usage (no new store created;
  existing `@atlas/auth` store reused).
- **Tamagui**: `Stack` (orientation), `Card`, `Button`, `Text`, `Heading` (level),
  `Avatar` (circular), `Spinner`; `color="$token"` theming (no invalid `theme=` strings).
- **OpenAPI Fetch (`openapi-fetch`)**: `client.GET(path)` returns `{ data, error, response }`;
  `response.response.ok` used for status checks since `error` is untyped (`never`).
- **Sentry (`@atlas/observability` `captureError`)**: error boundaries must report via
  `Sentry.captureException` — used instead of `console.error`.

(Note: `context7` MCP was unavailable — quota exhausted, no API key — so stable,
already-audited library APIs were used and verified against the repository source.)

## 5. Validation Performed — Gates
- `pnpm --filter @atlas/web typecheck` — **PASS**
- `pnpm --filter @atlas/web lint` — **PASS** (`--max-warnings 0`)
- `pnpm --filter @atlas/web build` — **PASS** (8/8 routes generated; pre-existing
  Sentry/OpenTelemetry webpack "critical dependency" warnings, unrelated to changes)

## 6. Security Review (Dashboard changes)
Method: OWASP ASVS v4.0.3 + OWASP Top 10 (2021), static review of the committed diff.

- **XSS** — PASS. All data rendered as React text nodes (auto-escaped). No
  `dangerouslySetInnerHTML`. User/workspace/org strings are plain text.
- **Access Control / Protected routes** — PASS. `app/dashboard/page.tsx` wrapped in
  `AuthGuard`; renders `fallback` when unauthenticated; returns `null` while restoring.
- **Token handling** — PASS. `useApi()` reuses the `@atlas/api` client; token injected
  per-request from store; `onAuthError` → `logout` clears tokens. No token in URL/DOM.
- **Input validation** — PASS. Responses Zod-validated before use; workspace selection
  persisted as a plain id string (no eval/JSON-exec).
- **Error leakage** — PASS. Queries throw generic "Failed to load …" messages; no stack
  traces/ internals surfaced. `ErrorBoundary` reports to Sentry (not to UI).
- **Auth header / CSRF** — PASS (Bearer token, same as P3-1; CSRF N/A).
- **LocalStorage** — INHERITED risk (workspace id only; benign, no secrets). Refresh
  token storage risk is owned by `@atlas/auth` (see P3-1 review).
- **Redirect safety / Open Redirect** — PASS. Logout redirects to constant
  `/auth/login`; no user-controlled redirect target.
- **Anti-pattern scan** — ZERO `any` / `ts-ignore` / `eslint-disable` / `console.log` /
  `debugger` / `TODO` / `FIXME` / `HACK` in code.

**Dependencies (`pnpm audit`)**: 25 workspace advisories, **all dev/build/observability
transitive** (node-tar, xmldom, postcss-via-next, esbuild-via-sentry, etc.). Runtime
dashboard deps (`@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `tamagui`)
are **clean (0 advisories)**. No new vulnerabilities introduced by P3-2.

## 7. Known Limitations
- **No Projects/Activity API**: backend spec lacks `/projects` and `/activity`
  endpoints, so `RecentProjects`/`RecentActivity` render empty states. Real data
  requires backend work (see Recommendations).
- **Statistics**: only Workspace/Organization counts are real; the "Projects" stat is a
  placeholder ("—") until the Projects API exists.
- **`@atlas/api` generated DTOs missing** for all endpoints — responses validated via
  Zod in `lib/dashboard-schemas.ts`. Regenerating the client from a corrected OpenAPI
  spec is a separate, recommended task.
- **Client-side route guard only**: true confidentiality of dashboard HTML requires
  server-side enforcement (backend authorized APIs + optional `middleware.ts`).
- **`@atlas/observability` barrel change**: added exports (no logic) — a minor cross-
  package edit, needed to expose `captureError` for the boundary.

## 8. Recommendations for P3-3
1. Backend: implement `/projects` (list/recent) and `/activity` (feed) GET endpoints;
   add their Zod schemas + query hooks and wire into `RecentProjects`/`RecentActivity`.
2. Backend: add a `/statistics` (or derive server-side) endpoint for real dashboard
   metrics; replace the placeholder statistic.
3. Regenerate `@atlas/api` OpenAPI client from a corrected spec to replace the Zod
   parse layer with typed responses.
4. Add a server-side `middleware.ts` (httpOnly cookie auth) for hard route protection
   + CSRF coverage if cookie sessions are adopted.
5. Add automated tests: Vitest for `lib/queries.ts`/`dashboard-schemas.ts` (mock the
   `@atlas/api` client) and Playwright e2e for login → dashboard → logout flow.
6. Persist selected workspace server-side (user preference) instead of `localStorage`
   once the preferences API supports it.

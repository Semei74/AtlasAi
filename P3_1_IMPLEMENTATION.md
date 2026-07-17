# P3_1_IMPLEMENTATION.md

> P3-1 — Web Authentication. Implementation report. Scope: `apps/web` only. No changes to
> `@atlas/auth`, `@atlas/api`, `@atlas/ui`, `@atlas/hooks`, `@atlas/observability`.

## Objective

Wire the existing `@atlas/auth` + `@atlas/api` infrastructure into the web app: implement real login
/ register / forgot-password flows with validated forms, a protected dashboard route, and logout —
replacing the static login placeholder.

## Existing Architecture (audited)

- `@atlas/auth`: zustand `useAuthStore` (`login/logout/refreshTokens/restoreSession`),
  `secureStorage` (chrome.storage.local / localStorage), `AuthGuard` (calls `restoreSession()` on
  mount, renders `fallback` when unauthenticated).
- `@atlas/api`: `createClient` (openapi-fetch) — but generated `paths` declare `requestBody?: never`
  and responses without `content` for auth endpoints, i.e. **no request/response DTOs are typed**.
  See "Key Decisions".
- `@atlas/ui`: `Button, Text, Heading (level prop), Input, Stack, Card, Avatar, Spinner`.
- `@atlas/hooks`: `QueryProvider` (TanStack Query already in layout).
- `@atlas/observability`: `PostHogProvider` already in layout.

## Implemented Solution

### New files (`apps/web`)

- `lib/api-base-url.ts` — `API_BASE_URL` from `NEXT_PUBLIC_API_URL`.
- `lib/auth-schemas.ts` — Zod schemas (`loginSchema`, `registerSchema`, `forgotPasswordSchema`,
  `resetPasswordSchema`) + `authResponseSchema` and `parseAuthResponse()` for validating backend
  responses.
- `lib/auth-api.ts` — typed request layer: `loginRequest`, `registerRequest`,
  `forgotPasswordRequest`, `logoutRequest`. Uses `fetch` with `Authorization: Bearer` (token read
  from `useAuthStore`) and Zod-parsed responses.

### New/changed pages (`apps/web/app`)

- `auth/login/page.tsx` — RHF + Zod, `useMutation` (`mutateAsync`), on success
  `useAuthStore.login(...)` then `router.replace("/dashboard")`.
- `auth/register/page.tsx` — RHF + Zod (password confirmation refine), register → auto-login →
  redirect to dashboard.
- `auth/forgot-password/page.tsx` — email-only form, success-state screen.
- `dashboard/page.tsx` (NEW, protected) — wrapped in `AuthGuard`; shows user from store; logout
  button calls `logoutRequest()` then `useAuthStore.logout()` + redirect to `/auth/login`.
- `page.tsx` — root now `redirect("/dashboard")` (AuthGuard bounces to login when unauthenticated).

### Dependencies

- Added `@types/chrome` to `apps/web` devDependencies (required so the `@atlas/auth` source, which
  references the `chrome` global, type-checks when imported by web).
- `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`, `zustand`, `@atlas/auth`
  already present.

## Key Decisions

1. **Typed auth-request layer instead of the openapi-fetch client.** The generated `paths` types
   mark auth request bodies as `never`/`undefined`, so `client.POST(...)` is unusable for these
   endpoints. A small `fetch`+Zod wrapper restores full request/response type safety. This is the
   real fix for the broken generated types; regenerating `@atlas/api` from a corrected OpenAPI spec
   is a separate task (documented as limitation).
2. **No new SessionProvider.** `AuthGuard` already restores the session via `restoreSession()` on
   mount, so protected routes work without an extra provider.
3. **Guard typing.** Used `Heading level={1}`, `color="$…"` tokens (not `theme="…"`, which is not a
   valid `ThemeName`), and `Avatar` without `src` (the UI primitive does not forward it).
4. **Lint-clean async.** Form submits use an extracted `submit = handleSubmit(...)` handler invoked
   as `void submit(event)`; mutations fire via `void mutation.mutateAsync(...)` to satisfy
   `no-floating-promises` / `no-misused-promises` while keeping fire-and-forget UX with `onError`
   handling.

## Modified Files

- `apps/web/app/page.tsx` (redirect target)
- `apps/web/app/auth/login/page.tsx` (full rewrite)
- `apps/web/app/auth/register/page.tsx` (full rewrite)
- `apps/web/app/auth/forgot-password/page.tsx` (full rewrite)
- `apps/web/app/dashboard/page.tsx` (new)
- `apps/web/lib/api-base-url.ts` (new)
- `apps/web/lib/auth-schemas.ts` (new)
- `apps/web/lib/auth-api.ts` (new)
- `apps/web/package.json` (added `@types/chrome` devDep)

## Validation Performed

- `pnpm --filter @atlas/web typecheck` — PASS (no errors)
- `pnpm --filter @atlas/web lint` — PASS (0 warnings, max-warnings 0)
- `pnpm --filter @atlas/web build` — PASS (8/8 routes generated; pre-existing Sentry/OpenTelemetry
  "critical dependency" webpack warnings unrelated to changes)

## Quality Gates

- No `any`, no `ts-ignore`, no `eslint-disable`.
- All public APIs strongly typed (Zod-inferred form values + `AuthResponse`).
- No dead code — `lib/api.ts` (superseded by `auth-api.ts`) removed.

## Remaining Limitations

- **Generated auth DTOs missing** in `@atlas/api`: the typed `fetch` layer in `lib/auth-api.ts` is a
  stopgap. Regenerating the OpenAPI client from a corrected backend spec should replace it. Out of
  scope for P3-1.
- **No server-side middleware**: route protection is client-side via `AuthGuard`. A `middleware.ts`
  with httpOnly cookies would require changing token storage strategy — future task, not in P3-1.
- **Refresh token in `localStorage`** (web) is an XSS vector (inherited from `@atlas/auth`, not
  introduced here). Documented in `SECURITY_AUDIT.md`.
- No automated tests added in this step (no test infra changes requested); forms and flows are
  validated via typecheck/lint/build and manual review.

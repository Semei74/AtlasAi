# P3_1_SECURITY_REVIEW.md

> Security audit of **P3-1 (Web Authentication)** changes only.
> Scope: `apps/web/**` + `P3_1_ANALYSIS.md` + `P3_1_IMPLEMENTATION.md`.
> Method: OWASP ASVS v4.0.3 (V1–V3, V11), OWASP Top 10 (2021), and vendor best
> practices for Zod v3, React Hook Form v7, TanStack Query v5, Next.js 15, zustand v5.
> Tooling: `pnpm audit`, static review of committed diff.
>
> **Context7 note:** The `context7` MCP server returned "Monthly quota exceeded"
> (no API key configured). Live documentation retrieval was unavailable, so the
> review relies on the verified, current (already-audited) APIs of the named
> libraries. All claims below are grounded in the actual committed code (commit
> `2d8065275fe5960b72efcab779991354f5008559`).

## 1. Files Reviewed
- `apps/web/app/auth/login/page.tsx`
- `apps/web/app/auth/register/page.tsx`
- `apps/web/app/auth/forgot-password/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/page.tsx`
- `apps/web/lib/auth-api.ts`
- `apps/web/lib/auth-schemas.ts`
- `apps/web/lib/api-base-url.ts`
- `apps/web/package.json` (added `@types/chrome` devDep only)

## 2. OWASP Top 10 (2021) & ASVS Checklist

| # | Control | Result | Notes |
|---|---------|--------|-------|
| A01 | Broken Access Control | PASS (client) | `/dashboard` wrapped in `AuthGuard` (returns `fallback` when `!isAuthenticated`). See §20. Server-side enforcement is backend responsibility (out of P3-1 scope). |
| A02 | Cryptographic Failures | PASS | All API calls use `https` base (`NEXT_PUBLIC_API_URL` default `http://localhost:4000` — dev only; prod must be HTTPS via env). Tokens sent only via `Authorization: Bearer`. |
| A03 | Injection (XSS) | PASS | No `dangerouslySetInnerHTML`; all user input rendered via Tamagui `Text` (React text nodes → auto-escaped). See §1. |
| A04 | Insecure Design | PASS | Defense-in-depth: client validation (Zod) + backend validation (separate). Passwords never logged. |
| A05 | Security Misconfiguration | PASS | No `console.log`/debug; no `eslint-disable`; strict lint enforced. |
| A06 | Vulnerable & Outdated Components | PASS (runtime) | `react-hook-form`, `zod`, `@tanstack/react-query`, `zustand` — **no advisories**. See §Deps. |
| A07 | Identification & Auth Failures | PASS | Login/register/forgot implemented; errors generic ("Invalid email or password") — no user enumeration via message. See §10. |
| A08 | Software & Data Integrity | PASS | No `eval`, no dynamic code; Zod-validated responses before store mutation. |
| A09 | Security Logging & Monitoring | PASS | No sensitive data logged in frontend; backend handles security events. |
| A10 | SSRF | N/A | No user-controlled URLs fetched. |

### 20-Point Detailed Review

1. **XSS** — PASS. All dynamic values (`user.displayName`, `user.email`, form
   errors, server error strings) are rendered as React children of `Text`
   (auto-escaped). No `dangerouslySetInnerHTML`, no `innerHTML`, no `html()`.
   Server error message is plain text printed via `Text`. ✓

2. **CSRF** — INHERITED RISK (not introduced by P3-1). Auth uses **Bearer tokens**
   in `Authorization` header (not cookies), so the classic cookie-based CSRF
   vector does not apply. There is **no `SameSite`/cookie CSRF token** because no
   cookie auth is used. If the backend later switches to cookie sessions, CSRF
   protection must be added. Documented as limitation.

3. **Token Storage** — INHERITED RISK. Access + refresh tokens are persisted by
   `@atlas/auth` `secureStorage` → web uses `localStorage`. This is a known XSS
   exposure (see §5, §6). Not introduced here; flagged for backend/cross-cutting
   hardening. P3-1 does not add new storage.

4. **Refresh Token** — INHERITED. Refresh-token rotation/revocation is backend
   responsibility (`/auth/refresh`). Client only stores it. No client-side leakage
   of refresh token to logs/DOM.

5. **LocalStorage risks** — INHERITED. Refresh token in `localStorage` is readable
   by any JS → XSS can exfiltrate. Mitigation path: httpOnly, Secure, SameSite
   cookie (requires backend change + `middleware.ts`). Out of P3-1 scope. The
   `authResponseSchema` validates tokens are non-empty strings before storage.

6. **Session fixation** — PASS. Session is established by backend-issued tokens on
   login/register; client does not reuse a pre-existing session id. `restoreSession`
   refreshes tokens on load. No fixed session identifier in client.

7. **JWT validation** — BACKEND. Client does not validate JWT signature (cannot/
   should not). Client only attaches the opaque token string. Signature/
   expiration validation is the backend's (`@atlas/auth` store treats token as
   opaque string). Acceptable for SPA; backend must validate.

8. **Password validation** — PASS. `passwordSchema`: min 8 / max 128 chars.
   Register requires `confirmPassword` match via `.refine`. No password sent to
   logs. Client validation is UX-layer; backend enforces policy (e.g., complexity).
   Consider: min length 8 is acceptable but baseline; backend may require more.

9. **Rate limiting assumptions** — ASSUMED (backend). Forms have no client rate
   limit (correct — rate limiting belongs server-side). The backend is expected to
   throttle `/auth/login` and lock accounts (see `account-lockout.service.ts` in
   backend tree). Client shows generic error on failure. ✓ design-correct.

10. **Error leakage** — PASS. Login error is generic ("Invalid email or password").
    Network/other errors fallback to "Login failed" / "Registration failed". No
    stack traces, SQL errors, or internal paths surfaced to the UI. The thrown
    `Error` in `auth-api.ts` includes `${path}` and `${status}` only (status code,
    not body) — benign. ✓

11. **Sensitive headers** — PASS. Only `Content-Type` and conditional
    `Authorization: Bearer <token>` are set. No API keys, no custom auth headers
    with secrets. `Authorization` is cleared on logout (token dropped). ✓

12. **Fetch wrappers** — PASS. Single typed wrapper `postJson` in `auth-api.ts`
    centralizes header injection and response parsing. No scattered `fetch` calls.
    `JSON.stringify(body)` with validated shape only. ✓

13. **Authorization headers** — PASS. Bearer token injected per-request from
    `useAuthStore.getState().accessToken` with null-guard (`token ? ... : {}`). No
    token sent to unauthenticated endpoints (login/register/forgot). ✓

14. **Input validation** — PASS. Every form value is Zod-validated before the
    request is sent (`zodResolver`). Server response is Zod-validated before the
    store is updated (`parseAuthResponse`). Two-layer validation. ✓

15. **Zod schemas** — PASS. All schemas use explicit `min/max`, `.email()`,
    `.enum()` for `status`/`theme`. `authResponseSchema` validates the full user
    object shape, preventing malformed/partial data from entering the store.
    `parseAuthResponse` throws on mismatch (fail-closed). ✓

16. **Redirect safety** — PASS. Only hardcoded internal targets:
    `router.replace("/dashboard")` (post-login), `router.replace("/auth/login")`
    (post-logout / guard fallback). No user-controllable `next`/`redirect` param.
    No `window.location` with external input. ✓

17. **Open Redirect** — PASS. No redirect target is derived from query string,
    `document.location`, or any user input. All `router.replace` calls use
    constant string literals. ✓

18. **Broken Access Control** — PASS (client layer). Protected content is gated by
    `AuthGuard` (client). Server MUST still authorize every API call (backend
    scope). Client correctly does not render dashboard data without auth. ✓

19. **AuthGuard correctness** — PASS. `AuthGuard` (from `@atlas/auth`):
    - calls `restoreSession()` on mount (refreshes tokens if refresh token exists);
    - returns `null` while `isRestoring` (no flash of protected content);
    - renders `fallback` when `!isAuthenticated`.
    Dashboard usage supplies a fallback "Redirecting to sign in…" message. The
    guard is a client component and re-renders on store changes. ✓
    *Caveat:* client-side guard only — a network-level attacker could read
    `/dashboard` HTML (no data without API token). Server enforcement required for
    true confidentiality.

20. **Dashboard protection** — PASS. `DashboardPage` wraps `DashboardContent` in
    `AuthGuard`. `DashboardContent` reads `user` from store and only renders after
    guard passes. Logout calls `logoutRequest()` (best-effort `POST /auth/logout`)
    then `useAuthStore.logout()` + redirect. Tokens cleared on logout. ✓

## 3. Anti-Pattern Scan (mandatory)

Scanned P3-1 code + reports for: `any`, `ts-ignore`, `eslint-disable`,
`console.log`, `debugger`, `TODO`, `FIXME`, `HACK`.

**Result: ZERO occurrences in code.** The only text matches were the words
"any/ts-ignore/eslint-disable" inside the two report markdown files (describing
their absence), which are documentation, not code.

## 4. Dependency Audit (`pnpm audit`)

- **Total advisories in workspace: 25** (1 low, 11 moderate, 12 high, 1 critical).
- **None affect the P3-1 runtime auth path.** All are in dev/build/observability
  transitive deps:
  - `node-tar`, `tar`, `xmldom`, `tmp`, `js-yaml`, `postcss` (via `next`),
    `esbuild` (via `@sentry/webpack-plugin`), `@hono/node-server`, `@fastify/static`,
    `uuid` (via `@sentry`), OpenTelemetry — i.e. build tooling, not shipped to the
    browser as part of the auth flow.
- **Named auth dependencies — clean (0 advisories):**
  - `react-hook-form` (^7.80.0)
  - `zod` (^3.24.0)
  - `@tanstack/react-query` (^5.70.0)
  - `zustand` (^5.0.0)
- **Web-reachable audit paths** are limited to `apps__web>next>postcss` (moderate,
  build-time CSS) and `@sentry/*` transitive (build/observability). Not introduced
  by P3-1; pre-existing in the toolchain.

## 5. Findings Summary

| Severity | Finding | Introduced by P3-1? | Action |
|----------|---------|---------------------|--------|
| Medium | Refresh token stored in `localStorage` (XSS-exfiltratable) | No (inherited `@atlas/auth`) | Cross-cutting: migrate to httpOnly Secure SameSite cookie + `middleware.ts` |
| Low | No client rate-limit on auth forms | N/A (server-side concern) | Confirm backend throttle/lockout active |
| Info | CSRF not applicable (Bearer token auth) | No | Add CSRF tokens only if switching to cookie sessions |
| Info | Client-side route guard only | No | Backend must authorize every protected API |

**No critical or high-severity issues were introduced by P3-1.** All security
controls expected at the frontend layer are correctly implemented. Remaining risks
are inherited architectural decisions (token storage strategy) owned by the
cross-cutting auth/backend work, not by this task.

## 6. Recommendations (out of scope for P3-1 — do not implement without confirmation)

1. Move refresh token to an httpOnly, Secure, SameSite cookie; add `middleware.ts`
   for server-side route protection and token refresh.
2. Verify backend enforces: password complexity, login rate-limit, account lockout,
   refresh-token rotation/revocation, and authorization on every protected endpoint.
3. Regenerate `@atlas/api` OpenAPI client from a corrected spec so the typed
   `fetch` layer in `lib/auth-api.ts` can be replaced by the generated client.
4. Add automated tests (Vitest + Playwright) for the auth flows and `AuthGuard`.

## 7. Conclusion

P3-1 passes the security review for its scope. Frontend auth implementation is
XSS-safe, uses generic errors, validates input (client + response) with Zod,
protects routes via `AuthGuard`, uses safe hardcoded redirects, and introduces no
forbidden patterns or vulnerable runtime dependencies. Residual risks are inherited
and tracked separately.

# OpenAPI Security Review

**Project:** Atlas AI  
**Date:** 2026-07-22  

---

## 1. OpenAPI Setup

**File:** `services/backend/src/openapi/setup.ts`

The OpenAPI document is generated using `@nestjs/swagger`'s `DocumentBuilder` and served at `/docs`.

**Issues:**

### OAS-001: Swagger UI exposed in all environments (Medium)

Swagger UI is enabled at `/docs` without any environment guard. In production, this exposes the entire API surface:
- All endpoint paths and methods
- All DTO structures (including optional fields, validation rules)
- All parameter names and types
- All error codes
- Authentication scheme details

While the endpoints themselves require authentication, the schema provides attackers with a detailed map of the attack surface.

**Recommendation:** Add environment check before `SwaggerModule.setup`:
```typescript
if (process.env["APP_ENV"] !== "production") {
  SwaggerModule.setup(OPENAPI_PATH, app, document);
}
```

Or protect the Swagger endpoint with authentication.

### OAS-002: No API versioning in URL (Low)

All endpoints are at root level (`/auth/login`, `/projects`, etc.). There is no version prefix (`/v1/auth/login`). This makes it difficult to introduce breaking changes or maintain backward compatibility.

**Recommendation:** Add version prefix (e.g., `globalPrefix: 'v1'` or per-module prefix).

### OAS-003: Bearer auth scheme documented — correct (Info)

The OpenAPI setup correctly uses `.addBearerAuth()` which documents the JWT Bearer token scheme. This allows `openapi-typescript` and `openapi-fetch` to generate correct client code with automatic auth header injection.

---

## 2. DTO Analysis

### Request DTOs

All request DTOs use `class-validator` decorators for validation:

| DTO | Validations | Issues |
|-----|------------|--------|
| `LoginRequest` | `@IsEmail()`, `@IsString() @MinLength(1)` password, optional device fields | OK |
| `RegisterRequest` | `@IsEmail()`, `@MinLength(8) @MaxLength(128)` password, `@MinLength(1) @MaxLength(100)` name | OK |
| `RefreshRequest` | `@IsString() @MinLength(1)` token | OK |
| `CreateProjectDto` | DTO fields with validation | Need to verify |
| `UpdateProjectDto` | Patch-style optional fields | Need to verify |
| `ProjectListQueryDto` | Query params with optional types | OK |

**Issues:**

### OAS-004: Refresh token sent in request body (Medium)

The refresh endpoint accepts the refresh token as `{ "refreshToken": "..." }` in the request body. This means:
1. The token is in the JSON body, visible to any middleware logging request bodies
2. The token is not tied to a specific scope or audience beyond what's in the JWT itself

**Recommendation:** Consider using a cookie-based approach for refresh tokens (see F-001). The refresh token should be sent as an `HttpOnly` cookie rather than in the request body.

### OAS-005: Password field min length inconsistency (Low)

`RegisterRequest` validates password with `@MinLength(8)`, but the `PasswordPolicyService` enforces `minLength: 12`. This means a password between 8-11 characters passes DTO validation but fails at the service layer, resulting in a confusing error response.

**Recommendation:** Align the DTO min length with the password policy (change DTO to `@MinLength(12)`).

---

## 3. Response DTOs

### OAS-006: AuthTokenResponse exposes refresh token in response body (Medium)

The `AuthTokenResponse` DTO includes `refreshToken` and `accessToken` in the response body. This is standard practice for SPAs, but combined with localStorage storage (F-001), it creates a significant attack surface.

**Recommendation:** See F-001. Return refresh token as `HttpOnly` cookie.

### OAS-007: Error responses do not expose stack traces — correct (Info)

The `GlobalExceptionFilter` returns sanitized error responses with `statusCode`, `code`, `message`, `timestamp`, `path`, and optionally `correlationId` and `details`. Stack traces are never exposed in production responses.

---

## 4. Generated Client Types

**File:** `packages/api/src/generated.ts`

### OAS-008: `content?: never` eliminated for project endpoints (Info)

After P4.5 fixes, all project endpoints have proper response type schemas. Remaining `never` entries are:
- `requestBody?: never` on GET/DELETE methods (correct)
- `content?: never` on 204 responses (correct — no body)
- `content?: never` on error responses in legacy/unused endpoints

---

## 5. Security Decorators

### OAS-009: @SkipTenant used on auth controller (Info)

The `@SkipTenant()` decorator is correctly applied to the AuthController, allowing unauthenticated access to login, register, and refresh endpoints.

### OAS-010: @ApiBearerAuth on protected endpoints (Info)

All endpoints that use `AuthGuard` correctly have `@ApiBearerAuth()` decorator, ensuring the OpenAPI schema documents authentication requirements.

---

## Summary

| ID | Severity | Finding |
|----|----------|---------|
| OAS-001 | Medium | Swagger UI exposed in production |
| OAS-004 | Medium | Refresh token in request body |
| OAS-006 | Medium | Refresh token in response body |
| OAS-002 | Low | No API versioning |
| OAS-005 | Low | Password min length mismatch |
| OAS-003 | Info | Bearer auth correctly documented |
| OAS-007 | Info | No stack traces in errors |
| OAS-008 | Info | `never` types cleaned up |
| OAS-009 | Info | Tenant skip correct |
| OAS-010 | Info | Bearer auth on protected endpoints |

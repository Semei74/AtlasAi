import { describe, it, expect, vi } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedError } from "@atlas/errors";
import { AuthGuard } from "./auth.guard.js";
import { JwtService } from "../../jwt/services/jwt.service.js";
import type { JwtConfig } from "../../jwt/interfaces/jwt-config.interface.js";
import type { RefreshTokenStore } from "../../jwt/interfaces/refresh-token-store.interface.js";

function createMockJwtService(shouldSucceed: boolean): JwtService {
  const config: JwtConfig = {
    secret: "test-secret",
    accessTokenExpiresIn: "15m",
    refreshTokenExpiresIn: "30d",
    algorithm: "HS256",
    issuer: "test",
    audience: "test",
  };
  const store: RefreshTokenStore = {
    save(): Promise<void> {
      return Promise.resolve();
    },
    find() {
      return Promise.resolve(null);
    },
    markConsumed() {
      return Promise.resolve();
    },
    invalidateByUser() {
      return Promise.resolve();
    },
  };

  const service = new JwtService(config, store);

  if (!shouldSucceed) {
    vi.spyOn(service, "verifyAccessToken").mockImplementation(() => {
      throw new Error("Invalid or expired access token");
    });
  }

  return service;
}

function createMockContext(headers: Record<string, string | undefined>): ExecutionContext {
  const request = { headers };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
  it("should pass with a valid Bearer token", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);

    const token = jwtService.generateAccessToken({
      sub: "user-123",
      email: "user@test.com",
      role: "admin",
    });

    const context = createMockContext({ authorization: `Bearer ${token}` });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should set request.user with decoded claims", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);

    const token = jwtService.generateAccessToken({
      sub: "user-123",
      email: "user@test.com",
      role: "admin",
    });

    const request = { headers: { authorization: `Bearer ${token}` } };
    const context = {
      switchToHttp: (): { getRequest: () => Record<string, unknown> } => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    guard.canActivate(context);
    expect((request as Record<string, unknown>)["user"]).toBeDefined();
  });

  it("should throw UnauthorizedError when Authorization header is missing", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);
    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError for empty Authorization header", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);
    const context = createMockContext({ authorization: "" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError for invalid Authorization scheme", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);
    const context = createMockContext({ authorization: "Basic dXNlcjpwYXNz" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError for malformed Authorization header", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);
    const context = createMockContext({ authorization: "Bearer token extra" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError for invalid token", () => {
    const jwtService = createMockJwtService(false);
    const guard = new AuthGuard(jwtService);
    const context = createMockContext({
      authorization: "Bearer invalid-token",
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError for expired token", () => {
    const jwtService = createMockJwtService(true);
    const guard = new AuthGuard(jwtService);

    const context = createMockContext({
      authorization: "Bearer expired.jwt.token",
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedError);
  });
});

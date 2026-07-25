import { describe, it, expect, beforeEach } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { ForbiddenError } from "@atlas/errors";
import type { JwtClaims } from "../../jwt/interfaces/jwt-claims.interface.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { AuthorizationService } from "../services/authorization.service.js";
import { RolesGuard } from "./roles.guard.js";
import type { RequestWithUser } from "./auth.guard.js";

function createMockReflector(roles: string[] | undefined): Reflector {
  return {
    getAllAndOverride: (key: string | symbol) => {
      if (key === ROLES_KEY) return roles;
      return undefined;
    },
  } as unknown as Reflector;
}

function createMockContext(user?: { role: string }): ExecutionContext {
  const request: Partial<RequestWithUser> = {};
  if (user !== undefined) {
    request.user = user as JwtClaims;
  }
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationService = new AuthorizationService();
  });

  it("should pass when user role matches the required role", () => {
    const reflector = createMockReflector(["admin"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "admin" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should pass when user role is higher than required", () => {
    const reflector = createMockReflector(["manager"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "admin" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should pass when Owner requires any role", () => {
    const reflector = createMockReflector(["viewer"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "owner" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should pass when no @Roles() metadata is set", () => {
    const reflector = createMockReflector(undefined);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "user" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should pass when @Roles() has an empty array", () => {
    const reflector = createMockReflector([]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "user" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should pass when user matches at least one of multiple roles", () => {
    const reflector = createMockReflector(["admin", "manager"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "manager" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should throw ForbiddenError when user role is insufficient", () => {
    const reflector = createMockReflector(["admin"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "viewer" });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });

  it("should throw ForbiddenError when user role is lower than required", () => {
    const reflector = createMockReflector(["manager"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext({ role: "user" });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });

  it("should throw ForbiddenError when there is no user on request", () => {
    const reflector = createMockReflector(["admin"]);
    const guard = new RolesGuard(reflector, authorizationService);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });
});

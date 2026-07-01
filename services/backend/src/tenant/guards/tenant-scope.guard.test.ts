import { describe, it, expect, vi } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { TenantScopeGuard } from "./tenant-scope.guard.js";
import { JwtService } from "../../auth/jwt/services/jwt.service.js";
import { SKIP_TENANT_KEY } from "../decorators/skip-tenant.decorator.js";
import type { MembershipRepository } from "../../membership/interfaces/membership-repository.interface.js";
import type { Membership } from "../../membership/interfaces/membership.interface.js";
import { MembershipRole } from "../../membership/interfaces/membership-role.enum.js";
import { MembershipStatus } from "../../membership/interfaces/membership-status.enum.js";
import type { JwtConfig } from "../../auth/jwt/interfaces/jwt-config.interface.js";
import type { RefreshTokenStore } from "../../auth/jwt/interfaces/refresh-token-store.interface.js";

const TEST_USER_ID = "user-123";
const TEST_ORG_ID = "org-456";
const TEST_WORKSPACE_ID = "ws-789";
const TEST_ROLE = "admin";

function createMockJwtService(): JwtService {
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
    find(): Promise<null> {
      return Promise.resolve(null);
    },
    markConsumed(): Promise<void> {
      return Promise.resolve();
    },
    invalidateByUser(): Promise<void> {
      return Promise.resolve();
    },
  };

  return new JwtService(config, store);
}

function createMockContext(
  headers: Record<string, string | undefined>,
  existingUser?: Record<string, unknown>,
): ExecutionContext {
  const request: Record<string, unknown> = { headers };

  if (existingUser) {
    request["user"] = existingUser;
  }

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

interface MockReflector {
  getAllAndOverride: (key: string) => boolean | undefined;
}

function createReflectorWithSkip(skip: boolean): MockReflector {
  return {
    getAllAndOverride(key: string): boolean | undefined {
      if (key === SKIP_TENANT_KEY) return skip ? true : undefined;
      return undefined;
    },
  };
}

function createMockMembership(overrides?: Partial<Membership>): Membership {
  return {
    id: "membership-1",
    organizationId: TEST_ORG_ID,
    userId: TEST_USER_ID,
    role: MembershipRole.Admin,
    status: MembershipStatus.Active,
    joinedAt: new Date(),
    ...overrides,
  };
}

function createMembershipRepoWith(membership: Membership | null): MembershipRepository {
  return {
    findById(): Promise<Membership | null> {
      return Promise.resolve(null);
    },
    findByOrganizationId(): Promise<Membership[]> {
      return Promise.resolve([]);
    },
    findByUserId(): Promise<Membership[]> {
      return Promise.resolve([]);
    },
    findByOrganizationAndUser(): Promise<Membership | null> {
      return Promise.resolve(membership);
    },
    create(): Promise<Membership> {
      return Promise.resolve(createMockMembership());
    },
    update(): Promise<Membership> {
      return Promise.resolve(createMockMembership());
    },
    delete(): Promise<void> {
      return Promise.resolve();
    },
  };
}

describe("TenantScopeGuard", () => {
  describe("@SkipTenant", () => {
    it("should bypass tenant validation when @SkipTenant is set", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(true);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const context = createMockContext({});

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("no authentication context", () => {
    it("should pass when no auth header is present", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const context = createMockContext({});

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should pass when auth header has no Bearer token", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const context = createMockContext({ authorization: "Basic dXNlcjpwYXNz" });

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should pass when JWT decode returns null", async () => {
      const jwtService = createMockJwtService();
      vi.spyOn(jwtService, "decodeAccessToken").mockReturnValue(null);
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const context = createMockContext({ authorization: "Bearer invalid-token" });

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("JWT without organization context", () => {
    it("should pass when JWT has no organizationId", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const token: string = jwtService.generateAccessToken({
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should pass when organizationId is null in JWT", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const token: string = jwtService.generateAccessToken({
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
        organizationId: null,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("tenant validation", () => {
    it("should pass and populate tenant context when membership exists", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membership = createMockMembership();
      const membershipRepo = createMembershipRepoWith(membership);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const token: string = jwtService.generateAccessToken({
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
        organizationId: TEST_ORG_ID,
        workspaceId: TEST_WORKSPACE_ID,
      });

      const request: Record<string, unknown> = {
        headers: { authorization: `Bearer ${token}` },
      };
      const context = {
        switchToHttp: (): { getRequest: () => Record<string, unknown> } => ({
          getRequest: (): Record<string, unknown> => request,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);

      const tenant = request["tenant"] as {
        organizationId: string;
        workspaceId: string;
        userId: string;
        membershipRole: string;
      };
      expect(tenant).toBeDefined();
      expect(tenant.organizationId).toBe(TEST_ORG_ID);
      expect(tenant.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(tenant.userId).toBe(TEST_USER_ID);
      expect(tenant.membershipRole).toBe("admin");
    });

    it("should throw ForbiddenException when user has no membership", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const token: string = jwtService.generateAccessToken({
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
        organizationId: TEST_ORG_ID,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it("should reuse existing request.user when AuthGuard ran first", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membership = createMockMembership();
      const membershipRepo = createMembershipRepoWith(membership);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const existingUser: Record<string, unknown> = {
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
        organizationId: TEST_ORG_ID,
        workspaceId: TEST_WORKSPACE_ID,
        sessionId: "session-1",
        tokenVersion: 1,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      };

      const request: Record<string, unknown> = {
        headers: {},
        user: existingUser,
      };
      const context = {
        switchToHttp: (): { getRequest: () => Record<string, unknown> } => ({
          getRequest: (): Record<string, unknown> => request,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      const result: boolean = await guard.canActivate(context);

      expect(result).toBe(true);

      const tenant = request["tenant"] as {
        organizationId: string;
        userId: string;
        membershipRole: string;
      };
      expect(tenant).toBeDefined();
      expect(tenant.organizationId).toBe(TEST_ORG_ID);
      expect(tenant.userId).toBe(TEST_USER_ID);
    });

    it("should throw ForbiddenException with correct message", async () => {
      const jwtService = createMockJwtService();
      const reflector = createReflectorWithSkip(false);
      const membershipRepo = createMembershipRepoWith(null);
      const guard = new TenantScopeGuard(reflector as never, jwtService, membershipRepo);

      const token: string = jwtService.generateAccessToken({
        sub: TEST_USER_ID,
        email: "test@example.com",
        role: TEST_ROLE,
        organizationId: TEST_ORG_ID,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });

      await expect(guard.canActivate(context)).rejects.toThrow(
        "User is not a member of this organization",
      );
    });
  });
});

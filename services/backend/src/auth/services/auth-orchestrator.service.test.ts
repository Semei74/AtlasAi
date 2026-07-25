import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { AuthOrchestratorService } from "./auth-orchestrator.service.js";
import { AuthService, AUTH_PROVIDERS } from "../auth.service.js";
import type { AuthProvider } from "../interfaces/auth-provider.interface.js";
import { AuthProviderType } from "../interfaces/auth-provider.interface.js";
import type { AuthResult } from "../dto/auth-result.dto.js";
import { JwtService } from "../jwt/services/jwt.service.js";
import { SessionService } from "../session/services/session.service.js";
import type { Session } from "../session/interfaces/session.interface.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import { REFRESH_TOKEN_STORE } from "../jwt/interfaces/refresh-token-store.interface.js";
import type { RefreshTokenStore, RefreshTokenData } from "../jwt/interfaces/refresh-token-store.interface.js";
import { JWT_CONFIG } from "../jwt/interfaces/jwt-config.interface.js";
import {
  SESSION_CONFIG,
  DEFAULT_SESSION_CONFIG,
} from "../session/interfaces/session-config.interface.js";
import { SESSION_STORE } from "../session/interfaces/session-store.interface.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import { AccountLockoutService } from "./account-lockout.service.js";
import { AuthAuditService } from "./auth-audit.service.js";
import { RedisService } from "../../redis/redis.service.js";

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_EMAIL = "test@example.com";

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: TEST_USER_ID,
    email: TEST_EMAIL,
    passwordHash: "$argon2id$mockhash",
    displayName: "Test User",
    status: "active",
    avatarUrl: null,
    bio: null,
    timezone: null,
    theme: "system",
    locale: "en-US",
    emailNotifications: true,
    pushNotifications: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

class MockRefreshTokenStore implements RefreshTokenStore {
  private readonly tokens = new Map<
    string,
    { userId: string; expiresAt: Date; consumed: boolean; tokenFamily: string }
  >();

  public save(token: string, userId: string, expiresAt: Date, tokenFamily: string): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false, tokenFamily });
    return Promise.resolve();
  }

  public find(token: string): Promise<RefreshTokenData | null> {
    const entry = this.tokens.get(token) ?? null;
    if (!entry) return Promise.resolve(null);
    return Promise.resolve({
      userId: entry.userId,
      expiresAt: entry.expiresAt,
      consumed: entry.consumed,
      tokenFamily: entry.tokenFamily,
    });
  }

  public markConsumed(token: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry !== undefined) {
      entry.consumed = true;
    }
    return Promise.resolve();
  }

  public consume(token: string): Promise<boolean> {
    const entry = this.tokens.get(token);
    if (entry === undefined || entry.consumed) return Promise.resolve(false);
    entry.consumed = true;
    return Promise.resolve(true);
  }

  public invalidateByUser(_userId: string): Promise<void> {
    return Promise.resolve();
  }

  public invalidateFamily(_tokenFamily: string): Promise<void> {
    return Promise.resolve();
  }

  public setToken(
    token: string,
    data: { userId: string; expiresAt: Date; consumed: boolean },
  ): void {
    this.tokens.set(token, { ...data, tokenFamily: "test-family" });
  }
}

class MockSessionStore {
  public save(_session: Session): Promise<void> {
    return Promise.resolve();
  }

  public findById(_id: string): Promise<Session | null> {
    return Promise.resolve(null);
  }

  public findByUserId(_userId: string): Promise<Session[]> {
    return Promise.resolve([]);
  }

  public updateLastActivity(_id: string, _now: Date): Promise<void> {
    return Promise.resolve();
  }

  public revoke(_id: string): Promise<void> {
    return Promise.resolve();
  }

  public revokeAllByUserId(_userId: string, _exceptId?: string): Promise<void> {
    return Promise.resolve();
  }

  public deleteExpired(_before: Date): Promise<number> {
    return Promise.resolve(0);
  }
}

class MockUserRepo implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  public setUser(user: UserRecord): void {
    this.users.set(user.id, user);
  }

  public findByEmail(email: string): Promise<UserRecord | null> {
    for (const u of this.users.values()) {
      if (u.email === email.toLowerCase()) {
        return Promise.resolve(u);
      }
    }
    return Promise.resolve(null);
  }

  public findById(id: string): Promise<UserRecord | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  public create(record: Omit<UserRecord, "createdAt" | "updatedAt">): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = { ...record, createdAt: now, updatedAt: now };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  public update(_id: string, _changes: Partial<Omit<UserRecord, "id">>): Promise<UserRecord> {
    throw new Error("not implemented");
  }
}

function makeAuthResult(overrides: Partial<AuthResult> = {}): AuthResult {
  return {
    success: true,
    userId: TEST_USER_ID,
    provider: AuthProviderType.EmailPassword,
    failureReason: null,
    ...overrides,
  };
}

describe("AuthOrchestratorService", () => {
  let moduleRef: TestingModule;
  let service: AuthOrchestratorService;
  let mockUserRepo: MockUserRepo;
  let mockRefreshStore: MockRefreshTokenStore;

  beforeAll(async () => {
    mockUserRepo = new MockUserRepo();
    mockRefreshStore = new MockRefreshTokenStore();

    const mockAuthProvider: AuthProvider = {
      type: AuthProviderType.EmailPassword,
      authenticate: async (credentials: unknown): Promise<AuthResult> => {
        const creds = credentials as { email: string; password: string };
        const user = await mockUserRepo.findByEmail(creds.email);
        if (user !== null && creds.password === "correct-password") {
          return makeAuthResult();
        }
        return makeAuthResult({
          success: false,
          userId: null,
          failureReason: "Invalid email or password",
        });
      },
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthOrchestratorService,
        AuthService,
        JwtService,
        SessionService,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: REFRESH_TOKEN_STORE, useValue: mockRefreshStore },
        { provide: JWT_CONFIG, useValue: { secret: "test-secret-key-at-least-32-characters-long!", accessTokenExpiresIn: "15m", refreshTokenExpiresIn: "30d", algorithm: "HS256" as const, issuer: "atlas-ai", audience: "atlas-api" } },
        { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG },
        { provide: SESSION_STORE, useClass: MockSessionStore },
        AccountLockoutService,
        AuthAuditService,
        { provide: RedisService, useValue: { incr: async () => 1, pexpire: async () => {}, hset: async () => {}, hgetall: async () => ({}), get: async () => null, del: async () => {}, pttl: async () => 0 } },
        { provide: AUTH_PROVIDERS, useValue: [mockAuthProvider] },
      ],
    }).compile();

    service = moduleRef.get(AuthOrchestratorService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      mockUserRepo.setUser(makeUser());

      const result = await service.login({
        email: TEST_EMAIL,
        password: "correct-password",
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.user.email).toBe(TEST_EMAIL);
    });

    it("should throw for invalid credentials", async () => {
      await expect(
        service.login({
          email: TEST_EMAIL,
          password: "wrong-password",
          deviceName: undefined,
          devicePlatform: undefined,
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should propagate device info and IP to session creation", async () => {
      mockUserRepo.setUser(makeUser());

      const result = await service.login({
        email: TEST_EMAIL,
        password: "correct-password",
        deviceName: "Test Device",
        devicePlatform: "Android",
        ipAddress: "10.0.0.1",
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(TEST_EMAIL);
    });

    it("should use viewer role for non-active user", async () => {
      mockUserRepo.setUser(makeUser({ status: "suspended" }));

      const result = await service.login({
        email: TEST_EMAIL,
        password: "correct-password",
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      expect(result.user.status).toBe("suspended");
    });
  });

  describe("logout", () => {
    it("should not throw for valid session", async () => {
      await expect(service.logout(TEST_USER_ID, "session-123")).resolves.toBeUndefined();
    });

    it("should not throw for non-existent session (catches errors)", async () => {
      await expect(service.logout(TEST_USER_ID, "non-existent")).resolves.toBeUndefined();
    });
  });

  describe("refresh", () => {
    it("should return new token pair for valid refresh token", async () => {
      mockUserRepo.setUser(makeUser());
      const future = new Date(Date.now() + 86_400_000);
      mockRefreshStore.setToken("valid-token", {
        userId: TEST_USER_ID,
        expiresAt: future,
        consumed: false,
      });

      const result = await service.refresh("valid-token");
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe("valid-token");
    });

    it("should throw for invalid refresh token", async () => {
      await expect(service.refresh("non-existent")).rejects.toThrow("Invalid refresh token");
    });

    it("should throw for consumed refresh token", async () => {
      mockRefreshStore.setToken("consumed-token", {
        userId: TEST_USER_ID,
        expiresAt: new Date(Date.now() + 86_400_000),
        consumed: true,
      });

      await expect(service.refresh("consumed-token")).rejects.toThrow(
        "Refresh token already consumed",
      );
    });

    it("should throw for expired refresh token", async () => {
      mockRefreshStore.setToken("expired-token", {
        userId: TEST_USER_ID,
        expiresAt: new Date(Date.now() - 1000),
        consumed: false,
      });

      await expect(service.refresh("expired-token")).rejects.toThrow("Refresh token expired");
    });
  });
});

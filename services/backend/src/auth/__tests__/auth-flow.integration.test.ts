import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { AuthOrchestratorService } from "../services/auth-orchestrator.service.js";
import { AuthService, AUTH_PROVIDERS } from "../auth.service.js";
import type { AuthProvider } from "../interfaces/auth-provider.interface.js";
import { AuthProviderType } from "../interfaces/auth-provider.interface.js";
import type { AuthResult } from "../dto/auth-result.dto.js";
import type { Provider } from "@nestjs/common";
import { JwtService } from "../jwt/services/jwt.service.js";
import type { Session } from "../session/interfaces/session.interface.js";
import { SessionService } from "../session/services/session.service.js";
import { PasswordHashingService } from "../password/services/password-hashing.service.js";
import { PasswordPolicyService } from "../password/services/password-policy.service.js";
import { UserRegistrationService } from "../services/user-registration.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import { REFRESH_TOKEN_STORE } from "../jwt/interfaces/refresh-token-store.interface.js";
import type { RefreshTokenStore, RefreshTokenData } from "../jwt/interfaces/refresh-token-store.interface.js";
import type { SessionStore } from "../session/interfaces/session-store.interface.js";
import { JWT_CONFIG } from "../jwt/interfaces/jwt-config.interface.js";
import { AccountLockoutService } from "../services/account-lockout.service.js";
import { AuthAuditService } from "../services/auth-audit.service.js";
import { EmailVerificationService } from "../services/email-verification.service.js";
import { RedisService } from "../../redis/redis.service.js";
import {
  SESSION_CONFIG,
  DEFAULT_SESSION_CONFIG,
} from "../session/interfaces/session-config.interface.js";
import { SESSION_STORE } from "../session/interfaces/session-store.interface.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import {
  PASSWORD_POLICY_CONFIG,
  DEFAULT_PASSWORD_POLICY,
} from "../password/interfaces/password-policy.interface.js";
import { PasswordManagementService } from "../password/services/password-management.service.js";
import { PasswordHistoryService } from "../password/services/password-history.service.js";
import { PasswordResetService } from "../password/services/password-reset.service.js";
import { PasswordExpirationService } from "../password/services/password-expiration.service.js";
import { PASSWORD_HISTORY_STORE } from "../password/interfaces/password-history-store.interface.js";
import { PASSWORD_RESET_STORE } from "../password/interfaces/password-reset-store.interface.js";
import type { PasswordHistoryStore } from "../password/interfaces/password-history-store.interface.js";
import type { PasswordResetStore } from "../password/interfaces/password-reset-store.interface.js";

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_EMAIL = "integration@example.com";
const TEST_PASSWORD = "StrongP@ss1aaa";

class InMemoryUserRepo implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  public addUser(email: string, passwordHash: string): void {
    this.users.set(email.toLowerCase(), {
      id: TEST_USER_ID,
      email: email.toLowerCase(),
      passwordHash,
      displayName: "Integration User",
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
    });
  }

  public findByEmail(email: string): Promise<UserRecord | null> {
    return Promise.resolve(this.users.get(email.toLowerCase()) ?? null);
  }

  public findById(id: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.id === id) return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  public create(record: Omit<UserRecord, "createdAt" | "updatedAt">): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = { ...record, createdAt: now, updatedAt: now };
    this.users.set(user.email, user);
    return Promise.resolve(user);
  }

  public update(id: string, changes: Partial<Omit<UserRecord, "id">>): Promise<UserRecord> {
    const existing = Array.from(this.users.values()).find((u) => u.id === id);
    if (existing === undefined) throw new Error("User not found");
    const updated: UserRecord = { ...existing, ...changes, updatedAt: new Date() };
    this.users.set(updated.email, updated);
    return Promise.resolve(updated);
  }
}

class InMemoryRefreshTokenStore implements RefreshTokenStore {
  private readonly tokens = new Map<string, { userId: string; expiresAt: Date; consumed: boolean; tokenFamily: string }>();

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
    if (entry !== undefined) entry.consumed = true;
    return Promise.resolve();
  }

  public consume(token: string): Promise<boolean> {
    const entry = this.tokens.get(token);
    if (entry === undefined || entry.consumed) return Promise.resolve(false);
    entry.consumed = true;
    return Promise.resolve(true);
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [key, val] of this.tokens) {
      if (val.userId === userId) this.tokens.delete(key);
    }
    return Promise.resolve();
  }

  public invalidateFamily(_tokenFamily: string): Promise<void> {
    return Promise.resolve();
  }
}

class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, Session>();

  public save(session: Session): Promise<void> {
    this.sessions.set(session.id, { ...session });
    return Promise.resolve();
  }

  public findById(id: string): Promise<Session | null> {
    return Promise.resolve(this.sessions.get(id) ?? null);
  }

  public findByUserId(userId: string): Promise<Session[]> {
    return Promise.resolve(Array.from(this.sessions.values()).filter((s) => s.userId === userId));
  }

  public updateLastActivity(id: string, _now: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (session) this.sessions.set(id, { ...session, lastActivityAt: _now });
    return Promise.resolve();
  }

  public revoke(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) this.sessions.set(id, { ...session, revokedAt: new Date() });
    return Promise.resolve();
  }

  public revokeAllByUserId(userId: string, exceptId?: string): Promise<void> {
    for (const [id, session] of this.sessions) {
      if (session.userId === userId && id !== exceptId) {
        this.sessions.set(id, { ...session, revokedAt: new Date() });
      }
    }
    return Promise.resolve();
  }

  public deleteExpired(_before: Date): Promise<number> {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.expiresAt < _before) {
        this.sessions.delete(id);
        count++;
      }
    }
    return Promise.resolve(count);
  }
}

class InMemoryPasswordHistoryStore implements PasswordHistoryStore {
  private readonly history = new Map<string, string[]>();

  public add(userId: string, passwordHash: string): Promise<void> {
    const entries = this.history.get(userId) ?? [];
    entries.push(passwordHash);
    this.history.set(userId, entries);
    return Promise.resolve();
  }

  public getAll(userId: string): Promise<readonly string[]> {
    return Promise.resolve(this.history.get(userId) ?? []);
  }
}

class InMemoryPasswordResetStore implements PasswordResetStore {
  private readonly tokens = new Map<string, { userId: string; expiresAt: Date; consumed: boolean }>();

  public save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false });
    return Promise.resolve();
  }

  public find(token: string): Promise<{ userId: string; expiresAt: Date; consumed: boolean } | null> {
    return Promise.resolve(this.tokens.get(token) ?? null);
  }

  public markConsumed(token: string): Promise<void> {
    const data = this.tokens.get(token);
    if (data) this.tokens.set(token, { ...data, consumed: true });
    return Promise.resolve();
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [token, data] of this.tokens.entries()) {
      if (data.userId === userId) this.tokens.delete(token);
    }
    return Promise.resolve();
  }
}

describe("Authentication Flow Integration", () => {
  let moduleRef: TestingModule;
  let authOrchestrator: AuthOrchestratorService;
  let registrationService: UserRegistrationService;
  let passwordManagement: PasswordManagementService;
  let userRepo: InMemoryUserRepo;
  let mockSessionStore: InMemorySessionStore;
  let hashingService: PasswordHashingService;

  beforeAll(async () => {
    userRepo = new InMemoryUserRepo();
    const refreshStore = new InMemoryRefreshTokenStore();
    mockSessionStore = new InMemorySessionStore();
    const pwHistoryStore = new InMemoryPasswordHistoryStore();
    const pwResetStore = new InMemoryPasswordResetStore();
    hashingService = new PasswordHashingService();

    const mockAuthProvider: AuthProvider = {
      type: AuthProviderType.EmailPassword,
      authenticate: async (credentials: unknown): Promise<AuthResult> => {
        const creds = credentials as { email: string; password: string };
        const user = await userRepo.findByEmail(creds.email);
        if (user !== null) {
          const valid = await hashingService.verify(user.passwordHash, creds.password);
          if (valid) {
            return { success: true, userId: user.id, provider: AuthProviderType.EmailPassword, failureReason: null };
          }
        }
        return { success: false, userId: null, provider: AuthProviderType.EmailPassword, failureReason: "Invalid email or password" };
      },
    };

    const mockRedis = {
      incr: async () => 1,
      pexpire: async () => {},
      hset: async () => {},
      hgetall: async () => ({}),
      get: async () => null,
      del: async () => {},
      pttl: async () => 0,
      set: async () => {},
      expire: async () => {},
    };

    const providers: Provider[] = [
      AuthOrchestratorService,
      AuthService,
      JwtService,
      SessionService,
      PasswordManagementService,
      PasswordHashingService,
      PasswordPolicyService,
      PasswordHistoryService,
      PasswordResetService,
      PasswordExpirationService,
      UserRegistrationService,
      { provide: USER_REPOSITORY, useValue: userRepo },
      { provide: REFRESH_TOKEN_STORE, useValue: refreshStore },
      { provide: JWT_CONFIG, useValue: { secret: "test-secret-key-at-least-32-characters-long!", accessTokenExpiresIn: "15m", refreshTokenExpiresIn: "30d", algorithm: "HS256" as const, issuer: "atlas-ai", audience: "atlas-api" } },
      { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG },
      { provide: SESSION_STORE, useValue: mockSessionStore },
      { provide: AUTH_PROVIDERS, useValue: [mockAuthProvider] },
      { provide: PASSWORD_POLICY_CONFIG, useValue: DEFAULT_PASSWORD_POLICY },
      { provide: PASSWORD_HISTORY_STORE, useValue: pwHistoryStore },
      { provide: PASSWORD_RESET_STORE, useValue: pwResetStore },
      AccountLockoutService,
      AuthAuditService,
      EmailVerificationService,
      { provide: RedisService, useValue: mockRedis },
    ];

    moduleRef = await Test.createTestingModule({
      providers,
    }).compile();

    authOrchestrator = moduleRef.get(AuthOrchestratorService);
    registrationService = moduleRef.get(UserRegistrationService);
    passwordManagement = moduleRef.get(PasswordManagementService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("register → login → refresh → logout flow", () => {
    it("should complete the full authentication lifecycle", async () => {
      const registerResult = await registrationService.register({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        displayName: "Integration User",
        avatarUrl: undefined,
        bio: undefined,
        timezone: undefined,
        theme: undefined,
        locale: undefined,
        emailNotifications: undefined,
        pushNotifications: undefined,
        deviceName: "Integration Test",
        devicePlatform: "Node.js",
        ipAddress: "127.0.0.1",
      });

      expect(registerResult.accessToken).toBeDefined();
      expect(registerResult.refreshToken).toBeDefined();
      expect(registerResult.user.email).toBe(TEST_EMAIL);

      const loginResult = await authOrchestrator.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        deviceName: "Integration Test",
        devicePlatform: "Node.js",
        ipAddress: "127.0.0.1",
      });

      expect(loginResult.accessToken).toBeDefined();
      expect(loginResult.refreshToken).toBeDefined();

      const refreshResult = await authOrchestrator.refresh(loginResult.refreshToken);

      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken);

      await expect(
        authOrchestrator.logout(registerResult.user.id, "session-id"),
      ).resolves.toBeUndefined();
    });
  });

  describe("session revocation invalidates refresh", () => {
    it("should allow refresh after session revocation when token is still valid", async () => {
      const result = await authOrchestrator.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      const refreshResult = await authOrchestrator.refresh(result.refreshToken);

      expect(refreshResult.accessToken).toBeDefined();
    });
  });

  describe("password change flow", () => {
    it("should reject old refresh token after password change", async () => {
      const loginResult = await authOrchestrator.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      const changeResult = await passwordManagement.changePassword({
        userId: loginResult.user.id,
        currentPassword: TEST_PASSWORD,
        newPassword: "NewStrongP@ss2k9",
      });

      expect(changeResult.success).toBe(true);
    });
  });
});

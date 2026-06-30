import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { UserRegistrationService } from "./user-registration.service.js";
import { PasswordHashingService } from "../password/services/password-hashing.service.js";
import { PasswordPolicyService } from "../password/services/password-policy.service.js";
import { JwtService } from "../jwt/services/jwt.service.js";
import { SessionService } from "../session/services/session.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import { JWT_CONFIG, DEFAULT_JWT_CONFIG } from "../jwt/interfaces/jwt-config.interface.js";
import { REFRESH_TOKEN_STORE } from "../jwt/interfaces/refresh-token-store.interface.js";
import type { RefreshTokenStore } from "../jwt/interfaces/refresh-token-store.interface.js";
import {
  SESSION_CONFIG,
  DEFAULT_SESSION_CONFIG,
} from "../session/interfaces/session-config.interface.js";
import { SESSION_STORE } from "../session/interfaces/session-store.interface.js";
import type { Session } from "../session/interfaces/session.interface.js";
import {
  PASSWORD_POLICY_CONFIG,
  DEFAULT_PASSWORD_POLICY,
} from "../password/interfaces/password-policy.interface.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";

class InMemoryRefreshTokenStore implements RefreshTokenStore {
  private readonly tokens = new Map<
    string,
    { userId: string; expiresAt: Date; consumed: boolean }
  >();

  public save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false });
    return Promise.resolve();
  }

  public find(
    token: string,
  ): Promise<{ userId: string; expiresAt: Date; consumed: boolean } | null> {
    return Promise.resolve(this.tokens.get(token) ?? null);
  }

  public markConsumed(token: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry !== undefined) {
      entry.consumed = true;
    }
    return Promise.resolve();
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [key, val] of this.tokens) {
      if (val.userId === userId) {
        this.tokens.set(key, { ...val, consumed: true });
      }
    }
    return Promise.resolve();
  }
}

class InMemorySessionStore {
  private readonly sessions = new Map<string, Session>();

  public save(session: Session): Promise<void> {
    this.sessions.set(session.id, { ...session });
    return Promise.resolve();
  }

  public findById(id: string): Promise<Session | null> {
    return Promise.resolve(this.sessions.get(id) ?? null);
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

  public findByEmail(email: string): Promise<UserRecord | null> {
    return Promise.resolve(this.users.get(email.toLowerCase()) ?? null);
  }

  public findById(_id: string): Promise<UserRecord | null> {
    return Promise.resolve(null);
  }

  public create(record: Omit<UserRecord, "createdAt" | "updatedAt">): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = { ...record, createdAt: now, updatedAt: now };
    this.users.set(user.email, user);
    return Promise.resolve(user);
  }

  public update(_id: string, _changes: Partial<Omit<UserRecord, "id">>): Promise<UserRecord> {
    throw new Error("not implemented");
  }
}

describe("UserRegistrationService", () => {
  let moduleRef: TestingModule;
  let service: UserRegistrationService;

  beforeAll(async () => {
    const mockUserRepo = new MockUserRepo();

    moduleRef = await Test.createTestingModule({
      providers: [
        UserRegistrationService,
        PasswordHashingService,
        PasswordPolicyService,
        JwtService,
        SessionService,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: JWT_CONFIG, useValue: DEFAULT_JWT_CONFIG },
        { provide: REFRESH_TOKEN_STORE, useClass: InMemoryRefreshTokenStore },
        { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG },
        { provide: SESSION_STORE, useClass: InMemorySessionStore },
        { provide: PASSWORD_POLICY_CONFIG, useValue: DEFAULT_PASSWORD_POLICY },
      ],
    }).compile();

    service = moduleRef.get(UserRegistrationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("register", () => {
    it("should register a new user and return tokens", async () => {
      const result = await service.register({
        email: "newuser@example.com",
        password: "StrongP@ss1aaa",
        displayName: "New User",
        avatarUrl: undefined,
        bio: undefined,
        timezone: undefined,
        theme: undefined,
        locale: undefined,
        emailNotifications: undefined,
        pushNotifications: undefined,
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.user.email).toBe("newuser@example.com");
      expect(result.user.displayName).toBe("New User");
      expect(result.user.status).toBe("active");
    });

    it("should throw on duplicate email", async () => {
      await service.register({
        email: "dupe@example.com",
        password: "StrongP@ss1aaa",
        displayName: "First",
        avatarUrl: undefined,
        bio: undefined,
        timezone: undefined,
        theme: undefined,
        locale: undefined,
        emailNotifications: undefined,
        pushNotifications: undefined,
        deviceName: undefined,
        devicePlatform: undefined,
        ipAddress: "127.0.0.1",
      });

      await expect(
        service.register({
          email: "dupe@example.com",
          password: "StrongP@ss2aaa",
          displayName: "Second",
          avatarUrl: undefined,
          bio: undefined,
          timezone: undefined,
          theme: undefined,
          locale: undefined,
          emailNotifications: undefined,
          pushNotifications: undefined,
          deviceName: undefined,
          devicePlatform: undefined,
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toThrow("Email already registered");
    });

    it("should throw on weak password", async () => {
      await expect(
        service.register({
          email: "weak@example.com",
          password: "short",
          displayName: "Weak",
          avatarUrl: undefined,
          bio: undefined,
          timezone: undefined,
          theme: undefined,
          locale: undefined,
          emailNotifications: undefined,
          pushNotifications: undefined,
          deviceName: undefined,
          devicePlatform: undefined,
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toThrow();
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test } from "@nestjs/testing";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import compression from "@fastify/compress";
import fastifyMultipart from "@fastify/multipart";
import { AppModule } from "../src/app.module.js";
import { setupOpenapi } from "../src/openapi/setup.js";
import { USER_REPOSITORY } from "../src/auth/providers/email-password.provider.js";
import { REFRESH_TOKEN_STORE } from "../src/auth/jwt/interfaces/refresh-token-store.interface.js";
import { SESSION_STORE } from "../src/auth/session/interfaces/session-store.interface.js";
import { PASSWORD_HISTORY_STORE } from "../src/auth/password/interfaces/password-history-store.interface.js";
import { PASSWORD_RESET_STORE } from "../src/auth/password/interfaces/password-reset-store.interface.js";
import { JWT_CONFIG, DEFAULT_JWT_CONFIG } from "../src/auth/jwt/interfaces/jwt-config.interface.js";
import { SESSION_CONFIG, DEFAULT_SESSION_CONFIG } from "../src/auth/session/interfaces/session-config.interface.js";
import { PASSWORD_POLICY_CONFIG, DEFAULT_PASSWORD_POLICY } from "../src/auth/password/interfaces/password-policy.interface.js";
import type { UserRepository, UserRecord } from "../src/auth/interfaces/user-repository.interface.js";
import type { RefreshTokenStore } from "../src/auth/jwt/interfaces/refresh-token-store.interface.js";
import type { Session } from "../src/auth/session/interfaces/session.interface.js";
import type { PasswordHistoryStore } from "../src/auth/password/interfaces/password-history-store.interface.js";
import type { PasswordResetStore } from "../src/auth/password/interfaces/password-reset-store.interface.js";

const TEST_USER_ID = "e2e-user-001";
const TEST_EMAIL = "e2e@example.com";

class E2eUserRepo implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  public constructor() {
    this.users.set(TEST_EMAIL, {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: "",
      displayName: "E2E User",
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

  public setPasswordHash(email: string, hash: string): void {
    const user = this.users.get(email);
    if (user) this.users.set(email, { ...user, passwordHash: hash });
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
    if (!existing) throw new Error("User not found");
    const updated: UserRecord = { ...existing, ...changes, updatedAt: new Date() };
    this.users.set(updated.email, updated);
    return Promise.resolve(updated);
  }
}

class E2eRefreshTokenStore implements RefreshTokenStore {
  private readonly tokens = new Map<string, { userId: string; expiresAt: Date; consumed: boolean }>();

  public save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false });
    return Promise.resolve();
  }

  public find(token: string): Promise<{ userId: string; expiresAt: Date; consumed: boolean } | null> {
    return Promise.resolve(this.tokens.get(token) ?? null);
  }

  public markConsumed(token: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry) entry.consumed = true;
    return Promise.resolve();
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [key, val] of this.tokens) {
      if (val.userId === userId) this.tokens.delete(key);
    }
    return Promise.resolve();
  }
}

class E2eSessionStore {
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

class E2ePasswordHistoryStore implements PasswordHistoryStore {
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

class E2ePasswordResetStore implements PasswordResetStore {
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

describe("Auth (e2e)", () => {
  let app: NestFastifyApplication;
  let userRepo: E2eUserRepo;
  let sessionStore: E2eSessionStore;

  beforeAll(async () => {
    userRepo = new E2eUserRepo();
    sessionStore = new E2eSessionStore();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepo)
      .overrideProvider(REFRESH_TOKEN_STORE)
      .useClass(E2eRefreshTokenStore)
      .overrideProvider(SESSION_STORE)
      .useValue(sessionStore)
      .overrideProvider(PASSWORD_HISTORY_STORE)
      .useClass(E2ePasswordHistoryStore)
      .overrideProvider(PASSWORD_RESET_STORE)
      .useClass(E2ePasswordResetStore)
      .overrideProvider(JWT_CONFIG)
      .useValue(DEFAULT_JWT_CONFIG)
      .overrideProvider(SESSION_CONFIG)
      .useValue(DEFAULT_SESSION_CONFIG)
      .overrideProvider(PASSWORD_POLICY_CONFIG)
      .useValue(DEFAULT_PASSWORD_POLICY)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    await app.register(compression);
    await app.register(fastifyMultipart, {
      limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 20 },
      throwFileSizeLimit: true,
    });
    setupOpenapi(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should return 201 with tokens for valid registration", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "new-e2e@example.com",
          password: "E2eStrongP@ss1",
          displayName: "New E2E User",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
      expect(body).toHaveProperty("user");
      expect(body.user.email).toBe("new-e2e@example.com");
    });

    it("should return 422 for missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: { email: "missing@example.com" },
      });

      expect(response.statusCode).toBe(422);
    });

    it("should return 422 for weak password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "weak@example.com",
          password: "short",
          displayName: "Weak Password",
        },
      });

      expect(response.statusCode).toBe(422);
    });
  });

  describe("POST /auth/login", () => {
    it("should return 401 for non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "nonexistent@example.com",
          password: "AnyPassword1!",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should return 401 for invalid refresh token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    it("should return 401 without authorization header", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 401 without authorization header", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/logout",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});

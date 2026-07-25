import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import crypto from "node:crypto";
import { SessionService } from "./session.service.js";
import type { Session } from "../interfaces/session.interface.js";
import type { DeviceInfo } from "../interfaces/device-info.interface.js";
import type { SessionConfig } from "../interfaces/session-config.interface.js";
import { SESSION_CONFIG, DEFAULT_SESSION_CONFIG } from "../interfaces/session-config.interface.js";
import { SESSION_STORE } from "../interfaces/session-store.interface.js";

const TEST_USER_ID = "user-123";
const TEST_REFRESH_TOKEN =
  "test-refresh-token-value-64charsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const TEST_DEVICE: DeviceInfo = {
  name: "iPhone 15 Pro",
  platform: "iOS",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
};

class MockSessionStore {
  public readonly sessions = new Map<string, Session>();

  public save(session: Session): Promise<void> {
    this.sessions.set(session.id, { ...session });
    return Promise.resolve();
  }

  public findById(id: string): Promise<Session | null> {
    const session = this.sessions.get(id);
    if (!session) return Promise.resolve(null);
    return Promise.resolve({ ...session });
  }

  public findByUserId(userId: string): Promise<Session[]> {
    const result: Session[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        result.push({ ...session });
      }
    }
    return Promise.resolve(result);
  }

  public updateLastActivity(id: string, timestamp: Date): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, lastActivityAt: timestamp });
    }
    return Promise.resolve();
  }

  public revoke(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.set(id, { ...session, revokedAt: new Date() });
    }
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

describe("SessionService", () => {
  let sessionService: SessionService;
  let moduleRef: TestingModule;
  let mockStore: MockSessionStore;

  beforeAll(async () => {
    mockStore = new MockSessionStore();

    moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG },
        { provide: SESSION_STORE, useValue: mockStore },
      ],
    }).compile();

    sessionService = moduleRef.get<SessionService>(SessionService);
  });

  beforeEach(() => {
    mockStore.sessions.clear();
  });

  describe("createSession", () => {
    it("should create a session and return its ID", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe("string");
    });

    it("should persist the session in the store", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      expect(stored.userId).toBe(TEST_USER_ID);
      expect(stored.ipAddress).toBe("192.168.1.1");
    });

    it("should store refresh token as a SHA-256 hash (not plaintext)", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      expect(stored.refreshTokenHash).not.toBe(TEST_REFRESH_TOKEN);

      const expectedHash = crypto.createHash("sha256").update(TEST_REFRESH_TOKEN).digest("hex");
      expect(stored.refreshTokenHash).toBe(expectedHash);
    });

    it("should set expiresAt based on absoluteTimeoutMs config", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      const diff = stored.expiresAt.getTime() - stored.createdAt.getTime();
      expect(diff).toBe(DEFAULT_SESSION_CONFIG.absoluteTimeoutMs);
    });

    it("should set createdAt and lastActivityAt to the same timestamp", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      expect(stored.createdAt.getTime()).toBe(stored.lastActivityAt.getTime());
    });

    it("should use a UUID v4 for the session ID", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should create sessions with different device info", async () => {
      const id1 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: { name: "Device A", platform: "iOS", userAgent: "Safari" },
        ipAddress: "10.0.0.1",
        refreshToken: "token-a",
      });
      const id2 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: { name: "Device B", platform: "Android", userAgent: "Chrome" },
        ipAddress: "10.0.0.2",
        refreshToken: "token-b",
      });

      expect(id1).not.toBe(id2);

      const s1 = await mockStore.findById(id1);
      const s2 = await mockStore.findById(id2);
      if (s1 === null || s2 === null) throw new Error("Expected sessions to exist");
      expect(s1.deviceInfo.name).toBe("Device A");
      expect(s2.deviceInfo.name).toBe("Device B");
    });
  });

  describe("validateSession", () => {
    it("should return session data for a valid active session", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const session = await sessionService.validateSession(sessionId, TEST_USER_ID);
      expect(session.id).toBe(sessionId);
      expect(session.userId).toBe(TEST_USER_ID);
      expect(session.revokedAt).toBeNull();
    });

    it("should throw for a non-existent session", async () => {
      await expect(sessionService.validateSession("non-existent-id", TEST_USER_ID)).rejects.toThrow(
        "Session not found",
      );
    });

    it("should throw for a revoked session", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      await sessionService.revokeSession(sessionId, TEST_USER_ID);

      await expect(sessionService.validateSession(sessionId, TEST_USER_ID)).rejects.toThrow(
        "Session revoked",
      );
    });

    it("should throw for an expired session (absolute timeout)", async () => {
      const expiredStore = new MockSessionStore();
      const pastDate = new Date(Date.now() - 1000);
      const session: Session = {
        id: "expired-session",
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshTokenHash: "hash",
        createdAt: new Date(Date.now() - 86400000),
        lastActivityAt: new Date(Date.now() - 1000),
        expiresAt: pastDate,
        revokedAt: null,
      };
      await expiredStore.save(session);

      const localService = new SessionService(DEFAULT_SESSION_CONFIG, expiredStore);

      await expect(localService.validateSession("expired-session", TEST_USER_ID)).rejects.toThrow(
        "Session expired",
      );
    });

    it("should throw for an idle session (idle timeout exceeded)", async () => {
      const idleConfig: SessionConfig = {
        idleTimeoutMs: 100,
        absoluteTimeoutMs: 86400000,
        rememberMeTimeoutMs: 2592000000,
      };
      const idleStore = new MockSessionStore();
      const oldActivity = new Date(Date.now() - 5000);
      const session: Session = {
        id: "idle-session",
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshTokenHash: "hash",
        createdAt: new Date(Date.now() - 10000),
        lastActivityAt: oldActivity,
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
      };
      await idleStore.save(session);

      const localService = new SessionService(idleConfig, idleStore);

      await expect(localService.validateSession("idle-session", TEST_USER_ID)).rejects.toThrow(
        "Session idle timeout",
      );
    });

    it("should throw for wrong user ID", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      await expect(sessionService.validateSession(sessionId, "wrong-user")).rejects.toThrow(
        "Session user mismatch",
      );
    });

    it("should succeed for a session right at the idle timeout boundary", async () => {
      const boundaryConfig: SessionConfig = {
        idleTimeoutMs: 5000,
        absoluteTimeoutMs: 86400000,
        rememberMeTimeoutMs: 2592000000,
      };
      const boundaryStore = new MockSessionStore();
      const session: Session = {
        id: "boundary-session",
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshTokenHash: "hash",
        createdAt: new Date(Date.now() - 3000),
        lastActivityAt: new Date(Date.now() - 3000),
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
      };
      await boundaryStore.save(session);

      const localService = new SessionService(boundaryConfig, boundaryStore);

      const result = await localService.validateSession("boundary-session", TEST_USER_ID);
      expect(result.id).toBe("boundary-session");
    });
  });

  describe("touchSession", () => {
    it("should update lastActivityAt to current time", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const before = new Date();

      await sessionService.touchSession(sessionId);

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      expect(stored.lastActivityAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should not throw for non-existent session", async () => {
      await expect(sessionService.touchSession("non-existent-id")).resolves.toBeUndefined();
    });

    it("should allow session to pass idle validation after touch", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      const idleConfig: SessionConfig = {
        idleTimeoutMs: 50,
        absoluteTimeoutMs: 86400000,
        rememberMeTimeoutMs: 2592000000,
      };
      const localService = new SessionService(idleConfig, mockStore);

      await new Promise((r) => setTimeout(r, 60));

      await expect(localService.validateSession(sessionId, TEST_USER_ID)).rejects.toThrow(
        "Session idle timeout",
      );

      await localService.touchSession(sessionId);

      const result = await localService.validateSession(sessionId, TEST_USER_ID);
      expect(result.id).toBe(sessionId);
    });
  });

  describe("revokeSession", () => {
    it("should mark session as revoked", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      await sessionService.revokeSession(sessionId, TEST_USER_ID);

      const stored = await mockStore.findById(sessionId);
      if (stored === null) throw new Error("Expected session to exist");
      expect(stored.revokedAt).not.toBeNull();
    });

    it("should throw for non-existent session", async () => {
      await expect(sessionService.revokeSession("non-existent-id", TEST_USER_ID)).rejects.toThrow(
        "Session not found",
      );
    });

    it("should throw for wrong user", async () => {
      const sessionId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "192.168.1.1",
        refreshToken: TEST_REFRESH_TOKEN,
      });

      await expect(sessionService.revokeSession(sessionId, "wrong-user")).rejects.toThrow(
        "Session user mismatch",
      );
    });
  });

  describe("revokeAllUserSessions", () => {
    it("should revoke all sessions for the user", async () => {
      const id1 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });
      const id2 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.2",
        refreshToken: "token-2",
      });

      await sessionService.revokeAllUserSessions(TEST_USER_ID);

      await expect(sessionService.validateSession(id1, TEST_USER_ID)).rejects.toThrow(
        "Session revoked",
      );
      await expect(sessionService.validateSession(id2, TEST_USER_ID)).rejects.toThrow(
        "Session revoked",
      );
    });

    it("should revoke all except the excluded session ID", async () => {
      const id1 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });
      const id2 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.2",
        refreshToken: "token-2",
      });

      await sessionService.revokeAllUserSessions(TEST_USER_ID, id1);

      await expect(sessionService.validateSession(id1, TEST_USER_ID)).resolves.toBeTruthy();
      await expect(sessionService.validateSession(id2, TEST_USER_ID)).rejects.toThrow(
        "Session revoked",
      );
    });

    it("should not affect sessions belonging to other users", async () => {
      const myId = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });
      const otherId = await sessionService.createSession({
        userId: "other-user",
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.2",
        refreshToken: "token-2",
      });

      await sessionService.revokeAllUserSessions(TEST_USER_ID);

      const otherSession = await mockStore.findById(otherId);
      if (otherSession === null) throw new Error("Expected other session to exist");
      expect(otherSession.revokedAt).toBeNull();
      expect(myId).toBeTruthy();
    });

    it("should not throw when user has no sessions", async () => {
      await expect(
        sessionService.revokeAllUserSessions("user-with-no-sessions"),
      ).resolves.toBeUndefined();
    });
  });

  describe("listUserSessions", () => {
    it("should return only non-revoked sessions for the user", async () => {
      const id1 = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });

      await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.2",
        refreshToken: "token-2",
      });

      await sessionService.revokeSession(id1, TEST_USER_ID);

      const sessions = await sessionService.listUserSessions(TEST_USER_ID);
      if (sessions[0] === undefined) throw new Error("Expected session to exist");
      expect(sessions[0].id).not.toBe(id1);
    });

    it("should return empty array for user with no sessions", async () => {
      const sessions = await sessionService.listUserSessions("non-existent-user");
      expect(sessions).toHaveLength(0);
    });

    it("should exclude revoked sessions", async () => {
      const id = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });

      const beforeRevoke = await sessionService.listUserSessions(TEST_USER_ID);
      expect(beforeRevoke).toHaveLength(1);

      await sessionService.revokeSession(id, TEST_USER_ID);

      const afterRevoke = await sessionService.listUserSessions(TEST_USER_ID);
      expect(afterRevoke).toHaveLength(0);
    });
  });

  describe("getActiveSessionCount", () => {
    it("should return count of active sessions", async () => {
      await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });
      await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.2",
        refreshToken: "token-2",
      });

      const count = await sessionService.getActiveSessionCount(TEST_USER_ID);
      expect(count).toBe(2);
    });

    it("should return 0 for user with no sessions", async () => {
      const count = await sessionService.getActiveSessionCount("non-existent-user");
      expect(count).toBe(0);
    });

    it("should exclude revoked sessions from count", async () => {
      const id = await sessionService.createSession({
        userId: TEST_USER_ID,
        deviceInfo: TEST_DEVICE,
        ipAddress: "10.0.0.1",
        refreshToken: "token-1",
      });

      expect(await sessionService.getActiveSessionCount(TEST_USER_ID)).toBe(1);

      await sessionService.revokeSession(id, TEST_USER_ID);

      expect(await sessionService.getActiveSessionCount(TEST_USER_ID)).toBe(0);
    });
  });
});

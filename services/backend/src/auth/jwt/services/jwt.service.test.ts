import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import jwt from "jsonwebtoken";
import { JwtService } from "./jwt.service.js";
import { JWT_CONFIG, type JwtConfig } from "../interfaces/jwt-config.interface.js";
import {
  REFRESH_TOKEN_STORE,
  type RefreshTokenStore,
  type RefreshTokenData,
} from "../interfaces/refresh-token-store.interface.js";

const TEST_SECRET = "test-secret-key-for-unit-tests";

const TEST_CONFIG: JwtConfig = {
  secret: TEST_SECRET,
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "30d",
  algorithm: "HS256",
  issuer: "test-issuer",
  audience: "test-audience",
};

const TEST_CLAIMS = {
  sub: "user-123",
  email: "user@example.com",
  role: "admin",
  organizationId: "org-456",
  workspaceId: "ws-789",
  sessionId: "session-001",
};

class MockRefreshTokenStore implements RefreshTokenStore {
  public readonly tokens = new Map<
    string,
    { userId: string; expiresAt: Date; consumed: boolean }
  >();

  public save(token: string, userId: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, { userId, expiresAt, consumed: false });
    return Promise.resolve();
  }

  public find(token: string): Promise<RefreshTokenData | null> {
    const entry = this.tokens.get(token);
    if (!entry) return Promise.resolve(null);
    return Promise.resolve({
      userId: entry.userId,
      expiresAt: entry.expiresAt,
      consumed: entry.consumed,
    });
  }

  public markConsumed(token: string, _replacedBy?: string): Promise<void> {
    const entry = this.tokens.get(token);
    if (entry) {
      entry.consumed = true;
    }
    return Promise.resolve();
  }

  public invalidateByUser(userId: string): Promise<void> {
    for (const [token, entry] of this.tokens) {
      if (entry.userId === userId) {
        this.tokens.delete(token);
      }
    }
    return Promise.resolve();
  }
}

describe("JwtService", () => {
  let jwtService: JwtService;
  let moduleRef: TestingModule;
  let mockStore: MockRefreshTokenStore;

  beforeAll(async () => {
    mockStore = new MockRefreshTokenStore();

    moduleRef = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: JWT_CONFIG, useValue: TEST_CONFIG },
        { provide: REFRESH_TOKEN_STORE, useValue: mockStore },
      ],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(() => {
    mockStore.tokens.clear();
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT with correct claims", () => {
      const token = jwtService.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      expect(decoded["sub"]).toBe(TEST_CLAIMS.sub);
      expect(decoded["email"]).toBe(TEST_CLAIMS.email);
      expect(decoded["role"]).toBe(TEST_CLAIMS.role);
      expect(decoded["iss"]).toBe(TEST_CONFIG.issuer);
      expect(decoded["aud"]).toBe(TEST_CONFIG.audience);
    });

    it("should default tokenVersion to 1 when not provided", () => {
      const token = jwtService.generateAccessToken({
        sub: "user-456",
        email: "test@test.com",
        role: "user",
      });
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      expect(decoded["tokenVersion"]).toBe(1);
    });

    it("should set null for optional fields when not provided", () => {
      const token = jwtService.generateAccessToken({
        sub: "user-456",
        email: "test@test.com",
        role: "user",
      });
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      expect(decoded["organizationId"]).toBeNull();
      expect(decoded["workspaceId"]).toBeNull();
      expect(decoded["sessionId"]).toBeNull();
    });

    it("should set expiration based on accessTokenExpiresIn config", () => {
      const token = jwtService.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(900);
    });

    it("should set iat to current timestamp", () => {
      const before = Math.floor(Date.now() / 1000);
      const token = jwtService.generateAccessToken(TEST_CLAIMS);
      const after = Math.floor(Date.now() / 1000);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const iat = Number(decoded["iat"]);
      expect(iat).toBeGreaterThanOrEqual(before);
      expect(iat).toBeLessThanOrEqual(after);
    });

    it("should generate different tokens for different claims", () => {
      const token1 = jwtService.generateAccessToken(TEST_CLAIMS);
      const token2 = jwtService.generateAccessToken({
        ...TEST_CLAIMS,
        email: "different@test.com",
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a 64-character hex string", () => {
      const token = jwtService.generateRefreshToken();

      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate unique tokens on each call", () => {
      const token1 = jwtService.generateRefreshToken();
      const token2 = jwtService.generateRefreshToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("generateTokenPair", () => {
    it("should return accessToken, refreshToken and expiresAt", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);

      expect(pair.accessToken).toBeTruthy();
      expect(typeof pair.accessToken).toBe("string");
      expect(pair.refreshToken).toBeTruthy();
      expect(typeof pair.refreshToken).toBe("string");
      expect(pair.expiresAt).toBeInstanceOf(Date);
      expect(pair.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should store the refresh token in the store", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      const stored = await mockStore.find(pair.refreshToken);

      if (stored === null) throw new Error("Expected stored token to exist");
      expect(stored.userId).toBe(TEST_CLAIMS.sub);
    });

    it("should include a valid access token", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      const decoded = jwt.verify(pair.accessToken, TEST_SECRET) as Record<string, unknown>;

      expect(decoded["sub"]).toBe(TEST_CLAIMS.sub);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid token and return claims", () => {
      const token = jwtService.generateAccessToken(TEST_CLAIMS);
      const claims = jwtService.verifyAccessToken(token);

      expect(claims.sub).toBe(TEST_CLAIMS.sub);
      expect(claims.email).toBe(TEST_CLAIMS.email);
      expect(claims.role).toBe(TEST_CLAIMS.role);
    });

    it("should throw for a token signed with a different secret", () => {
      const token = jwt.sign({ sub: "test", email: "a@b.com", role: "user" }, "wrong-secret");

      expect(() => jwtService.verifyAccessToken(token)).toThrow("Invalid or expired access token");
    });

    it("should throw for an expired token", () => {
      const expiredToken = jwt.sign(
        {
          sub: "test",
          email: "a@b.com",
          role: "user",
          exp: Math.floor(Date.now() / 1000) - 3600,
        },
        TEST_SECRET,
      );

      expect(() => jwtService.verifyAccessToken(expiredToken)).toThrow(
        "Invalid or expired access token",
      );
    });

    it("should throw for a malformed token string", () => {
      expect(() => jwtService.verifyAccessToken("not-a-valid-token")).toThrow(
        "Invalid or expired access token",
      );
    });

    it("should throw for an empty token", () => {
      expect(() => jwtService.verifyAccessToken("")).toThrow("Invalid or expired access token");
    });
  });

  describe("decodeAccessToken", () => {
    it("should decode a valid token without signature verification", () => {
      const token = jwtService.generateAccessToken(TEST_CLAIMS);
      const decoded = jwtService.decodeAccessToken(token);

      if (decoded === null) throw new Error("Expected decoded token to exist");
      expect(decoded.sub).toBe(TEST_CLAIMS.sub);
      expect(decoded.email).toBe(TEST_CLAIMS.email);
    });

    it("should decode a token with wrong signature (no verification)", () => {
      const token = jwt.sign({ sub: "hacker" }, "wrong-secret");
      const decoded = jwtService.decodeAccessToken(token);

      if (decoded === null) throw new Error("Expected decoded token to exist");
      expect(decoded.sub).toBe("hacker");
    });

    it("should return null for a completely invalid token", () => {
      const result = jwtService.decodeAccessToken("not-a-token-at-all");

      expect(result).toBeNull();
    });
  });

  describe("rotateRefreshToken", () => {
    it("should rotate a valid refresh token", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      const rotated = await jwtService.rotateRefreshToken(pair.refreshToken, TEST_CLAIMS);

      expect(rotated.accessToken).toBeTruthy();
      expect(rotated.refreshToken).toBeTruthy();
      expect(rotated.refreshToken).not.toBe(pair.refreshToken);
    });

    it("should mark the old token as consumed", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      await jwtService.rotateRefreshToken(pair.refreshToken, TEST_CLAIMS);

      const stored = await mockStore.find(pair.refreshToken);
      if (stored === null) throw new Error("Expected stored token to exist");
      expect(stored.consumed).toBe(true);
    });

    it("should throw for a non-existent token", async () => {
      await expect(
        jwtService.rotateRefreshToken("non-existent-token", TEST_CLAIMS),
      ).rejects.toThrow("Invalid refresh token");
    });

    it("should throw for an already consumed token", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      await jwtService.rotateRefreshToken(pair.refreshToken, TEST_CLAIMS);

      await expect(jwtService.rotateRefreshToken(pair.refreshToken, TEST_CLAIMS)).rejects.toThrow(
        "Refresh token already consumed",
      );
    });

    it("should throw for an expired token", async () => {
      const expiredStore = new MockRefreshTokenStore();
      await expiredStore.save("expired-token", TEST_CLAIMS.sub, new Date(Date.now() - 1000));

      const localService = new JwtService(TEST_CONFIG, expiredStore);

      await expect(localService.rotateRefreshToken("expired-token", TEST_CLAIMS)).rejects.toThrow(
        "Refresh token expired",
      );
    });

    it("should throw on user ID mismatch", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);

      await expect(
        jwtService.rotateRefreshToken(pair.refreshToken, {
          ...TEST_CLAIMS,
          sub: "wrong-user",
        }),
      ).rejects.toThrow("Refresh token user mismatch");
    });

    it("should generate a new token pair on successful rotation", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      const rotated = await jwtService.rotateRefreshToken(pair.refreshToken, TEST_CLAIMS);

      const decoded = jwt.verify(rotated.accessToken, TEST_SECRET) as Record<string, unknown>;
      expect(decoded["sub"]).toBe(TEST_CLAIMS.sub);

      const newStored = await mockStore.find(rotated.refreshToken);
      expect(newStored).not.toBeNull();
    });
  });

  describe("revokeRefreshToken", () => {
    it("should mark a token as consumed", async () => {
      const pair = await jwtService.generateTokenPair(TEST_CLAIMS);
      await jwtService.revokeRefreshToken(pair.refreshToken);

      const stored = await mockStore.find(pair.refreshToken);
      if (stored === null) throw new Error("Expected stored token to exist");
      expect(stored.consumed).toBe(true);
    });

    it("should not throw for a non-existent token", async () => {
      await expect(jwtService.revokeRefreshToken("non-existent")).resolves.toBeUndefined();
    });
  });

  describe("revokeAllUserTokens", () => {
    it("should remove all tokens for the given user", async () => {
      await jwtService.generateTokenPair(TEST_CLAIMS);
      await jwtService.generateTokenPair(TEST_CLAIMS);
      expect(mockStore.tokens.size).toBe(2);

      await jwtService.revokeAllUserTokens(TEST_CLAIMS.sub);
      expect(mockStore.tokens.size).toBe(0);
    });

    it("should not affect tokens belonging to other users", async () => {
      await jwtService.generateTokenPair(TEST_CLAIMS);
      await jwtService.generateTokenPair({
        sub: "other-user",
        email: "other@test.com",
        role: "user",
      });
      expect(mockStore.tokens.size).toBe(2);

      await jwtService.revokeAllUserTokens(TEST_CLAIMS.sub);
      expect(mockStore.tokens.size).toBe(1);
    });

    it("should not throw when user has no tokens", async () => {
      await expect(jwtService.revokeAllUserTokens("non-existent-user")).resolves.toBeUndefined();
    });
  });

  describe("getAccessTokenExpiration", () => {
    it("should return the access token expiration from config", () => {
      expect(jwtService.getAccessTokenExpiration()).toBe("15m");
    });
  });

  describe("getRefreshTokenExpiration", () => {
    it("should return the refresh token expiration from config", () => {
      expect(jwtService.getRefreshTokenExpiration()).toBe("30d");
    });
  });

  describe("parseExpiration (via access token generation)", () => {
    it("should parse seconds format", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "30s" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(30);
    });

    it("should parse minutes format", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "5m" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(300);
    });

    it("should parse hours format", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "2h" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(7200);
    });

    it("should parse days format", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "7d" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(604800);
    });

    it("should default to 900 seconds for unknown format", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "invalid" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(900);
    });

    it("should default to 900 seconds for empty string", () => {
      const config: JwtConfig = { ...TEST_CONFIG, accessTokenExpiresIn: "" };
      const service = new JwtService(config, mockStore);
      const token = service.generateAccessToken(TEST_CLAIMS);
      const decoded = jwt.verify(token, TEST_SECRET) as Record<string, unknown>;

      const diff = Number(decoded["exp"]) - Number(decoded["iat"]);
      expect(diff).toBe(900);
    });
  });
});

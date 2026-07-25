import { describe, it, expect, vi } from "vitest";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";
import { ConflictError, UnauthorizedError } from "@atlas/errors";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "./auth.controller.js";
import type { UserRegistrationService } from "../services/user-registration.service.js";
import type { AuthOrchestratorService } from "../services/auth-orchestrator.service.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";

function makeUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "user-1",
    email: "test@example.com",
    passwordHash: "hash",
    displayName: "Test",
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

function mockReply(): FastifyReply {
  return {
    setCookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis(),
    send: vi.fn(),
    status: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    getHeader: vi.fn(),
    getHeaders: vi.fn(),
    removeHeader: vi.fn().mockReturnThis(),
    hasHeader: vi.fn(),
    redirect: vi.fn(),
    type: vi.fn().mockReturnThis(),
    serializer: vi.fn(),
    then: vi.fn(),
    raw: {} as never,
    context: {} as never,
    request: {} as never,
    elapsedTime: 0,
    hijack: vi.fn(),
    callNotFound: vi.fn(),
    getResponseTime: vi.fn(),
    sent: false,
    statusCode: 200,
    server: {} as never,
    log: {} as never,
    trailers: {},
    hasTrailer: vi.fn(),
    trailer: vi.fn(),
    getTrailer: vi.fn(),
    removeTrailer: vi.fn(),
  } as unknown as FastifyReply;
}

describe("AuthController", () => {
  const mockTokenResponse = {
    accessToken: "access-123",
    refreshToken: "refresh-456",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: "user-1",
      email: "test@example.com",
      displayName: "Test",
      status: "active",
      avatarUrl: null,
      bio: null,
      timezone: null,
      theme: "system",
      locale: "en-US",
      emailNotifications: true,
      pushNotifications: true,
      createdAt: new Date(),
    },
  };

  const mockRegister = vi.fn().mockResolvedValue(mockTokenResponse);
  const mockLogin = vi.fn().mockResolvedValue(mockTokenResponse);
  const mockLogout = vi.fn().mockResolvedValue(undefined);
  const mockRefresh = vi.fn().mockResolvedValue({
    accessToken: "new-access",
    refreshToken: "new-refresh",
    expiresAt: new Date(Date.now() + 3600000),
  });
  const mockFindById = vi.fn();

  const registrationService = { register: mockRegister } as unknown as UserRegistrationService;
  const authOrchestrator = {
    login: mockLogin,
    logout: mockLogout,
    refresh: mockRefresh,
  } as unknown as AuthOrchestratorService;
  const userRepo = { findById: mockFindById } as unknown as UserRepository;

  const mockMetrics = {
    authRegisterTotal: { inc: () => {} },
    authLoginTotal: { inc: () => {} },
    authRefreshTokenTotal: { inc: () => {} },
  } as never;
  const mockEmailVerification = { verifyToken: vi.fn() } as never;
  const mockSessionService = { listUserSessions: vi.fn().mockResolvedValue([]) } as never;

  const controller = new AuthController(
    registrationService,
    authOrchestrator,
    userRepo,
    mockMetrics,
    mockEmailVerification,
    mockSessionService,
  );

  const testRequest = {} as unknown as FastifyRequest;
  const testRequestWithIp = { ip: "127.0.0.1" } as unknown as FastifyRequest;
  const testRequestWithUser = {
    ip: "127.0.0.1",
    user: { sub: "user-1", sessionId: "session-1" },
  } as unknown as FastifyRequest;
  const testRequestWithSub = {
    ip: "127.0.0.1",
    user: { sub: "user-1" },
  } as unknown as FastifyRequest;
  const testRequestWithNonexistent = {
    ip: "127.0.0.1",
    user: { sub: "nonexistent" },
  } as unknown as FastifyRequest;

  describe("register", () => {
    it("should return token response on success", async () => {
      const result = await controller.register(
        { email: "a@b.com", password: "StrongP@ss1aaa", displayName: "User" } as unknown as never,
        testRequestWithIp,
      );

      expect(result).toEqual(mockTokenResponse);
    });

    it("should throw ConflictError on duplicate email", async () => {
      mockRegister.mockRejectedValueOnce(new ConflictError("Email already registered"));

      await expect(controller.register({} as unknown as never, testRequestWithIp)).rejects.toThrow(
        ConflictError,
      );
    });

    it("should propagate IP address from request to service", async () => {
      await controller.register(
        { email: "a@b.com", password: "StrongP@ss1aaa", displayName: "User" } as unknown as never,
        testRequestWithIp,
      );

      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: "127.0.0.1" }),
      );
    });
  });

  describe("login", () => {
    it("should return token response on success", async () => {
      const reply = mockReply();
      await controller.login(
        { email: "a@b.com", password: "pass" } as unknown as never,
        testRequestWithIp,
        reply,
      );

      expect(reply.send).toHaveBeenCalled();
      expect(reply.setCookie).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException on invalid credentials", async () => {
      mockLogin.mockRejectedValueOnce(new UnauthorizedError("Invalid email or password"));

      await expect(controller.login({} as unknown as never, testRequestWithIp, mockReply())).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should propagate IP address from request to login service", async () => {
      await controller.login(
        { email: "a@b.com", password: "pass" } as unknown as never,
        testRequestWithIp,
        mockReply(),
      );

      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: "127.0.0.1" }),
      );
    });
  });

  describe("logout", () => {
    it("should succeed for authenticated user", async () => {
      await expect(controller.logout(testRequestWithUser, mockReply())).resolves.toBeUndefined();
    });

    it("should throw UnauthorizedException when no user", async () => {
      await expect(controller.logout(testRequest, mockReply())).rejects.toThrow(UnauthorizedException);
    });

    it("should pass user ID and session ID from request to service", async () => {
      await controller.logout(testRequestWithUser, mockReply());

      expect(mockLogout).toHaveBeenCalledWith("user-1", "session-1");
    });
  });

  describe("refresh", () => {
    it("should return new token pair", async () => {
      const reply = mockReply();
      const requestWithCookie = {
        cookies: { refresh_token: "valid-token" },
      } as unknown as FastifyRequest;
      await controller.refresh(requestWithCookie, reply);

      expect(reply.send).toHaveBeenCalled();
      expect(reply.setCookie).toHaveBeenCalled();
    });

    it("should throw UnauthorizedException on invalid token", async () => {
      mockRefresh.mockRejectedValueOnce(new Error("Invalid refresh token"));
      const requestWithCookie = {
        cookies: { refresh_token: "bad" },
      } as unknown as FastifyRequest;

      await expect(controller.refresh(requestWithCookie, mockReply())).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      mockFindById.mockResolvedValueOnce(makeUserRecord());
      const result = await controller.getProfile(testRequestWithSub);

      expect(result).toHaveProperty("id", "user-1");
      expect(result).toHaveProperty("email", "test@example.com");
    });

    it("should throw UnauthorizedException when no user", async () => {
      await expect(controller.getProfile(testRequest)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockFindById.mockResolvedValueOnce(null);
      await expect(controller.getProfile(testRequestWithNonexistent)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

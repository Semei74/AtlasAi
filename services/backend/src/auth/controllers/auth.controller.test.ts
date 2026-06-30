/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi } from "vitest";
import { ConflictException, UnauthorizedException, NotFoundException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
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

  const controller = new AuthController(registrationService, authOrchestrator, userRepo);

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

    it("should throw ConflictException on duplicate email", async () => {
      mockRegister.mockRejectedValueOnce(new Error("Email already registered"));

      await expect(controller.register({} as unknown as never, testRequestWithIp)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("login", () => {
    it("should return token response on success", async () => {
      const result = await controller.login(
        { email: "a@b.com", password: "pass" } as unknown as never,
        testRequestWithIp,
      );

      expect(result).toEqual(mockTokenResponse);
    });

    it("should throw UnauthorizedException on invalid credentials", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Invalid email or password"));

      await expect(controller.login({} as unknown as never, testRequestWithIp)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("should succeed for authenticated user", async () => {
      await expect(controller.logout(testRequestWithUser)).resolves.toBeUndefined();
    });

    it("should throw UnauthorizedException when no user", async () => {
      await expect(controller.logout(testRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    it("should return new token pair", async () => {
      const result = await controller.refresh({ refreshToken: "valid-token" } as unknown as never);

      expect(result).toHaveProperty("accessToken");
    });

    it("should throw UnauthorizedException on invalid token", async () => {
      mockRefresh.mockRejectedValueOnce(new Error("Invalid refresh token"));

      await expect(controller.refresh({ refreshToken: "bad" } as unknown as never)).rejects.toThrow(
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

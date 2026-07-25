import { describe, it, expect, vi } from "vitest";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { UserController } from "./user.controller.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import type { UpdateProfileRequest } from "../dto/update-profile-request.dto.js";
import type { UpdatePreferencesRequest } from "../dto/update-preferences-request.dto.js";

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
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

describe("UserController", () => {
  const mockFindById = vi.fn();
  const mockUpdate = vi.fn();

  const userRepo = { findById: mockFindById, update: mockUpdate } as unknown as UserRepository;
  const controller = new UserController(userRepo);

  const testRequest = {} as unknown as FastifyRequest;
  const testRequestWithUser = { user: { sub: "user-1" } } as unknown as FastifyRequest;

  describe("updateProfile", () => {
    it("should update and return profile", async () => {
      const existing = makeUser();
      const updated = makeUser({ displayName: "New Name", updatedAt: new Date() });

      mockFindById.mockResolvedValueOnce(existing);
      mockUpdate.mockResolvedValueOnce(updated);

      const body: UpdateProfileRequest = { displayName: "New Name" } as UpdateProfileRequest;
      const result = await controller.updateProfile(body, testRequestWithUser);

      expect(result).toHaveProperty("displayName", "New Name");
    });

    it("should update all optional profile fields", async () => {
      const existing = makeUser();
      const updated = makeUser({
        displayName: "Full Update",
        bio: "Updated bio",
        avatarUrl: "https://example.com/new-avatar.png",
        timezone: "Europe/London",
        updatedAt: new Date(),
      });

      mockFindById.mockResolvedValueOnce(existing);
      mockUpdate.mockResolvedValueOnce(updated);

      const body: UpdateProfileRequest = {
        displayName: "Full Update",
        bio: "Updated bio",
        avatarUrl: "https://example.com/new-avatar.png",
        timezone: "Europe/London",
      } as UpdateProfileRequest;

      const result = await controller.updateProfile(body, testRequestWithUser);

      expect(result).toHaveProperty("displayName", "Full Update");
      expect(result).toHaveProperty("bio", "Updated bio");
      expect(result).toHaveProperty("avatarUrl", "https://example.com/new-avatar.png");
      expect(result).toHaveProperty("timezone", "Europe/London");
    });

    it("should throw UnauthorizedException when no user", async () => {
      const body: UpdateProfileRequest = {} as UpdateProfileRequest;
      await expect(controller.updateProfile(body, testRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw NotFoundException when user not found", async () => {
      mockFindById.mockResolvedValueOnce(null);

      const body: UpdateProfileRequest = {} as UpdateProfileRequest;
      await expect(controller.updateProfile(body, testRequestWithUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getPreferences", () => {
    it("should return user preferences", async () => {
      const user = makeUser({
        theme: "dark",
        locale: "ru-RU",
        emailNotifications: false,
        pushNotifications: true,
      });

      mockFindById.mockResolvedValueOnce(user);
      const result = await controller.getPreferences(testRequestWithUser);

      expect(result).toEqual({
        theme: "dark",
        locale: "ru-RU",
        emailNotifications: false,
        pushNotifications: true,
      });
    });

    it("should throw UnauthorizedException when no user", async () => {
      await expect(controller.getPreferences(testRequest)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("updatePreferences", () => {
    it("should update and return preferences", async () => {
      const existing = makeUser();
      const updated = makeUser({ theme: "dark" });

      mockFindById.mockResolvedValueOnce(existing);
      mockUpdate.mockResolvedValueOnce(updated);

      const body: UpdatePreferencesRequest = { theme: "dark" } as UpdatePreferencesRequest;
      const result = await controller.updatePreferences(body, testRequestWithUser);

      expect(result).toHaveProperty("theme", "dark");
    });

    it("should throw UnauthorizedException when no user", async () => {
      const body: UpdatePreferencesRequest = {} as UpdatePreferencesRequest;
      await expect(controller.updatePreferences(body, testRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

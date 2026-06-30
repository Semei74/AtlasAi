/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi } from "vitest";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { PasswordController } from "./password.controller.js";
import type { PasswordManagementService } from "../password/services/password-management.service.js";
import type { PasswordResetService } from "../password/services/password-reset.service.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import type { ChangePasswordRequest } from "../dto/change-password-request.dto.js";
import type { ForgotPasswordRequest } from "../dto/forgot-password-request.dto.js";

describe("PasswordController", () => {
  const mockChangePassword = vi.fn();
  const mockResetPassword = vi.fn();
  const mockCreateResetToken = vi.fn();
  const mockFindByEmail = vi.fn();

  const passwordManagement = {
    changePassword: mockChangePassword,
    resetPassword: mockResetPassword,
  } as unknown as PasswordManagementService;
  const passwordReset = {
    createResetToken: mockCreateResetToken,
  } as unknown as PasswordResetService;
  const userRepo = { findByEmail: mockFindByEmail } as unknown as UserRepository;

  const controller = new PasswordController(passwordManagement, passwordReset, userRepo);

  const testRequest = {} as unknown as FastifyRequest;
  const testRequestWithUser = { user: { sub: "user-1" } } as unknown as FastifyRequest;

  describe("changePassword", () => {
    it("should succeed with valid current password", async () => {
      mockChangePassword.mockResolvedValueOnce({ success: true, failureReason: null });

      const result = await controller.changePassword(
        {
          currentPassword: "old",
          newPassword: "NewStrongP@ss1",
        } as unknown as ChangePasswordRequest,
        testRequestWithUser,
      );

      expect(result).toEqual({ success: true });
    });

    it("should throw UnauthorizedException when no user", async () => {
      await expect(
        controller.changePassword({} as unknown as ChangePasswordRequest, testRequest),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw BadRequestException on failure", async () => {
      mockChangePassword.mockResolvedValueOnce({
        success: false,
        failureReason: "Current password is incorrect",
      });

      await expect(
        controller.changePassword(
          {
            currentPassword: "wrong",
            newPassword: "NewStrongP@ss1",
          } as unknown as ChangePasswordRequest,
          testRequestWithUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("forgotPassword", () => {
    it("should return message regardless of whether email exists", async () => {
      mockFindByEmail.mockResolvedValueOnce(null);

      const result = await controller.forgotPassword({
        email: "nonexistent@example.com",
      } as unknown as ForgotPasswordRequest);

      expect(result.message).toContain("reset");
    });

    it("should create reset token when user exists", async () => {
      const user = { id: "user-1", email: "test@example.com" } as UserRecord;

      mockFindByEmail.mockResolvedValueOnce(user);

      const result = await controller.forgotPassword({
        email: "test@example.com",
      } as unknown as ForgotPasswordRequest);

      expect(mockCreateResetToken).toHaveBeenCalledWith("user-1");
      expect(result.message).toContain("reset");
    });
  });

  describe("resetPassword", () => {
    it("should succeed with valid token", async () => {
      mockResetPassword.mockResolvedValueOnce({ success: true, failureReason: null });

      const result = await controller.resetPassword({
        token: "valid-token",
        newPassword: "NewStrongP@ss1",
      } as unknown as never);

      expect(result).toEqual({ success: true });
    });

    it("should throw BadRequestException on failure", async () => {
      mockResetPassword.mockResolvedValueOnce({
        success: false,
        failureReason: "Invalid or expired token",
      });

      await expect(
        controller.resetPassword({
          token: "bad-token",
          newPassword: "NewStrongP@ss1",
        } as unknown as never),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

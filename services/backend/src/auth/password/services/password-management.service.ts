import { Inject, Injectable } from "@nestjs/common";
import type { PasswordChangeRequest } from "../dto/password-change-request.js";
import type { PasswordChangeResult } from "../dto/password-change-result.js";
import type { PasswordResetRequest } from "../dto/password-reset-request.js";
import { PasswordHashingService } from "./password-hashing.service.js";
import { PasswordPolicyService } from "./password-policy.service.js";
import { PasswordHistoryService } from "./password-history.service.js";
import { PasswordResetService } from "./password-reset.service.js";
import type { UserRepository } from "../../interfaces/user-repository.interface.js";
import { USER_REPOSITORY } from "../../providers/email-password.provider.js";

@Injectable()
export class PasswordManagementService {
  public constructor(
    @Inject(PasswordHashingService) private readonly hashingService: PasswordHashingService,
    @Inject(PasswordPolicyService) private readonly policyService: PasswordPolicyService,
    @Inject(PasswordHistoryService) private readonly historyService: PasswordHistoryService,
    @Inject(PasswordResetService) private readonly resetService: PasswordResetService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  public async changePassword(request: PasswordChangeRequest): Promise<PasswordChangeResult> {
    const userRecord = await this.userRepository.findById(request.userId);

    if (!userRecord) {
      return { success: false, failureReason: "User not found" };
    }

    const isValidCurrent = await this.hashingService.verify(
      userRecord.passwordHash,
      request.currentPassword,
    );

    if (!isValidCurrent) {
      return { success: false, failureReason: "Current password is incorrect" };
    }

    const validation = this.policyService.validate(request.newPassword, {
      email: userRecord.email,
    });

    if (!validation.valid) {
      return { success: false, failureReason: validation.errors.join("; ") };
    }

    const reused = await this.historyService.isPasswordReused(request.userId, request.newPassword);

    if (reused) {
      return { success: false, failureReason: "Password has been used recently" };
    }

    const newHash = await this.hashingService.hash(request.newPassword);
    await this.historyService.recordPassword(request.userId, newHash);

    return { success: true, failureReason: null };
  }

  public async resetPassword(request: PasswordResetRequest): Promise<PasswordChangeResult> {
    const userId = await this.resetService.verifyResetToken(request.token);

    if (!userId) {
      return { success: false, failureReason: "Invalid or expired reset token" };
    }

    const userRecord = await this.userRepository.findById(userId);

    if (!userRecord) {
      return { success: false, failureReason: "User not found" };
    }

    const validation = this.policyService.validate(request.newPassword, {
      email: userRecord.email,
    });

    if (!validation.valid) {
      return { success: false, failureReason: validation.errors.join("; ") };
    }

    const reused = await this.historyService.isPasswordReused(userId, request.newPassword);

    if (reused) {
      return { success: false, failureReason: "Password has been used recently" };
    }

    const newHash = await this.hashingService.hash(request.newPassword);
    await this.historyService.recordPassword(userId, newHash);
    await this.resetService.consumeResetToken(request.token);

    return { success: true, failureReason: null };
  }
}

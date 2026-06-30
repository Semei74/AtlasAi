import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../authorization/guards/auth.guard.js";
import { PasswordManagementService } from "../password/services/password-management.service.js";
import { PasswordResetService } from "../password/services/password-reset.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";
import { ChangePasswordRequest } from "../dto/change-password-request.dto.js";
import { ForgotPasswordRequest } from "../dto/forgot-password-request.dto.js";

class ResetPasswordBody {
  @IsString()
  @MinLength(1)
  public readonly token!: string;

  @IsString()
  @MinLength(8)
  public readonly newPassword!: string;
}

@ApiTags("Password")
@Controller()
export class PasswordController {
  public constructor(
    @Inject(PasswordManagementService)
    private readonly passwordManagement: PasswordManagementService,
    @Inject(PasswordResetService) private readonly passwordReset: PasswordResetService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  @Post("/auth/change-password")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change current user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async changePassword(
    @Body() body: ChangePasswordRequest,
    @Req() request: FastifyRequest,
  ): Promise<{ success: boolean }> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const result = await this.passwordManagement.changePassword({
      userId: user.sub,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    if (!result.success) {
      throw new BadRequestException(result.failureReason ?? "Password change failed");
    }

    return { success: true };
  }

  @Post("/auth/forgot-password")
  @HttpCode(202)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 202, description: "Reset email sent if account exists" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async forgotPassword(@Body() body: ForgotPasswordRequest): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(body.email.toLowerCase().trim());

    if (user !== null) {
      await this.passwordReset.createResetToken(user.id);
    }

    return { message: "If the email exists, a reset link has been sent" };
  }

  @Post("/auth/reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset password using reset token" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async resetPassword(@Body() body: ResetPasswordBody): Promise<{ success: boolean }> {
    const result = await this.passwordManagement.resetPassword({
      token: body.token,
      newPassword: body.newPassword,
    });

    if (!result.success) {
      throw new BadRequestException(result.failureReason ?? "Password reset failed");
    }

    return { success: true };
  }
}

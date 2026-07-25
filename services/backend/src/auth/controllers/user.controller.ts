import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../authorization/guards/auth.guard.js";
import { SkipTenant } from "../../tenant/decorators/skip-tenant.decorator.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";
import { UpdateProfileRequest } from "../dto/update-profile-request.dto.js";
import { UpdatePreferencesRequest } from "../dto/update-preferences-request.dto.js";

@ApiTags("Users")
@Controller()
@UseGuards(AuthGuard)
@SkipTenant()
@ApiBearerAuth()
export class UserController {
  public constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  @Patch("/users/me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Req() request: FastifyRequest,
  ): Promise<unknown> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const existing = await this.userRepository.findById(user.sub);

    if (existing === null) {
      throw new NotFoundException("User not found");
    }

    const changes: Record<string, unknown> = {};

    if (body.displayName !== undefined) {
      changes["displayName"] = body.displayName;
    }

    if (body.avatarUrl !== undefined) {
      changes["avatarUrl"] = body.avatarUrl;
    }

    if (body.bio !== undefined) {
      changes["bio"] = body.bio;
    }

    if (body.timezone !== undefined) {
      changes["timezone"] = body.timezone;
    }

    const updated = await this.userRepository.update(user.sub, changes);

    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      status: updated.status,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      timezone: updated.timezone,
      theme: updated.theme,
      locale: updated.locale,
      emailNotifications: updated.emailNotifications,
      pushNotifications: updated.pushNotifications,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  @Get("/users/preferences")
  @ApiOperation({ summary: "Get current user preferences" })
  @ApiResponse({ status: 200, description: "User preferences" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public async getPreferences(@Req() request: FastifyRequest): Promise<unknown> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const record = await this.userRepository.findById(user.sub);

    if (record === null) {
      throw new NotFoundException("User not found");
    }

    return {
      theme: record.theme,
      locale: record.locale,
      emailNotifications: record.emailNotifications,
      pushNotifications: record.pushNotifications,
    };
  }

  @Patch("/users/preferences")
  @ApiOperation({ summary: "Update current user preferences" })
  @ApiResponse({ status: 200, description: "Preferences updated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async updatePreferences(
    @Body() body: UpdatePreferencesRequest,
    @Req() request: FastifyRequest,
  ): Promise<unknown> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const existing = await this.userRepository.findById(user.sub);

    if (existing === null) {
      throw new NotFoundException("User not found");
    }

    const changes: Record<string, unknown> = {};

    if (body.theme !== undefined) {
      changes["theme"] = body.theme;
    }

    if (body.locale !== undefined) {
      changes["locale"] = body.locale;
    }

    if (body.emailNotifications !== undefined) {
      changes["emailNotifications"] = body.emailNotifications;
    }

    if (body.pushNotifications !== undefined) {
      changes["pushNotifications"] = body.pushNotifications;
    }

    const updated = await this.userRepository.update(user.sub, changes);

    return {
      theme: updated.theme,
      locale: updated.locale,
      emailNotifications: updated.emailNotifications,
      pushNotifications: updated.pushNotifications,
    };
  }
}

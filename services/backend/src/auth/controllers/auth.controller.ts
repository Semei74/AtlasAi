import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Inject,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthGuard } from "../authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../authorization/guards/auth.guard.js";
import { UserRegistrationService } from "../services/user-registration.service.js";
import { AuthOrchestratorService } from "../services/auth-orchestrator.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";
import { RegisterRequest } from "../dto/register-request.dto.js";
import { LoginRequest } from "../dto/login-request.dto.js";
import { RefreshRequest } from "../dto/refresh-request.dto.js";

@ApiTags("Authentication")
@Controller()
export class AuthController {
  public constructor(
    @Inject(UserRegistrationService) private readonly registrationService: UserRegistrationService,
    @Inject(AuthOrchestratorService) private readonly authOrchestrator: AuthOrchestratorService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  @Post("/auth/register")
  @HttpCode(201)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async register(
    @Body() body: RegisterRequest,
    @Req() request: FastifyRequest,
  ): Promise<unknown> {
    try {
      return await this.registrationService.register({
        email: body.email,
        password: body.password,
        displayName: body.displayName,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
        timezone: body.timezone,
        theme: body.theme,
        locale: body.locale,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        deviceName: body.deviceName,
        devicePlatform: body.devicePlatform,
        ipAddress: request.ip,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Email already registered") {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post("/auth/login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async login(@Body() body: LoginRequest, @Req() request: FastifyRequest): Promise<unknown> {
    try {
      return await this.authOrchestrator.login({
        email: body.email,
        password: body.password,
        deviceName: body.deviceName,
        devicePlatform: body.devicePlatform,
        ipAddress: request.ip,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Authentication failed" ||
          error.message.includes("Invalid email or password"))
      ) {
        throw new UnauthorizedException("Invalid email or password");
      }
      throw error;
    }
  }

  @Post("/auth/logout")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout current session" })
  @ApiResponse({ status: 204, description: "Logout successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public async logout(@Req() request: FastifyRequest): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.authOrchestrator.logout(user.sub, user.sessionId ?? "");
  }

  @Post("/auth/refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async refresh(@Body() body: RefreshRequest): Promise<unknown> {
    try {
      return await this.authOrchestrator.refresh(body.refreshToken);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @Get("/auth/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  public async getProfile(@Req() request: FastifyRequest): Promise<unknown> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const record = await this.userRepository.findById(user.sub);

    if (record === null) {
      throw new NotFoundException("User not found");
    }

    return {
      id: record.id,
      email: record.email,
      displayName: record.displayName,
      status: record.status,
      avatarUrl: record.avatarUrl,
      bio: record.bio,
      timezone: record.timezone,
      theme: record.theme,
      locale: record.locale,
      emailNotifications: record.emailNotifications,
      pushNotifications: record.pushNotifications,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

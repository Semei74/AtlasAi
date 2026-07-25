import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Inject,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UnauthorizedError } from "@atlas/errors";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, seconds } from "@nestjs/throttler";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthGuard } from "../authorization/guards/auth.guard.js";
import type { RequestWithUser } from "../authorization/guards/auth.guard.js";
import { SkipTenant } from "../../tenant/decorators/skip-tenant.decorator.js";
import { MetricsService } from "../../metrics/metrics.service.js";
import { UserRegistrationService } from "../services/user-registration.service.js";
import { AuthOrchestratorService } from "../services/auth-orchestrator.service.js";
import { EmailVerificationService } from "../services/email-verification.service.js";
import { SessionService } from "../session/services/session.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";
import { RegisterRequest } from "../dto/register-request.dto.js";
import { LoginRequest } from "../dto/login-request.dto.js";

@ApiTags("Authentication")
@Controller()
@SkipTenant()
export class AuthController {
  public constructor(
    @Inject(UserRegistrationService) private readonly registrationService: UserRegistrationService,
    @Inject(AuthOrchestratorService) private readonly authOrchestrator: AuthOrchestratorService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(MetricsService) private readonly metricsService: MetricsService,
    @Inject(EmailVerificationService) private readonly emailVerificationService: EmailVerificationService,
    @Inject(SessionService) private readonly sessionService: SessionService,
  ) {}

  @Post("/auth/register")
  @HttpCode(201)
  @Throttle({ default: { limit: 3, ttl: seconds(3600), blockDuration: seconds(3600) } })
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async register(
    @Body() body: RegisterRequest,
    @Req() request: FastifyRequest,
  ): Promise<unknown> {
    try {
      const result = await this.registrationService.register({
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

      this.metricsService.authRegisterTotal.inc({ status: "success" });

      return result;
    } catch (error) {
      this.metricsService.authRegisterTotal.inc({ status: "failure" });
      throw error;
    }
  }

  @Post("/auth/login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: seconds(60), blockDuration: seconds(300) } })
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 423, description: "Account locked due to too many failed attempts" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async login(@Body() body: LoginRequest, @Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    try {
      const result = await this.authOrchestrator.login({
        email: body.email,
        password: body.password,
        deviceName: body.deviceName,
        devicePlatform: body.devicePlatform,
        ipAddress: request.ip,
        rememberMe: body.rememberMe,
      });

      const maxAge = Math.floor((result.expiresAt.getTime() - Date.now()) / 1000);

      void reply.setCookie("refresh_token", result.refreshToken, {
        path: "/auth/refresh",
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: Math.max(0, maxAge),
      });

      this.metricsService.authLoginTotal.inc({ status: "success" });

      void reply.send({
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
        user: result.user,
      });
    } catch (error) {
      this.metricsService.authLoginTotal.inc({ status: "failure" });
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException(error.message);
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
  public async logout(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    const user = (request as RequestWithUser).user;
    const refreshToken = request.cookies["refresh_token"];

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.authOrchestrator.logoutWithRefreshToken(user.sub, user.sessionId ?? "", refreshToken);

    void reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    void reply.code(204).send();
  }

  @Post("/auth/logout/all")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout all active sessions" })
  @ApiResponse({ status: 204, description: "All sessions logged out" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public async logoutAll(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    await this.authOrchestrator.logoutAllWithRefreshToken(user.sub, user.sessionId ?? "");

    void reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    void reply.code(204).send();
  }

  @Post("/auth/refresh")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: seconds(60), blockDuration: seconds(120) } })
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async refresh(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<void> {
    const refreshToken = request.cookies["refresh_token"] ?? (request.body as { refreshToken?: string }).refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }

    try {
      const result = await this.authOrchestrator.refresh(refreshToken);

      const maxAge = Math.floor((result.expiresAt.getTime() - Date.now()) / 1000);

      void reply.setCookie("refresh_token", result.refreshToken, {
        path: "/auth/refresh",
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: Math.max(0, maxAge),
      });

      this.metricsService.authRefreshTokenTotal.inc({ status: "success" });

      void reply.send({
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      this.metricsService.authRefreshTokenTotal.inc({ status: "failure" });
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Invalid refresh token",
      );
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

  @Post("/auth/verify-email")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: seconds(60), blockDuration: seconds(300) } })
  @ApiOperation({ summary: "Verify email address with verification token" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  @ApiResponse({ status: 422, description: "Validation error" })
  public async verifyEmail(@Body("token") token: string): Promise<{ success: boolean }> {
    const userId = await this.emailVerificationService.verifyToken(token);

    if (!userId) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    return { success: true };
  }

  @Get("/auth/sessions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List active sessions for current user" })
  @ApiResponse({ status: 200, description: "List of active sessions" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public async listSessions(@Req() request: FastifyRequest): Promise<unknown> {
    const user = (request as RequestWithUser).user;

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const sessions = await this.sessionService.listUserSessions(user.sub);

    return sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActivityAt: s.lastActivityAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      current: s.id === user.sessionId,
    }));
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { UnauthorizedError, ConflictError, NotFoundError } from "@atlas/errors";
import { AuthService } from "../auth.service.js";
import { AuthProviderType } from "../interfaces/auth-provider.interface.js";
import { JwtService } from "../jwt/services/jwt.service.js";
import { REFRESH_TOKEN_STORE } from "../jwt/interfaces/refresh-token-store.interface.js";
import type { RefreshTokenStore } from "../jwt/interfaces/refresh-token-store.interface.js";
import { SessionService } from "../session/services/session.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";
import type { AuthTokenResponse } from "../dto/auth-token-response.dto.js";
import type { TokenPair } from "../jwt/dto/token-pair.dto.js";
import { AccountLockoutService } from "./account-lockout.service.js";
import { AuthAuditService } from "./auth-audit.service.js";

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly deviceName: string | undefined;
  readonly devicePlatform: string | undefined;
  readonly ipAddress: string;
  readonly rememberMe?: boolean | undefined;
}

@Injectable()
export class AuthOrchestratorService {
  public constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(SessionService) private readonly sessionService: SessionService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_STORE) private readonly refreshTokenStore: RefreshTokenStore,
    @Inject(AccountLockoutService) private readonly lockoutService: AccountLockoutService,
    @Inject(AuthAuditService) private readonly auditService: AuthAuditService,
  ) {}

  public async login(input: LoginInput): Promise<AuthTokenResponse> {
    const lockoutId = input.email.toLowerCase().trim();
    const lockoutStatus = await this.lockoutService.isLocked(lockoutId);

    if (lockoutStatus.locked) {
      this.auditService.loginFailure({
        userId: null,
        email: input.email,
        ipAddress: input.ipAddress,
        userAgent: "Unknown",
        metadata: { reason: "account_locked" },
      });

      throw new UnauthorizedError("Account is temporarily locked. Try again later.");
    }

    const authResult = await this.authService.authenticate(AuthProviderType.EmailPassword, {
      email: input.email,
      password: input.password,
    });

    if (!authResult.success || authResult.userId === null) {
      const updatedStatus = await this.lockoutService.recordFailedAttempt(lockoutId);

      this.auditService.loginFailure({
        userId: null,
        email: input.email,
        ipAddress: input.ipAddress,
        userAgent: "Unknown",
        metadata: {
          reason: authResult.failureReason ?? "invalid_credentials",
          remainingAttempts: updatedStatus.remainingAttempts,
        },
      });

      if (updatedStatus.locked) {
        this.auditService.accountLockout({
          userId: null,
          email: input.email,
          ipAddress: input.ipAddress,
          userAgent: "Unknown",
          metadata: { lockedUntil: updatedStatus.lockedUntil?.toISOString() },
        });
      }

      throw new UnauthorizedError("Invalid email or password");
    }

    const [user] = await Promise.all([
      this.userRepository.findById(authResult.userId),
      this.lockoutService.clearFailedAttempts(lockoutId),
    ]);

    if (user === null) {
      throw new NotFoundError("User");
    }

    const tokenPair = await this.jwtService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.status === "active" ? "user" : "viewer",
    });

    await this.sessionService.createSession({
      userId: user.id,
      deviceInfo: {
        name: input.deviceName ?? "Unknown",
        platform: input.devicePlatform ?? "Unknown",
        userAgent: "Unknown",
      },
      ipAddress: input.ipAddress,
      refreshToken: tokenPair.refreshToken,
      rememberMe: input.rememberMe,
    });

    this.auditService.loginSuccess({
      userId: user.id,
      email: user.email,
      ipAddress: input.ipAddress,
      userAgent: "Unknown",
      metadata: input.rememberMe ? { rememberMe: true } : null,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresAt: tokenPair.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        timezone: user.timezone,
        theme: user.theme,
        locale: user.locale,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        createdAt: user.createdAt,
      },
    };
  }

  public async logout(userId: string, sessionId: string, refreshToken?: string): Promise<void> {
    try {
      await this.sessionService.revokeSession(sessionId, userId);
    } catch {
      // Session already invalid — proceed with token cleanup
    }

    if (refreshToken !== undefined) {
      try {
        await this.jwtService.revokeRefreshToken(refreshToken);
      } catch {
        // Token already consumed — safe to ignore
      }
    }
  }

  public async logoutAll(userId: string, currentSessionId: string): Promise<void> {
    await Promise.all([
      this.sessionService.revokeAllUserSessions(userId, currentSessionId),
      this.jwtService.revokeAllUserTokens(userId),
    ]);
  }

  public async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenData = await this.refreshTokenStore.find(refreshToken);

    if (tokenData === null) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (tokenData.consumed) {
      await this.refreshTokenStore.invalidateFamily(tokenData.tokenFamily);
      throw new ConflictError("Refresh token already consumed");
    }

    if (Date.now() > tokenData.expiresAt.getTime()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = await this.userRepository.findById(tokenData.userId);

    if (user === null) {
      throw new NotFoundError("User");
    }

    return this.jwtService.rotateRefreshToken(refreshToken, {
      sub: user.id,
      email: user.email,
      role: user.status === "active" ? "user" : "viewer",
    });
  }

  public async logoutWithRefreshToken(userId: string, sessionId: string, refreshToken?: string): Promise<void> {
    try {
      await this.sessionService.revokeSession(sessionId, userId);
    } catch {
      // Session already invalid — proceed with token cleanup
    }

    if (refreshToken !== undefined) {
      try {
        await this.jwtService.revokeRefreshToken(refreshToken);
      } catch {
        // Token already consumed — safe to ignore
      }
    }

    await this.refreshTokenStore.invalidateByUser(userId);
  }

  public async logoutAllWithRefreshToken(userId: string, sessionId: string): Promise<void> {
    await Promise.all([
      this.sessionService.revokeAllUserSessions(userId, sessionId),
      this.jwtService.revokeAllUserTokens(userId),
      this.refreshTokenStore.invalidateByUser(userId),
    ]);
  }
}

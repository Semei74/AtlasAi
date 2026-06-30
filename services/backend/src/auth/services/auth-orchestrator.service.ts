import { Injectable, Inject } from "@nestjs/common";
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

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly deviceName: string | undefined;
  readonly devicePlatform: string | undefined;
  readonly ipAddress: string;
}

@Injectable()
export class AuthOrchestratorService {
  public constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(SessionService) private readonly sessionService: SessionService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_STORE) private readonly refreshTokenStore: RefreshTokenStore,
  ) {}

  public async login(input: LoginInput): Promise<AuthTokenResponse> {
    const authResult = await this.authService.authenticate(AuthProviderType.EmailPassword, {
      email: input.email,
      password: input.password,
    });

    if (!authResult.success || authResult.userId === null) {
      throw new Error(authResult.failureReason ?? "Authentication failed");
    }

    const user = await this.userRepository.findById(authResult.userId);

    if (user === null) {
      throw new Error("User not found");
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

  public async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenData = await this.refreshTokenStore.find(refreshToken);

    if (tokenData === null) {
      throw new Error("Invalid refresh token");
    }

    if (tokenData.consumed) {
      throw new Error("Refresh token already consumed");
    }

    if (Date.now() > tokenData.expiresAt.getTime()) {
      throw new Error("Refresh token expired");
    }

    const user = await this.userRepository.findById(tokenData.userId);

    if (user === null) {
      throw new Error("User not found");
    }

    return this.jwtService.rotateRefreshToken(refreshToken, {
      sub: user.id,
      email: user.email,
      role: user.status === "active" ? "user" : "viewer",
    });
  }
}

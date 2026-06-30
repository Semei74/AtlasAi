import { Injectable, Inject } from "@nestjs/common";
import crypto from "node:crypto";
import { PasswordHashingService } from "../password/services/password-hashing.service.js";
import { PasswordPolicyService } from "../password/services/password-policy.service.js";
import { JwtService } from "../jwt/services/jwt.service.js";
import { SessionService } from "../session/services/session.service.js";
import { USER_REPOSITORY } from "../providers/email-password.provider.js";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import type { AuthTokenResponse } from "../dto/auth-token-response.dto.js";

export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
  readonly avatarUrl: string | undefined;
  readonly bio: string | undefined;
  readonly timezone: string | undefined;
  readonly theme: string | undefined;
  readonly locale: string | undefined;
  readonly emailNotifications: boolean | undefined;
  readonly pushNotifications: boolean | undefined;
  readonly deviceName: string | undefined;
  readonly devicePlatform: string | undefined;
  readonly ipAddress: string;
}

@Injectable()
export class UserRegistrationService {
  public constructor(
    @Inject(PasswordHashingService) private readonly hashingService: PasswordHashingService,
    @Inject(PasswordPolicyService) private readonly policyService: PasswordPolicyService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(SessionService) private readonly sessionService: SessionService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  public async register(input: RegisterInput): Promise<AuthTokenResponse> {
    const existing = await this.userRepository.findByEmail(input.email.toLowerCase().trim());

    if (existing !== null) {
      throw new Error("Email already registered");
    }

    const validation = this.policyService.validate(input.password, {
      email: input.email,
    });

    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const passwordHash = await this.hashingService.hash(input.password);
    const userId = crypto.randomUUID();

    const newUser: Omit<UserRecord, "createdAt" | "updatedAt"> = {
      id: userId,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      displayName: input.displayName.trim(),
      status: "active",
      avatarUrl: input.avatarUrl ?? null,
      bio: input.bio ?? null,
      timezone: input.timezone ?? null,
      theme: input.theme ?? "system",
      locale: input.locale ?? "en-US",
      emailNotifications: input.emailNotifications ?? true,
      pushNotifications: input.pushNotifications ?? true,
    };

    const saved = await this.userRepository.create(newUser);

    const tokenPair = await this.jwtService.generateTokenPair({
      sub: userId,
      email: saved.email,
      role: "user",
    });

    await this.sessionService.createSession({
      userId,
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
        id: saved.id,
        email: saved.email,
        displayName: saved.displayName,
        status: saved.status,
        avatarUrl: saved.avatarUrl,
        bio: saved.bio,
        timezone: saved.timezone,
        theme: saved.theme,
        locale: saved.locale,
        emailNotifications: saved.emailNotifications,
        pushNotifications: saved.pushNotifications,
        createdAt: saved.createdAt,
      },
    };
  }
}

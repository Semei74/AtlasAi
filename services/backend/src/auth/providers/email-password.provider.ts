import { Injectable, Inject } from "@nestjs/common";
import { AuthProvider, AuthProviderType } from "../interfaces/auth-provider.interface.js";
import { AuthResult } from "../dto/auth-result.dto.js";
import { EmailPasswordCredentials } from "../dto/email-password-credentials.dto.js";
import { PasswordHashingService } from "../password/services/password-hashing.service.js";
import type { UserRepository } from "../interfaces/user-repository.interface.js";

export const USER_REPOSITORY = "USER_REPOSITORY";

@Injectable()
export class EmailPasswordProvider implements AuthProvider {
  public readonly type = AuthProviderType.EmailPassword;

  public constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PasswordHashingService) private readonly hashingService: PasswordHashingService,
  ) {}

  public async authenticate(credentials: unknown): Promise<AuthResult> {
    const cast = credentials as EmailPasswordCredentials;

    if (!cast.email || !cast.password) {
      return this.failure("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(cast.email.toLowerCase().trim());

    if (!user) {
      return this.failure("Invalid email or password");
    }

    const isValid = await this.hashingService.verify(user.passwordHash, cast.password);

    if (!isValid) {
      return this.failure("Invalid email or password");
    }

    return {
      success: true,
      userId: user.id,
      provider: this.type,
      failureReason: null,
    };
  }

  private failure(reason: string): AuthResult {
    return {
      success: false,
      userId: null,
      provider: this.type,
      failureReason: reason,
    };
  }
}

import { Injectable, Inject } from "@nestjs/common";
import { AuthProvider, AuthProviderType } from "./interfaces/auth-provider.interface.js";
import { AuthResult } from "./dto/auth-result.dto.js";

export const AUTH_PROVIDERS = "AUTH_PROVIDERS";

@Injectable()
export class AuthService {
  private readonly providerMap: Map<AuthProviderType, AuthProvider>;

  public constructor(@Inject(AUTH_PROVIDERS) providers: AuthProvider[]) {
    this.providerMap = new Map(providers.map((p) => [p.type, p]));
  }

  public async authenticate(type: AuthProviderType, credentials: unknown): Promise<AuthResult> {
    const provider = this.providerMap.get(type);

    if (!provider) {
      return {
        success: false,
        userId: null,
        provider: type,
        failureReason: `No authentication provider registered for '${type}'`,
      };
    }

    return provider.authenticate(credentials);
  }
}

import { Module } from "@nestjs/common";
import { AuthService, AUTH_PROVIDERS } from "./auth.service.js";
import { EmailPasswordProvider, USER_REPOSITORY } from "./providers/email-password.provider.js";
import { OAuth2Provider } from "./providers/oauth2.provider.js";
import { OpenIDConnectProvider } from "./providers/openid-connect.provider.js";
import { ApiKeyProvider } from "./providers/api-key.provider.js";
import { PasswordHashingService } from "./password/services/password-hashing.service.js";
import { PasswordPolicyService } from "./password/services/password-policy.service.js";
import { PasswordHistoryService } from "./password/services/password-history.service.js";
import { PasswordResetService } from "./password/services/password-reset.service.js";
import { PasswordExpirationService } from "./password/services/password-expiration.service.js";
import { PasswordManagementService } from "./password/services/password-management.service.js";
import { PASSWORD_HISTORY_STORE } from "./password/interfaces/password-history-store.interface.js";
import { PASSWORD_RESET_STORE } from "./password/interfaces/password-reset-store.interface.js";
import type { AuthProvider } from "./interfaces/auth-provider.interface.js";
import type { UserRepository } from "./interfaces/user-repository.interface.js";
import type { PasswordHistoryStore } from "./password/interfaces/password-history-store.interface.js";
import type { PasswordResetStore } from "./password/interfaces/password-reset-store.interface.js";

const DEFAULT_USER_REPOSITORY: UserRepository = {
  findByEmail(): never {
    throw new Error("UserRepository not configured. Provide a custom USER_REPOSITORY provider.");
  },
  findById(): never {
    throw new Error("UserRepository not configured. Provide a custom USER_REPOSITORY provider.");
  },
};

const DEFAULT_PASSWORD_HISTORY_STORE: PasswordHistoryStore = {
  add(): never {
    throw new Error(
      "PasswordHistoryStore not configured. Provide a custom PASSWORD_HISTORY_STORE provider.",
    );
  },
  getAll(): never {
    throw new Error(
      "PasswordHistoryStore not configured. Provide a custom PASSWORD_HISTORY_STORE provider.",
    );
  },
};

const DEFAULT_PASSWORD_RESET_STORE: PasswordResetStore = {
  save(): never {
    throw new Error(
      "PasswordResetStore not configured. Provide a custom PASSWORD_RESET_STORE provider.",
    );
  },
  find(): never {
    throw new Error(
      "PasswordResetStore not configured. Provide a custom PASSWORD_RESET_STORE provider.",
    );
  },
  markConsumed(): never {
    throw new Error(
      "PasswordResetStore not configured. Provide a custom PASSWORD_RESET_STORE provider.",
    );
  },
  invalidateByUser(): never {
    throw new Error(
      "PasswordResetStore not configured. Provide a custom PASSWORD_RESET_STORE provider.",
    );
  },
};

@Module({
  providers: [
    AuthService,
    EmailPasswordProvider,
    OAuth2Provider,
    OpenIDConnectProvider,
    ApiKeyProvider,
    PasswordHashingService,
    PasswordPolicyService,
    PasswordHistoryService,
    PasswordResetService,
    PasswordExpirationService,
    PasswordManagementService,
    {
      provide: USER_REPOSITORY,
      useValue: DEFAULT_USER_REPOSITORY,
    },
    {
      provide: PASSWORD_HISTORY_STORE,
      useValue: DEFAULT_PASSWORD_HISTORY_STORE,
    },
    {
      provide: PASSWORD_RESET_STORE,
      useValue: DEFAULT_PASSWORD_RESET_STORE,
    },
    {
      provide: AUTH_PROVIDERS,
      useFactory: (
        emailPassword: EmailPasswordProvider,
        oauth2: OAuth2Provider,
        openid: OpenIDConnectProvider,
        apiKey: ApiKeyProvider,
      ): AuthProvider[] => [emailPassword, oauth2, openid, apiKey],
      inject: [EmailPasswordProvider, OAuth2Provider, OpenIDConnectProvider, ApiKeyProvider],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

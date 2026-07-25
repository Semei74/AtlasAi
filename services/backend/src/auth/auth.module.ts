import { Module, Global } from "@nestjs/common";
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
import {
  PASSWORD_POLICY_CONFIG,
  DEFAULT_PASSWORD_POLICY,
} from "./password/interfaces/password-policy.interface.js";
import { JwtService } from "./jwt/services/jwt.service.js";
import { JWT_CONFIG, createJwtConfig } from "./jwt/interfaces/jwt-config.interface.js";
import { REFRESH_TOKEN_STORE } from "./jwt/interfaces/refresh-token-store.interface.js";
import { SessionService } from "./session/services/session.service.js";
import {
  SESSION_CONFIG,
  DEFAULT_SESSION_CONFIG,
} from "./session/interfaces/session-config.interface.js";
import { SESSION_STORE } from "./session/interfaces/session-store.interface.js";
import { AuthorizationService } from "./authorization/services/authorization.service.js";
import { AuthGuard } from "./authorization/guards/auth.guard.js";
import { RolesGuard } from "./authorization/guards/roles.guard.js";
import { UserRegistrationService } from "./services/user-registration.service.js";
import { AuthOrchestratorService } from "./services/auth-orchestrator.service.js";
import { AccountLockoutService } from "./services/account-lockout.service.js";
import { EmailVerificationService } from "./services/email-verification.service.js";
import { AuthAuditService } from "./services/auth-audit.service.js";
import { AuthController } from "./controllers/auth.controller.js";
import { UserController } from "./controllers/user.controller.js";
import { PasswordController } from "./controllers/password.controller.js";
import { UserRepositoryService } from "./services/user-repository.service.js";
import { SessionStoreService } from "./services/session-store.service.js";
import { RefreshTokenStoreService } from "./services/refresh-token-store.service.js";
import { PasswordHistoryStoreService } from "./services/password-history-store.service.js";
import { PasswordResetStoreService } from "./services/password-reset-store.service.js";
import type { AuthProvider } from "./interfaces/auth-provider.interface.js";

@Global()
@Module({
  controllers: [AuthController, UserController, PasswordController],
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
    JwtService,
    SessionService,
    AuthorizationService,
    AuthGuard,
    RolesGuard,
    UserRegistrationService,
    AuthOrchestratorService,
    AccountLockoutService,
    EmailVerificationService,
    AuthAuditService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryService,
    },
    {
      provide: PASSWORD_HISTORY_STORE,
      useClass: PasswordHistoryStoreService,
    },
    {
      provide: PASSWORD_RESET_STORE,
      useClass: PasswordResetStoreService,
    },
    {
      provide: PASSWORD_POLICY_CONFIG,
      useValue: DEFAULT_PASSWORD_POLICY,
    },
    {
      provide: JWT_CONFIG,
      useFactory: (): ReturnType<typeof createJwtConfig> => {
        return createJwtConfig();
      },
    },
    {
      provide: REFRESH_TOKEN_STORE,
      useClass: RefreshTokenStoreService,
    },
    {
      provide: SESSION_CONFIG,
      useValue: DEFAULT_SESSION_CONFIG,
    },
    {
      provide: SESSION_STORE,
      useClass: SessionStoreService,
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
  exports: [AuthService, JwtService, AuthorizationService, AuthGuard, RolesGuard],
})
export class AuthModule {}

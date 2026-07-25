export interface AuthenticationSettings {
  readonly allowedProviders: readonly string[];
  readonly defaultProvider: string;
  readonly enableRegistration: boolean;
  readonly enablePasswordReset: boolean;
  readonly enableSessionManagement: boolean;
}

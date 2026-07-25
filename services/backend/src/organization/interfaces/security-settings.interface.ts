export interface SecuritySettings {
  readonly sessionTimeoutMinutes: number;
  readonly requireMfa: boolean;
  readonly allowedIpRanges: readonly string[];
  readonly allowedEmailDomains: readonly string[];
  readonly maximumLoginAttempts: number;
}

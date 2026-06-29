import type { PasswordValidationResult } from "../dto/password-validation-result.js";

export interface PasswordPolicyConfig {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumber: boolean;
  readonly requireSpecialChar: boolean;
  readonly forbidCommonPasswords: boolean;
  readonly forbidEmailInclusion: boolean;
  readonly forbidSequentialChars: boolean;
  readonly expirationDays: number;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicyConfig = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  forbidCommonPasswords: true,
  forbidEmailInclusion: true,
  forbidSequentialChars: true,
  expirationDays: 90,
};

export interface PasswordPolicy {
  validate(password: string, context?: { email?: string }): PasswordValidationResult;
  readonly config: PasswordPolicyConfig;
}

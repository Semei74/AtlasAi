import type { PasswordValidationResult } from "../dto/password-validation-result.js";

export const PASSWORD_POLICY_CONFIG = "PASSWORD_POLICY_CONFIG";

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
  readonly commonPasswords: readonly string[];
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
  commonPasswords: [
    "password",
    "password123",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "qwertyuiop",
    "abcdefgh",
    "letmein",
    "welcome",
    "admin123",
    "iloveyou",
    "sunshine",
    "monkey",
    "dragon",
    "passw0rd",
    "master",
    "shadow",
    "trustno1",
    "football",
    "baseball",
    "abc123",
    "11111111",
    "00000000",
    "login",
  ],
};

export interface PasswordPolicy {
  validate(password: string, context?: { email?: string }): PasswordValidationResult;
  readonly config: PasswordPolicyConfig;
}

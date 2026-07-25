export interface PasswordValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export const VALID_PASSWORD: PasswordValidationResult = { valid: true, errors: [] };

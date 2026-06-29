export interface PasswordResetRequest {
  readonly token: string;
  readonly newPassword: string;
}

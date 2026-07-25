export interface PasswordChangeRequest {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
}

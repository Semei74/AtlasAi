export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string | null;
  theme: string;
  locale: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceName?: string;
  devicePlatform?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  theme?: string;
  locale?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  deviceName?: string;
  devicePlatform?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  organization: Organization;
  workspaces: Workspace[];
}

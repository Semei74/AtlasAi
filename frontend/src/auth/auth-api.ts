import { AUTH_CONFIG } from './config';
import { tokenStorage } from './token-storage';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokenResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUser,
  Membership,
} from './types';

class AuthApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${AUTH_CONFIG.apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.message ?? data.error ?? 'Request failed';
    const code = data.code ?? 'UNKNOWN';
    throw new AuthApiError(message, response.status, code);
  }

  return data as T;
}

export const authApi = {
  async login(body: LoginRequest): Promise<AuthTokenResponse> {
    const data = await request<AuthTokenResponse>(AUTH_CONFIG.endpoints.login, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data;
  },

  async register(body: RegisterRequest): Promise<AuthTokenResponse> {
    const data = await request<AuthTokenResponse>(AUTH_CONFIG.endpoints.register, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data;
  },

  async logout(): Promise<void> {
    await request<void>(AUTH_CONFIG.endpoints.logout, {
      method: 'POST',
    });
  },

  async refresh(): Promise<RefreshResponse> {
    const data = await request<RefreshResponse>(AUTH_CONFIG.endpoints.refresh, {
      method: 'POST',
    });
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const data = await request<AuthUser>(AUTH_CONFIG.endpoints.me);
    return data;
  },

  async forgotPassword(body: ForgotPasswordRequest): Promise<{ message: string }> {
    const data = await request<{ message: string }>(
      AUTH_CONFIG.endpoints.forgotPassword,
      { method: 'POST', body: JSON.stringify(body) },
    );
    return data;
  },

  async resetPassword(body: ResetPasswordRequest): Promise<{ success: boolean }> {
    const data = await request<{ success: boolean }>(
      AUTH_CONFIG.endpoints.resetPassword,
      { method: 'POST', body: JSON.stringify(body) },
    );
    return data;
  },

  async changePassword(body: { currentPassword: string; newPassword: string }): Promise<{ success: boolean }> {
    const data = await request<{ success: boolean }>(
      AUTH_CONFIG.endpoints.changePassword,
      { method: 'POST', body: JSON.stringify(body) },
    );
    return data;
  },

  async verifyEmail(body: { token: string }): Promise<{ success: boolean }> {
    const data = await request<{ success: boolean }>(
      AUTH_CONFIG.endpoints.verifyEmail,
      { method: 'POST', body: JSON.stringify(body) },
    );
    return data;
  },

  async getMemberships(): Promise<Membership[]> {
    const data = await request<Membership[]>(AUTH_CONFIG.endpoints.memberships);
    return data;
  },
};

export { AuthApiError };

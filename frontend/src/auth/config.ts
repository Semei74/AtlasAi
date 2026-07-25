const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const AUTH_CONFIG = {
  apiUrl: API_BASE_URL,
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    sessions: '/auth/sessions',
    memberships: '/users/me/memberships',
  },
  tokenKeys: {
    accessToken: 'atlas_access_token',
    refreshToken: 'atlas_refresh_token',
    user: 'atlas_user',
  },
  storageKeys: {
    onboardingComplete: 'atlas_onboarding_complete',
    lastEmail: 'atlas_last_email',
  },
} as const;

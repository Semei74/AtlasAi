import { authApi, AuthApiError } from './auth-api';
import { tokenStorage } from './token-storage';

export interface SessionInfo {
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  needsWorkspaceSelection: boolean;
}

export const sessionManager = {
  async initialize(): Promise<SessionInfo> {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      return {
        isAuthenticated: false,
        needsOnboarding: false,
        needsWorkspaceSelection: false,
      };
    }

    try {
      await authApi.refresh();
      await authApi.getMe();
      const onboardingComplete = await tokenStorage.getOnboardingComplete();

      return {
        isAuthenticated: true,
        needsOnboarding: !onboardingComplete,
        needsWorkspaceSelection: false,
      };
    } catch {
      await tokenStorage.clearAll();
      return {
        isAuthenticated: false,
        needsOnboarding: false,
        needsWorkspaceSelection: false,
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Proceed even if server call fails
    }
    await tokenStorage.clearAll();
  },

  async completeOnboarding(): Promise<void> {
    await tokenStorage.setOnboardingComplete(true);
  },
};

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@atlas/types";
import { rootLogger } from "@atlas/logger";
import { secureStorage } from "./secure-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
}

export interface AuthActions {
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setTokens: (accessToken: string) => void;
  setUser: (user: User) => void;
  refreshTokens: () => Promise<boolean>;
  restoreSession: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

const initialAuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isRestoring: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialAuthState,

      login(accessToken: string, user: User): void {
        set({
          accessToken,
          user,
          isAuthenticated: true,
          isRestoring: false,
        });
        rootLogger.info("User logged in", { userId: user.id });
      },

      logout(): void {
        const { accessToken } = get();
        set({ ...initialAuthState, isRestoring: false });
        void secureStorage.clearTokens();
        rootLogger.info("User logged out", { hadToken: !!accessToken });
      },

      setTokens(accessToken: string): void {
        set({ accessToken });
      },

      setUser(user: User): void {
        set({ user });
      },

      async refreshTokens(): Promise<boolean> {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          });

          if (!response.ok) return false;

          const data = (await response.json()) as {
            accessToken: string;
            expiresAt?: string;
          };
          set({
            accessToken: data.accessToken,
          });
          return true;
        } catch (error) {
          rootLogger.error("Token refresh failed", error instanceof Error ? error : new Error(String(error)));
          return false;
        }
      },

      async restoreSession(): Promise<void> {
        try {
          const refreshed = await get().refreshTokens();
          if (!refreshed) {
            set({ ...initialAuthState, isRestoring: false });
          }
        } catch {
          set({ ...initialAuthState, isRestoring: false });
        }
      },
    }),
    {
      name: "atlas-auth",
      storage: createJSONStorage(() => secureStorage),
      partialize: () => ({}),
    },
  ),
);

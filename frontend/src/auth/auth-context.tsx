import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { authApi } from './auth-api';
import { tokenStorage } from './token-storage';
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  Membership,
} from './types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  memberships: Membership[];
}

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: AuthUser) => void;
  setAuthState: (user: AuthUser, token: string) => Promise<void>;
  loadMemberships: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoring: true,
  memberships: [],
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    restoreSession();
  }, []);

  const setAuthState = useCallback(async (user: AuthUser, token: string) => {
    await tokenStorage.setAccessToken(token);
    setState({
      user,
      accessToken: token,
      isAuthenticated: true,
      isRestoring: false,
      memberships: [],
    });
    authApi.getMemberships().then((memberships) => {
      setState((prev) => ({ ...prev, memberships }));
    }).catch(() => {});
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    await setAuthState(response.user, response.accessToken);
  }, [setAuthState]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    await setAuthState(response.user, response.accessToken);
  }, [setAuthState]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed even if server logout fails
    }
    await tokenStorage.clearAll();
    setState({ ...initialState, isRestoring: false });
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.refresh();
      await tokenStorage.setAccessToken(response.accessToken);
      setState((prev) => ({
        ...prev,
        accessToken: response.accessToken,
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setState((prev) => ({ ...prev, isRestoring: false }));
        return;
      }

      const refreshed = await refreshSession();
      if (!refreshed) {
        await tokenStorage.clearAll();
        setState({ ...initialState, isRestoring: false });
        return;
      }

      const user = await authApi.getMe();
      setState({
        user,
        accessToken: token,
        isAuthenticated: true,
        isRestoring: false,
        memberships: [],
      });

      authApi.getMemberships().then((memberships) => {
        setState((prev) => ({ ...prev, memberships }));
      }).catch(() => {});
    } catch {
      await tokenStorage.clearAll();
      setState({ ...initialState, isRestoring: false });
    }
  }, [refreshSession]);

  const updateUser = useCallback((user: AuthUser) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const loadMemberships = useCallback(async () => {
    try {
      const memberships = await authApi.getMemberships();
      setState((prev) => ({ ...prev, memberships }));
    } catch {
      // Silently fail — memberships are non-critical
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      restoreSession,
      refreshSession,
      updateUser,
      setAuthState,
      loadMemberships,
    }),
    [state, login, register, logout, restoreSession, refreshSession, updateUser, setAuthState, loadMemberships],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

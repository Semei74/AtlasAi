import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, AuthApiError } from './auth-api';
import { tokenStorage } from './token-storage';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthTokenResponse,
  AuthUser,
  Membership,
} from './types';

export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  memberships: ['auth', 'memberships'] as const,
};

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response: AuthTokenResponse) => {
      await tokenStorage.setAccessToken(response.accessToken);
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, response.user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (response: AuthTokenResponse) => {
      await tokenStorage.setAccessToken(response.accessToken);
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, response.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      await tokenStorage.clearAll();
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
    onError: async () => {
      await tokenStorage.clearAll();
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (data: { token: string }) => authApi.verifyEmail(data),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
  });
}

export function useUserQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: () => authApi.getMe(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useMembershipsQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.memberships,
    queryFn: () => authApi.getMemberships(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export type { AuthApiError };

"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@atlas/api";
import { useAuthStore } from "@atlas/auth";
import { API_BASE_URL } from "./api-base-url";

type ApiClient = ReturnType<typeof createClient>;

/**
 * Shared API client for the web app, built on the existing `@atlas/api` package.
 *
 * The access token is read from the zustand auth store on every request, so a
 * silent refresh is reflected automatically. On a 401 the store is reset (which
 * also clears the persisted refresh token) and the query cache is cleared to
 * avoid leaking the previous user's data into the next session.
 */
export function useApi(): ApiClient {
  const queryClient = useQueryClient();
  return useMemo<ApiClient>(
    () =>
      createClient({
        baseUrl: API_BASE_URL,
        getAccessToken: () => useAuthStore.getState().accessToken,
        onAuthError: () => {
          queryClient.clear();
          useAuthStore.getState().logout();
        },
      }),
    [queryClient],
  );
}

"use client";

import { useAuthStore } from "@atlas/auth";
import { API_BASE_URL } from "./api-base-url";
import {
  parseAuthResponse,
  type AuthResponse,
  type ForgotPasswordValues,
  type LoginValues,
  type RegisterValues,
} from "./auth-schemas";

/**
 * Minimal typed POST helper. The generated OpenAPI client currently lacks the
 * request/response DTOs for the auth endpoints, so we call the API directly and
 * validate the response with Zod (see `auth-schemas.ts`).
 */
async function postJson<TResponse>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${String(response.status)}`);
  }

  return (await response.json()) as TResponse;
}

export async function loginRequest(values: LoginValues): Promise<AuthResponse> {
  return parseAuthResponse(await postJson("/auth/login", values));
}

export async function registerRequest(values: RegisterValues): Promise<AuthResponse> {
  return parseAuthResponse(await postJson("/auth/register", values));
}

export async function forgotPasswordRequest(values: ForgotPasswordValues): Promise<true> {
  await postJson("/auth/forgot-password", values);
  return true;
}

export async function logoutRequest(): Promise<true> {
  const token = useAuthStore.getState().accessToken;
  await postJson("/auth/logout", {}, token);
  return true;
}

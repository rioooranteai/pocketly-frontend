"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api";
import { useAuthStore } from "@/stores/auth";
import { ApiError } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import type { AuthLoginRequest, AuthRegisterRequest } from "@/types/api";

/**
 * useLogin — authenticates the user, persists token+user to the auth
 * store (Zustand, backed by localStorage), then redirects to dashboard.
 */
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: AuthLoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAuth(response);
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * useRegister — creates the account and auto-logs-in using the token
 * returned directly from the register endpoint (POST /api/v1/register
 * now returns {name, email, token} — no second login call needed).
 */
export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: AuthRegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response);
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * Extracts a user-friendly error message from a mutation error.
 * Falls back to a generic message for unexpected/network errors.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Terjadi kesalahan. Coba lagi.";
}

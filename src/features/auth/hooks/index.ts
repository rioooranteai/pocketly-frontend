"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "@/lib/constants";
import type { AuthLoginRequest, AuthRegisterRequest } from "@/types/api";

/**
 * useLogin — authenticates the user, persists token+user to the auth
 * store (Zustand, backed by localStorage), then redirects to dashboard.
 * Clears the query cache first in case a previous session ended without
 * a logout (e.g. expired token), so no stale data from another user leaks.
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: AuthLoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      queryClient.clear();
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
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: AuthRegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      queryClient.clear();
      setAuth(response);
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * useLogout — ends the session and wipes every cached query, so the next
 * user logging in on this browser never sees the previous user's data.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return () => {
    clearAuth();
    queryClient.clear();
    router.replace(ROUTES.AUTH.LOGIN);
  };
}

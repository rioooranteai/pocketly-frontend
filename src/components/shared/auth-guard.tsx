"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "@/lib/constants";

/**
 * Client-side route guard for protected pages. Redirects to /login when
 * there's no auth token. Waits one tick before checking so Zustand's
 * localStorage-persisted state has a chance to hydrate first — otherwise
 * every protected page would flash-redirect on refresh before the token
 * loads from storage.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return null;
  }

  return <>{children}</>;
}

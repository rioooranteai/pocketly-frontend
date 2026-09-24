"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { ROUTES } from "@/lib/constants";

const subscribeHydration = (onChange: () => void) =>
  useAuthStore.persist.onFinishHydration(onChange);
const getHydrated = () => useAuthStore.persist.hasHydrated();
// The server never sees localStorage, so it always renders "not hydrated".
const getServerHydrated = () => false;

/**
 * Client-side route guard for protected pages. Redirects to /login when
 * there's no auth token — but only after Zustand's persist middleware
 * has finished restoring state from localStorage, otherwise every
 * protected page would flash-redirect on refresh before the token loads.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrated,
    getServerHydrated
  );

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

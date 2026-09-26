import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSION_COOKIE, STORAGE_KEYS } from "@/lib/constants";
import type { User, AuthResponse } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;

  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
}

// The store used to persist under the key apiClient read as a raw token,
// so the stale entry has to go. Users with it simply log in again once.
if (typeof window !== "undefined") {
  localStorage.removeItem(STORAGE_KEYS.LEGACY_AUTH_TOKEN);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (response) => {
        set({
          token: response.token,
          user: {
            name: response.name,
            email: response.email,
          },
        });
      },

      clearAuth: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORE,
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Resync after restoring: the cookie can outlive a cleared
      // localStorage, which would make the proxy bounce /login ↔ /dashboard.
      onRehydrateStorage: () => (state) => syncSessionCookie(state?.token),
    }
  )
);

/**
 * Keeps the proxy's session cookie in step with the token. Must run
 * before any redirect that follows a login/logout, which it does because
 * store subscribers fire synchronously on set().
 */
function syncSessionCookie(token: string | null | undefined) {
  if (typeof document === "undefined") return;
  const { NAME, MAX_AGE } = SESSION_COOKIE;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = token
    ? `${NAME}=1; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
    : `${NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

useAuthStore.subscribe((state, prev) => {
  if (state.token !== prev.token) syncSessionCookie(state.token);
});

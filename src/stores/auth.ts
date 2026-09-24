import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User, AuthResponse } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;

  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
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

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORE,
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

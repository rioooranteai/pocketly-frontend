import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User, AuthResponse } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (response) => {
        set({
          token: response.token,
          user: {
            name: response.name,
            email: response.email,
          },
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI state that should persist across sessions (sidebar collapse state,
 * theme preference later, etc). Separate from auth store since this is
 * pure UI preference, not identity/session data.
 */
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "pocketly_ui",
    }
  )
);

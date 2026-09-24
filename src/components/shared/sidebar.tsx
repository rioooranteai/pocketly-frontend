"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  MessageCircle,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  Wallet,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/features/auth/hooks";
import { SidebarNavItem } from "@/components/shared/sidebar-nav-item";

// `comingSoon`: the page isn't built yet — shown disabled instead of
// linking to a 404. Drop the flag once the route exists.
const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Transactions", href: ROUTES.TRANSACTIONS.LIST, icon: Receipt },
  {
    label: "Chatbot",
    href: ROUTES.CHATBOT,
    icon: MessageCircle,
    comingSoon: true,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    comingSoon: true,
  },
  { label: "Profile", href: ROUTES.PROFILE, icon: User, comingSoon: true },
];

/**
 * Sidebar — fixed dark theme regardless of app color mode.
 * Two-column layout (ref: Untitled UI): a narrow icon rail on the left
 * (logo on top, avatar + logout at the bottom) and, when expanded, an
 * inset panel with the labeled nav. Collapsed: the panel slides away and
 * the nav icons move into the rail.
 *
 * Structure note: the toggle button lives OUTSIDE the rounded <aside>
 * (as a sibling in the relative wrapper), because the aside uses
 * overflow-hidden to clip its rounded corners — a child positioned
 * partially outside its bounds (-right-3) would get clipped too.
 *
 * `variant="drawer"`: rendered inside the mobile menu sheet — always
 * expanded, fills its container, no collapse toggle.
 */
export function Sidebar({
  variant = "rail",
  className,
}: {
  variant?: "rail" | "drawer";
  className?: string;
}) {
  const isDrawer = variant === "drawer";
  const storedCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const sidebarCollapsed = !isDrawer && storedCollapsed;
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={cn("relative h-full shrink-0", className)}>
      <aside
        className={cn(
          "flex h-full overflow-hidden rounded-3xl bg-sidebar text-sidebar-foreground",
          isDrawer && "w-full"
        )}
      >
        {/* Icon rail */}
        <div className="flex w-[68px] shrink-0 flex-col items-center py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet size={19} />
          </div>

          <nav
            aria-label="Navigasi utama"
            aria-hidden={!sidebarCollapsed || undefined}
            className={cn(
              "mt-6 flex flex-col items-center gap-1 transition-opacity duration-200",
              sidebarCollapsed ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {sidebarCollapsed &&
              NAV_ITEMS.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  {...item}
                  variant="icon"
                  isActive={isActive(item.href)}
                />
              ))}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-2">
            <button
              onClick={logout}
              title="Log Out"
              aria-label="Log Out"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <LogOut size={18} />
            </button>
            <div
              title={user?.name}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </div>

        {/* Inset panel — width animates to 0 when collapsed */}
        <div
          aria-hidden={sidebarCollapsed || undefined}
          className={cn(
            "overflow-hidden py-2 pr-2 transition-[width,opacity] duration-300 ease-in-out",
            isDrawer
              ? "flex-1"
              : sidebarCollapsed
                ? "w-0 opacity-0"
                : "w-[212px] opacity-100"
          )}
        >
          <div
            className={cn(
              "flex h-full flex-col rounded-2xl border border-sidebar-border bg-white/[0.02] px-3 py-4",
              !isDrawer && "w-[204px]"
            )}
          >
            <div className="px-2.5">
              <p className="text-[25px] font-bold text-white">Pocketly</p>
            </div>

            <nav
              aria-label="Navigasi utama"
              className="mt-6 flex flex-col gap-0.5"
            >
              {!sidebarCollapsed &&
                NAV_ITEMS.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    {...item}
                    variant="row"
                    isActive={isActive(item.href)}
                  />
                ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Collapse/expand toggle — sibling of <aside>, so it's never clipped
          by the aside's overflow-hidden. Positioned relative to this wrapper. */}
      {!isDrawer && (
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute -right-3 top-14 z-20 flex h-8 w-8 items-center justify-center",
            "rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground",
            "hover:bg-sidebar-accent hover:text-white transition-colors"
          )}
        >
          <ChevronLeft
            size={14}
            className={cn(
              "transition-transform duration-300",
              sidebarCollapsed && "rotate-180"
            )}
          />
        </button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Camera,
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

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Transactions", href: ROUTES.TRANSACTIONS.LIST, icon: Receipt },
  { label: "Scan Receipt", href: ROUTES.TRANSACTIONS.NEW, icon: Camera },
  { label: "Chatbot", href: ROUTES.CHATBOT, icon: MessageCircle },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
  { label: "Profile", href: ROUTES.PROFILE, icon: User },
] as const;

/**
 * Sidebar — fixed dark theme regardless of app color mode.
 * Expanded: logo, centered avatar + greeting, nav with text-color active
 * state (ref: Zarss). Collapsed: narrow icon-only rail (ref: Dappr).
 *
 * Structure note: the toggle button lives OUTSIDE the rounded <aside>
 * (as a sibling in the relative wrapper), because the aside uses
 * overflow-hidden to clip its rounded corners — a child positioned
 * partially outside its bounds (-right-3) would get clipped too.
 */
export function Sidebar() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };
  const pathname = usePathname();

  return (
    <div className="relative h-full shrink-0">
      <aside
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-3xl bg-sidebar text-sidebar-foreground",
          "transition-[width] duration-300 ease-in-out",
          sidebarCollapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        {/* Logo — always centered, larger text */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center justify-center px-4 translate-y-4",
            !sidebarCollapsed && "gap-2.5"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet size={18} />
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-white">Pocketly</span>
          )}
        </div>

        {/* Avatar + greeting — centered, like Zarss */}
        <div
          className={cn(
            "flex shrink-0 flex-col items-center translate-y-4",
            sidebarCollapsed ? "gap-0 pb-4" : "gap-3 px-4 pb-6 pt-1"
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 font-semibold text-white",
              sidebarCollapsed ? "h-11 w-11 text-sm" : "h-23 w-23 text-2xl"
            )}
          >
            {getInitials(user?.name)}
          </div>
          {!sidebarCollapsed && (
            <div className="text-center translate">
              <p className="text-xs text-sidebar-foreground/60">
                Welcome Back,
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {user?.name ?? "Guest"}
              </p>
            </div>
          )}
        </div>

        {/* Nav items — active state = colored icon tile + colored text */}
        <nav className="flex-1 space-y-1 px-3 mt-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={sidebarCollapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors",
                  sidebarCollapsed ? "justify-center px-0" : "px-2",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary/15 text-sidebar-primary"
                      : "bg-white/5 text-sidebar-foreground"
                  )}
                >
                  <Icon size={17} />
                </span>
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer: logout */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Log Out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground hover:text-white",
              sidebarCollapsed ? "justify-center px-0" : "px-2"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <LogOut size={17} />
            </span>
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Collapse/expand toggle — sibling of <aside>, so it's never clipped
          by the aside's overflow-hidden. Positioned relative to this wrapper. */}
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
    </div>
  );
}

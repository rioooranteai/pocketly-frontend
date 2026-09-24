import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
  /** Page not built yet — rendered disabled instead of linking to a 404. */
  comingSoon?: boolean;
}

/** One sidebar row — active state = colored icon tile + colored text. */
export function SidebarNavItem({
  label,
  href,
  icon: Icon,
  isActive,
  collapsed,
  comingSoon = false,
}: SidebarNavItemProps) {
  const rowClassName = cn(
    "flex items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors",
    collapsed ? "justify-center px-0" : "px-2"
  );

  const content = (
    <>
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
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && comingSoon && (
        <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px]">
          Segera
        </span>
      )}
    </>
  );

  if (comingSoon) {
    return (
      <span
        aria-disabled="true"
        title={`${label} (segera hadir)`}
        className={cn(
          rowClassName,
          "cursor-not-allowed text-sidebar-foreground opacity-50"
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        rowClassName,
        isActive
          ? "text-sidebar-primary"
          : "text-sidebar-foreground hover:text-white"
      )}
    >
      {content}
    </Link>
  );
}

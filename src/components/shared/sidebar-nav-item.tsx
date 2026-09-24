import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  /** "icon": square button in the narrow rail. "row": icon + label in the panel. */
  variant: "icon" | "row";
  /** Page not built yet — rendered disabled instead of linking to a 404. */
  comingSoon?: boolean;
}

/** One sidebar entry — active state = filled accent background. */
export function SidebarNavItem({
  label,
  href,
  icon: Icon,
  isActive,
  variant,
  comingSoon = false,
}: SidebarNavItemProps) {
  const isIcon = variant === "icon";

  const className = cn(
    "flex items-center rounded-lg text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    isIcon ? "h-10 w-10 justify-center" : "h-9 w-full gap-2.5 px-2.5",
    isActive
      ? "bg-sidebar-accent text-white"
      : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
    comingSoon &&
      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-sidebar-foreground"
  );

  const content = (
    <>
      <Icon
        size={isIcon ? 19 : 17}
        className={cn("shrink-0", isActive && "text-sidebar-primary")}
      />
      {!isIcon && <span className="truncate">{label}</span>}
      {!isIcon && comingSoon && (
        <span className="ml-auto rounded-md bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-foreground">
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
        className={className}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={isIcon ? label : undefined}
      aria-label={isIcon ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

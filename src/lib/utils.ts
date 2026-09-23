import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom color tokens defined via `@theme` in globals.css (design
 * system colors like `bg-primary`, `bg-sidebar`, `text-income`, etc).
 * twMerge doesn't know about them out of the box, so without this it
 * can't tell e.g. `bg-neutral-900` and `bg-sidebar` conflict — both
 * would survive a merge instead of the later one winning.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "background",
        "foreground",
        "card",
        "card-foreground",
        "popover",
        "popover-foreground",
        "primary",
        "primary-hover",
        "primary-foreground",
        "secondary",
        "secondary-foreground",
        "muted",
        "muted-foreground",
        "accent",
        "accent-foreground",
        "destructive",
        "destructive-foreground",
        "border",
        "input",
        "ring",
        "income",
        "income-foreground",
        "expense",
        "expense-foreground",
        "chart-1",
        "chart-2",
        "chart-3",
        "chart-4",
        "chart-5",
        "sidebar",
        "sidebar-foreground",
        "sidebar-primary",
        "sidebar-primary-foreground",
        "sidebar-accent",
        "sidebar-accent-foreground",
        "sidebar-border",
        "sidebar-ring",
      ],
    },
  },
});

/**
 * Merge Tailwind CSS classes safely.
 * Combines clsx for conditional classes + twMerge to handle Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to IDR (Indonesian Rupiah).
 * Example: 15000 -> "Rp 15.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable format.
 * Example: "2024-09-23" -> "23 Sep 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time.
 * Example: "2024-09-23T10:30:00Z" -> "23 Sep 2024, 10:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get initials from a full name for avatar fallback.
 * Example: "Mark Johnson" -> "MJ", "Rio" -> "R"
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

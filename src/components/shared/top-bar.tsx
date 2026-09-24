"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { useAuthStore } from "@/stores/auth";

interface TopBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Page top bar: search on the left (⌘K / Ctrl+K focuses it),
 * signed-in user on the right.
 */
export function TopBar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari…",
}: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] bg-card p-3 lg:px-4">
      <label className="flex h-11 w-full min-w-0 items-center gap-2.5 rounded-full bg-background px-4 text-muted-foreground focus-within:ring-2 focus-within:ring-ring sm:max-w-sm">
        <Search size={17} aria-hidden="true" />
        <span className="sr-only">Cari</span>
        <input
          ref={inputRef}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </label>

      {user && (
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

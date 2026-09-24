"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPageItems } from "@/lib/pagination";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const control =
  "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <nav
      aria-label="Paginasi"
      className={cn("flex items-center gap-1", className)}
    >
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(control, "hover:bg-muted")}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Phones: compact "2 / 5"; wider screens: numbered pages. */}
      <span className="px-2 text-sm tabular-nums text-muted-foreground sm:hidden">
        {page} / {totalPages}
      </span>
      <ul className="hidden items-center gap-1 sm:flex">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                aria-label={`Halaman ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  control,
                  item === page
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li
              key={item}
              aria-hidden="true"
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        aria-label="Halaman berikutnya"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(control, "hover:bg-muted")}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

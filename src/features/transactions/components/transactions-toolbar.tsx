"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
  CATEGORY_META,
  PRIMARY_FILTER_CATEGORIES,
} from "@/features/transactions/categories";
import {
  addMonths,
  formatMonthLabel,
  type CategoryFilter,
} from "@/features/transactions/list-utils";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/api";

interface TransactionsToolbarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  search: string;
  onSearchChange: (search: string) => void;
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

const SECONDARY_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (c) => !PRIMARY_FILTER_CATEGORIES.includes(c)
);

const pill =
  "h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const pillIdle = "border border-border bg-card text-foreground hover:bg-muted";
const pillActive = "bg-foreground text-background";

export function TransactionsToolbar({
  month,
  onMonthChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: TransactionsToolbarProps) {
  const secondaryActive = SECONDARY_CATEGORIES.includes(category as Category);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center justify-between gap-0.5 rounded-full border border-border bg-card p-1">
          <MonthButton
            label="Bulan sebelumnya"
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            <ChevronLeft size={18} />
          </MonthButton>
          <span
            aria-live="polite"
            className="min-w-[124px] px-2 text-center text-sm font-semibold capitalize"
          >
            {formatMonthLabel(month)}
          </span>
          <MonthButton
            label="Bulan berikutnya"
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            <ChevronRight size={18} />
          </MonthButton>
        </div>

        <label className="flex h-[46px] min-w-0 flex-1 items-center gap-2.5 rounded-full border border-border bg-card px-[18px] text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Cari transaksi</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari deskripsi atau item…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div
        role="group"
        aria-label="Filter kategori"
        className="flex min-w-0 gap-1.5 overflow-x-auto pb-1"
      >
        <FilterChip
          active={category === "all"}
          onClick={() => onCategoryChange("all")}
        >
          Semua
        </FilterChip>
        {PRIMARY_FILTER_CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={category === c}
            onClick={() => onCategoryChange(c)}
          >
            {CATEGORY_META[c].label}
          </FilterChip>
        ))}
        <div className="relative shrink-0">
          <label htmlFor="category-more" className="sr-only">
            Kategori lainnya
          </label>
          <select
            id="category-more"
            value={secondaryActive ? category : ""}
            onChange={(e) =>
              onCategoryChange((e.target.value || "all") as CategoryFilter)
            }
            className={cn(
              pill,
              "appearance-none pr-8",
              secondaryActive ? pillActive : pillIdle
            )}
          >
            <option value="">Kategori lain</option>
            {SECONDARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
              secondaryActive ? "text-background" : "text-foreground"
            )}
          />
        </div>
      </div>
    </div>
  );
}

function MonthButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(pill, active ? pillActive : pillIdle)}
    >
      {children}
    </button>
  );
}

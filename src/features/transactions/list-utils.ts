import type { Category, TransactionResponse } from "@/types/api";
import { getCategoryMeta } from "@/features/transactions/categories";
import { toDateInputValue } from "@/lib/utils";

export type CategoryFilter = Category | "all";

export interface TransactionFilters {
  /** Any date inside the month to show. */
  month: Date;
  search: string;
  category: CategoryFilter;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** "September 2026" */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function matchesCategory(tx: TransactionResponse, category: CategoryFilter) {
  if (category === "all") return true;
  // Categorization may fail on the backend and leave it empty.
  if (category === "uncategorized") {
    return !tx.category || tx.category === "uncategorized";
  }
  return tx.category === category;
}

function matchesSearch(tx: TransactionResponse, query: string) {
  if (!query) return true;
  return (
    tx.description.toLowerCase().includes(query) ||
    tx.items.some((item) => item.name.toLowerCase().includes(query))
  );
}

/**
 * Month + category + search (description or any item name), newest first.
 * Client-side because GET /transactions returns everything at once.
 */
export function filterTransactions(
  transactions: TransactionResponse[],
  { month, search, category }: TransactionFilters
): TransactionResponse[] {
  const query = search.trim().toLowerCase();
  return transactions
    .filter(
      (tx) =>
        isSameMonth(new Date(tx.date), month) &&
        matchesCategory(tx, category) &&
        matchesSearch(tx, query)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** "Hari ini · Kamis, 24 Sep", "Kemarin · Rabu, 23 Sep", "Senin, 21 Sep". */
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  const day = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });

  const key = toDateInputValue(date);
  if (key === toDateInputValue(now)) return `Hari ini · ${day}`;

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (key === toDateInputValue(yesterday)) return `Kemarin · ${day}`;

  return day;
}

export interface DayGroup {
  /** Local `yyyy-mm-dd`. */
  key: string;
  label: string;
  total: number;
  transactions: TransactionResponse[];
}

/** Groups already-sorted transactions by local calendar day, keeping order. */
export function groupByDay(
  transactions: TransactionResponse[],
  now: Date = new Date()
): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const tx of transactions) {
    const date = new Date(tx.date);
    const key = toDateInputValue(date);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, label: formatDayLabel(date, now), total: 0, transactions: [] };
      groups.push(group);
    }
    group.total += tx.total_amount;
    group.transactions.push(tx);
  }
  return groups;
}

export interface CategorySlice {
  key: string;
  label: string;
  amount: number;
  /** 0–1 of the total. */
  share: number;
}

export interface SpendingSummary {
  total: number;
  count: number;
  average: number;
  /** Biggest categories first; anything past `maxSlices` is one "Kategori lain" slice. */
  slices: CategorySlice[];
}

export function summarizeSpending(
  transactions: TransactionResponse[],
  maxSlices = 4
): SpendingSummary {
  const total = transactions.reduce((sum, tx) => sum + tx.total_amount, 0);

  const byCategory = new Map<string, number>();
  for (const tx of transactions) {
    const key = tx.category || "uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + tx.total_amount);
  }

  const sorted = [...byCategory.entries()]
    .map(([key, amount]) => ({ key, label: getCategoryMeta(key).label, amount }))
    .sort((a, b) => b.amount - a.amount);

  const head = sorted.slice(0, maxSlices);
  const rest = sorted.slice(maxSlices);
  if (rest.length > 0) {
    head.push({
      key: "__rest",
      label: "Kategori lain",
      amount: rest.reduce((sum, slice) => sum + slice.amount, 0),
    });
  }

  return {
    total,
    count: transactions.length,
    average: transactions.length > 0 ? total / transactions.length : 0,
    slices: head.map((slice) => ({
      ...slice,
      share: total > 0 ? slice.amount / total : 0,
    })),
  };
}

import { describe, expect, it } from "vitest";

import {
  addMonths,
  filterTransactions,
  formatDayLabel,
  groupByDay,
  startOfMonth,
} from "@/features/transactions/list-utils";
import type { TransactionResponse } from "@/types/api";

// Local-time dates (no "Z") so tests behave the same in any timezone.
function tx(
  id: string,
  date: string,
  amount: number,
  overrides: Partial<TransactionResponse> = {}
): TransactionResponse {
  return {
    id,
    description: `Transaksi ${id}`,
    category: "food",
    total_amount: amount,
    date,
    items: [{ name: `Item ${id}`, quantity: 1, price: amount }],
    ...overrides,
  };
}

const SEPT = new Date(2026, 8, 1);
const NOW = new Date(2026, 8, 24, 10, 0);

const data = [
  tx("a", "2026-09-24T08:00:00", 86500, { description: "Indomaret Kemang" }),
  tx("b", "2026-09-23T12:00:00", 200000, { category: "utilities" }),
  tx("c", "2026-09-24T19:00:00", 38000, { category: "transportation" }),
  tx("d", "2026-08-31T20:00:00", 50000),
  tx("e", "2026-09-21T09:00:00", 57800, {
    category: "",
    items: [{ name: "Telur ayam", quantity: 1, price: 57800 }],
  }),
];

describe("month helpers", () => {
  it("moves across year boundaries", () => {
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 1));
    expect(startOfMonth(new Date(2026, 8, 24))).toEqual(SEPT);
  });
});

describe("filterTransactions", () => {
  it("keeps only the selected month, newest first", () => {
    const result = filterTransactions(data, { month: SEPT, search: "", category: "all" });
    expect(result.map((t) => t.id)).toEqual(["c", "a", "b", "e"]);
  });

  it("searches description and item names, case-insensitively", () => {
    const byDescription = filterTransactions(data, { month: SEPT, search: "KEMANG", category: "all" });
    expect(byDescription.map((t) => t.id)).toEqual(["a"]);

    const byItem = filterTransactions(data, { month: SEPT, search: "telur", category: "all" });
    expect(byItem.map((t) => t.id)).toEqual(["e"]);
  });

  it("treats an empty category as uncategorized", () => {
    const result = filterTransactions(data, {
      month: SEPT,
      search: "",
      category: "uncategorized",
    });
    expect(result.map((t) => t.id)).toEqual(["e"]);
  });
});

describe("formatDayLabel", () => {
  it("prefixes today and yesterday", () => {
    expect(formatDayLabel(new Date(2026, 8, 24), NOW)).toMatch(/^Hari ini · /);
    expect(formatDayLabel(new Date(2026, 8, 23), NOW)).toMatch(/^Kemarin · /);
    expect(formatDayLabel(new Date(2026, 8, 21), NOW)).not.toMatch(/Hari ini|Kemarin/);
  });

  it("adds the year only outside the current year", () => {
    expect(formatDayLabel(new Date(2025, 8, 21), NOW)).toContain("2025");
    expect(formatDayLabel(new Date(2026, 8, 21), NOW)).not.toContain("2026");
  });
});

describe("groupByDay", () => {
  it("groups sorted transactions by local day with subtotals", () => {
    const sorted = filterTransactions(data, { month: SEPT, search: "", category: "all" });
    const groups = groupByDay(sorted, NOW);

    expect(groups.map((g) => g.key)).toEqual(["2026-09-24", "2026-09-23", "2026-09-21"]);
    expect(groups[0].total).toBe(86500 + 38000);
    expect(groups[0].transactions.map((t) => t.id)).toEqual(["c", "a"]);
  });

  it("keeps the whole-day subtotal when a day is split across pages", () => {
    const sorted = filterTransactions(data, { month: SEPT, search: "", category: "all" });
    // Page holding only the first of today's two transactions.
    const groups = groupByDay(sorted.slice(0, 1), NOW, sorted);

    expect(groups).toHaveLength(1);
    expect(groups[0].transactions).toHaveLength(1);
    expect(groups[0].total).toBe(86500 + 38000);
  });
});

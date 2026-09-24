import type { TransactionResponse } from "@/types/api";

export interface MonthlySummary {
  totalExpense: number;
  transactionCount: number;
  /** Category with the highest spend this month, or null when there's none. */
  topCategory: { name: string; amount: number } | null;
}

/** Aggregates the transactions dated in the same local month as `now`. */
export function summarizeMonth(
  transactions: TransactionResponse[],
  now: Date = new Date()
): MonthlySummary {
  const thisMonth = transactions.filter((tx) => {
    const date = new Date(tx.date);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  });

  const byCategory = new Map<string, number>();
  for (const tx of thisMonth) {
    const category = tx.category || "uncategorized";
    byCategory.set(category, (byCategory.get(category) ?? 0) + tx.total_amount);
  }

  let topCategory: MonthlySummary["topCategory"] = null;
  for (const [name, amount] of byCategory) {
    if (!topCategory || amount > topCategory.amount) {
      topCategory = { name, amount };
    }
  }

  return {
    totalExpense: thisMonth.reduce((sum, tx) => sum + tx.total_amount, 0),
    transactionCount: thisMonth.length,
    topCategory,
  };
}

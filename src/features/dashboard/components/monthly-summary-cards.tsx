"use client";

import { useTransactions } from "@/features/transactions/hooks";
import { summarizeMonth } from "@/features/dashboard/utils";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * This month's spending at a glance, derived client-side from the
 * transaction list. The backend only records expenses, so there's no
 * income/balance card until it exposes those.
 */
export function MonthlySummaryCards() {
  const { data: transactions, isLoading, isError } = useTransactions();

  if (isError) {
    return (
      <p className="text-sm text-expense">
        Gagal memuat ringkasan. Coba refresh halaman.
      </p>
    );
  }

  const summary = summarizeMonth(transactions ?? []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Pengeluaran bulan ini"
        value={`-${formatCurrency(summary.totalExpense)}`}
        valueClassName="text-expense"
        isLoading={isLoading}
      />
      <SummaryCard
        label="Transaksi bulan ini"
        value={String(summary.transactionCount)}
        isLoading={isLoading}
      />
      <SummaryCard
        label="Kategori terbesar"
        value={summary.topCategory?.name ?? "—"}
        hint={
          summary.topCategory
            ? formatCurrency(summary.topCategory.amount)
            : undefined
        }
        valueClassName="capitalize"
        isLoading={isLoading}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
  isLoading: boolean;
}

function SummaryCard({
  label,
  value,
  hint,
  valueClassName,
  isLoading,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-7 w-32 animate-pulse rounded-md bg-muted" />
      ) : (
        <p
          className={cn(
            "mt-1 text-2xl font-semibold text-foreground",
            valueClassName
          )}
        >
          {value}
        </p>
      )}
      {hint && !isLoading && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

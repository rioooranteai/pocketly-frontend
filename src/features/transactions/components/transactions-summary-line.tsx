"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import {
  addMonths,
  filterTransactions,
  formatMonthLabel,
  startOfMonth,
} from "@/features/transactions/list-utils";
import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionResponse } from "@/types/api";

interface TransactionsSummaryLineProps {
  transactions: TransactionResponse[] | undefined;
  month: Date;
  isLoading: boolean;
  isError: boolean;
}

function monthTotal(transactions: TransactionResponse[], month: Date) {
  const list = filterTransactions(transactions, { month, search: "", category: "all" });
  return {
    count: list.length,
    total: list.reduce((sum, tx) => sum + tx.total_amount, 0),
  };
}

/**
 * Subtitle under the greeting: how many transactions and how much was
 * spent in the selected month, plus the change vs the month before.
 * Ignores search/category so it always describes the whole month.
 */
export function TransactionsSummaryLine({
  transactions,
  month,
  isLoading,
  isError,
}: TransactionsSummaryLineProps) {
  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-full bg-muted"
      />
    );
  }

  if (isError || !transactions) {
    return (
      <p className="mt-1 text-sm text-muted-foreground">
        Ringkasan transaksi belum bisa dimuat.
      </p>
    );
  }

  const label = formatMonthLabel(month);
  const current = monthTotal(transactions, month);
  const previous = monthTotal(transactions, addMonths(month, -1));
  const isThisMonth =
    startOfMonth(new Date()).getTime() === startOfMonth(month).getTime();

  if (current.count === 0) {
    return (
      <p className="mt-1 text-sm text-muted-foreground">
        Belum ada transaksi di <span className="capitalize">{label}</span>. Yuk
        mulai catat pengeluaranmu.
      </p>
    );
  }

  const change =
    previous.total > 0
      ? Math.round(((current.total - previous.total) / previous.total) * 100)
      : null;
  const isUp = change !== null && change > 0;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <p>
        {isThisMonth ? (
          "Bulan ini kamu sudah mencatat"
        ) : (
          <>
            Di <span className="capitalize">{label}</span> kamu mencatat
          </>
        )}{" "}
        <span className="font-semibold text-foreground">
          {current.count} transaksi
        </span>{" "}
        senilai{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {formatCurrency(current.total)}
        </span>
      </p>

      {change !== null && change !== 0 && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
            isUp ? "bg-expense/10 text-expense" : "bg-income/10 text-income"
          )}
        >
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isUp ? "+" : "−"}
          {Math.abs(change)}% dari bulan lalu
        </span>
      )}
    </div>
  );
}

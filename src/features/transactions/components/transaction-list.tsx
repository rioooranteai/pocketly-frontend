"use client";

import Link from "next/link";
import { Receipt, Plus, Trash2 } from "lucide-react";

import { useTransactions, useDeleteTransaction } from "../hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function TransactionList() {
  const { data: transactions, isLoading, isError } = useTransactions();
  const deleteTransaction = useDeleteTransaction();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Memuat transaksi...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-expense">
        Gagal memuat transaksi. Coba refresh halaman.
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Receipt size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Belum ada transaksi
          </p>
          <p className="text-xs text-muted-foreground">
            Mulai catat pengeluaran kamu, manual atau scan struk.
          </p>
        </div>
        <Link href={ROUTES.TRANSACTIONS.NEW}>
          <Button size="sm" className="mt-1 bg-primary text-primary-foreground hover:bg-primary-hover">
            <Plus size={16} className="mr-1.5" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>
    );
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {sorted.map((tx, i) => (
        <div
          key={tx.id}
          className={cnRow(i === sorted.length - 1)}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Receipt size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {tx.description}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate capitalize">{tx.category}</span>
                <span>·</span>
                <span>{formatDate(tx.date)}</span>
                <span>·</span>
                <span>{tx.items.length} item</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="text-sm font-semibold text-expense">
              -{formatCurrency(tx.total_amount)}
            </p>
            <button
              onClick={() => {
                if (confirm(`Hapus transaksi "${tx.description}"?`)) {
                  deleteTransaction.mutate(tx.id);
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Hapus transaksi"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function cnRow(isLast: boolean) {
  return [
    "flex items-center justify-between gap-4 px-4 py-3.5",
    !isLast && "border-b border-border",
  ]
    .filter(Boolean)
    .join(" ");
}

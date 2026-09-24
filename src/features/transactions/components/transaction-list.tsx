"use client";

import { useState } from "react";
import { Receipt, Plus, Trash2 } from "lucide-react";

import {
  useTransactions,
  useDeleteTransaction,
} from "@/features/transactions/hooks";
import { getErrorMessage } from "@/lib/api-client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function TransactionList({ onAddClick }: { onAddClick: () => void }) {
  const { data: transactions, isLoading, isError } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  const [pendingDelete, setPendingDelete] =
    useState<TransactionResponse | null>(null);

  function askDelete(tx: TransactionResponse) {
    deleteTransaction.reset(); // drop an error left over from a previous attempt
    setPendingDelete(tx);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteTransaction.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  }

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
        <Button
          size="sm"
          variant="primary"
          onClick={onAddClick}
          className="mt-1"
        >
          <Plus size={16} className="mr-1.5" />
          Tambah Transaksi
        </Button>
      </div>
    );
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {sorted.map((tx, i) => (
          <div
            key={tx.id}
            className={cn(
              "flex items-center justify-between gap-4 px-4 py-3.5",
              i !== sorted.length - 1 && "border-b border-border"
            )}
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
                type="button"
                onClick={() => askDelete(tx)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Hapus transaksi ${tx.description}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Hapus transaksi?"
        description={`"${pendingDelete?.description ?? ""}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        onConfirm={confirmDelete}
        isPending={deleteTransaction.isPending}
        errorMessage={
          deleteTransaction.isError
            ? getErrorMessage(deleteTransaction.error, "Gagal menghapus transaksi.")
            : null
        }
      />
    </>
  );
}

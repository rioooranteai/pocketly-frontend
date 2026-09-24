"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SheetTitle } from "@/components/ui/sheet";
import {
  CategoryChip,
  CategoryTile,
} from "@/features/transactions/components/category-badge";
import { TransactionItemsTable } from "@/features/transactions/components/transaction-items-table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { TransactionResponse } from "@/types/api";

/** Read-only body of the detail sheet: header, meta, items, actions. */
export function TransactionDetailView({
  transaction: tx,
  onEdit,
  onDelete,
}: {
  transaction: TransactionResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const transactionDate = new Date(tx.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <p className="px-7 pt-7 text-[13px] font-semibold text-muted-foreground">
        Detail transaksi
      </p>

      <div className="flex flex-col gap-4 border-b border-border px-7 pb-6 pt-5">
        <div className="flex items-center gap-3">
          <CategoryTile category={tx.category} size="lg" />
          <CategoryChip category={tx.category} />
        </div>
        <div>
          <SheetTitle className="text-[22px] font-semibold tracking-tight">
            {tx.description}
          </SheetTitle>
          <p className="mt-1.5 text-[32px] font-semibold tracking-tight tabular-nums">
            {formatCurrency(tx.total_amount)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <MetaItem label="Tanggal transaksi" value={transactionDate} />
          {/* created_at: only shown once the backend includes it in the JSON. */}
          {tx.created_at && (
            <MetaItem label="Dicatat" value={formatDateTime(tx.created_at)} />
          )}
        </dl>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none px-7 py-5">
        <TransactionItemsTable items={tx.items} total={tx.total_amount} />
      </div>

      <div className="flex justify-between gap-3 border-t border-border p-5">
        <Button variant="outline" size="lg" className="gap-2 rounded-full px-5" onClick={onDelete}>
          <Trash2 size={16} />
          Hapus
        </Button>
        <Button size="lg" className="gap-2 rounded-full px-5" onClick={onEdit}>
          <Pencil size={16} />
          Edit transaksi
        </Button>
      </div>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-background px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

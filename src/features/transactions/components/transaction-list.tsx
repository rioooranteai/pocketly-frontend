"use client";

import { Fragment } from "react";
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  Plus,
  Receipt,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { CategoryTile } from "@/features/transactions/components/category-badge";
import {
  ListMessage,
  ListSkeleton,
} from "@/features/transactions/components/transaction-list-states";
import { getCategoryMeta } from "@/features/transactions/categories";
import type { DayGroup } from "@/features/transactions/list-utils";
import { formatCurrency } from "@/lib/utils";
import type { TransactionResponse } from "@/types/api";

export type AddMethod = "manual" | "scan";

interface TransactionListProps {
  groups: DayGroup[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (transaction: TransactionResponse) => void;
  onAdd: (method: AddMethod) => void;
  /** e.g. "September 2026" — used in the empty state. */
  monthLabel: string;
  /** Search or category filter active: empty means "no match", not "no data". */
  isFiltered: boolean;
  /** Range + page controls shown under the rows. */
  pagination: {
    page: number;
    totalPages: number;
    from: number;
    to: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function TransactionList({
  groups,
  isLoading,
  isError,
  onRetry,
  onSelect,
  onAdd,
  monthLabel,
  isFiltered,
  pagination,
}: TransactionListProps) {
  return (
    <section
      aria-label="Daftar transaksi"
      className="flex min-h-[320px] flex-col overflow-hidden rounded-[20px] bg-card"
    >
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ListMessage
          role="alert"
          icon={<AlertTriangle size={24} />}
          iconClassName="bg-category-health text-category-health-foreground"
          title="Gagal memuat transaksi"
          description="Periksa koneksi kamu, lalu coba lagi."
        >
          <Button variant="outline" className="gap-2 rounded-full" onClick={onRetry}>
            <RefreshCw size={16} />
            Coba lagi
          </Button>
        </ListMessage>
      ) : groups.length === 0 ? (
        isFiltered ? (
          <ListMessage
            icon={<Receipt size={24} />}
            title="Tidak ada transaksi yang cocok"
            description="Coba kata kunci atau kategori lain."
          />
        ) : (
          <ListMessage
            icon={<Receipt size={24} />}
            title={`Belum ada transaksi di ${monthLabel}`}
            description="Catat pengeluaran pertamamu — scan struk atau isi manual."
          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-full"
                onClick={() => onAdd("scan")}
              >
                <Camera size={16} />
                Scan Struk
              </Button>
              <Button className="gap-2 rounded-full" onClick={() => onAdd("manual")}>
                <Plus size={16} />
                Tambah Manual
              </Button>
            </div>
          </ListMessage>
        )
      ) : (
        <div className="pb-2">
          {groups.map((group, i) => (
            <Fragment key={group.key}>
              {i > 0 && <div className="mx-4 mt-1.5 h-px bg-border md:mx-6" />}
              <h2 className="flex justify-between px-4 pb-1.5 pt-3.5 text-xs font-semibold tracking-wide text-muted-foreground md:px-6">
                <span>{group.label}</span>
                <span className="tabular-nums">{formatCurrency(group.total)}</span>
              </h2>
              <ul>
                {group.transactions.map((tx) => (
                  <li key={tx.id}>
                    <TransactionRow transaction={tx} onSelect={onSelect} />
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
          <div className="mt-2 flex flex-col items-center gap-2 border-t border-border px-4 pt-3 sm:flex-row sm:justify-between md:px-6">
            <p className="text-xs tabular-nums text-muted-foreground">
              Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}{" "}
              transaksi
            </p>
            {pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TransactionRow({
  transaction: tx,
  onSelect,
}: {
  transaction: TransactionResponse;
  onSelect: (transaction: TransactionResponse) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tx)}
      className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition-colors hover:bg-background/60 focus-visible:bg-background/60 focus-visible:outline-none md:px-6"
    >
      <CategoryTile category={tx.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {tx.description}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {getCategoryMeta(tx.category).label} · {tx.items.length} item
        </p>
      </div>
      <span className="text-[15px] font-semibold tabular-nums text-foreground">
        {formatCurrency(tx.total_amount)}
      </span>
      <ChevronRight size={16} aria-hidden="true" className="text-muted-foreground" />
    </button>
  );
}

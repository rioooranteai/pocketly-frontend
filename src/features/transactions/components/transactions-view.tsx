"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AddTransactionModal,
  type AddTransactionStart,
} from "@/features/transactions/components/add-transaction-modal";
import { SpendingSummary } from "@/features/transactions/components/spending-summary";
import { TransactionDetailSheet } from "@/features/transactions/components/transaction-detail-sheet";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import { TransactionsToolbar } from "@/features/transactions/components/transactions-toolbar";
import { useTransactions } from "@/features/transactions/hooks";
import {
  filterTransactions,
  formatMonthLabel,
  groupByDay,
  startOfMonth,
  summarizeSpending,
  type CategoryFilter,
} from "@/features/transactions/list-utils";
import { ROUTES } from "@/lib/constants";

interface TransactionsViewProps {
  /** Opens the add modal on arrival (e.g. sidebar "Scan Receipt" → ?add=scan). */
  initialAdd?: Exclude<AddTransactionStart, "choose">;
}

export function TransactionsView({ initialAdd }: TransactionsViewProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useTransactions();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addStart, setAddStart] = useState<AddTransactionStart | null>(
    initialAdd ?? null
  );

  const isFiltered = search.trim() !== "" || category !== "all";
  const visible = filterTransactions(data ?? [], { month, search, category });
  const summary = summarizeSpending(visible);
  const groups = groupByDay(visible);
  // Read from the query cache so edits/deletes refresh the open sheet.
  const selected = data?.find((tx) => tx.id === selectedId) ?? null;

  function closeAddModal() {
    setAddStart(null);
    // Drop ?add=… so a refresh doesn't reopen the modal.
    if (initialAdd) router.replace(ROUTES.TRANSACTIONS.LIST);
  }

  return (
    <div className="space-y-5 pb-24 md:pb-4">
      <div className="flex items-end justify-between gap-4 md:px-2 md:pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[28px]">
            Transaksi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua pengeluaran yang sudah kamu catat.
          </p>
        </div>
        <div className="hidden gap-2 md:flex">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-5"
            onClick={() => setAddStart("scan")}
          >
            <Camera size={16} />
            Scan Struk
          </Button>
          <Button
            size="lg"
            className="gap-2 rounded-full px-5"
            onClick={() => setAddStart("manual")}
          >
            <Plus size={16} />
            Tambah Manual
          </Button>
        </div>
      </div>

      <TransactionsToolbar
        month={month}
        onMonthChange={setMonth}
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      <SpendingSummary
        month={month}
        summary={summary}
        isLoading={isLoading}
        isFiltered={isFiltered}
      />

      <TransactionList
        groups={groups}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onSelect={(tx) => setSelectedId(tx.id)}
        onAdd={setAddStart}
        monthLabel={formatMonthLabel(month)}
        isFiltered={isFiltered}
      />

      {/* Mobile: one FAB → method picker (desktop has both CTAs in the header). */}
      <Button
        className="fixed bottom-6 right-4 z-40 h-14 gap-2 rounded-full px-6 text-[15px] font-semibold shadow-lg md:hidden"
        onClick={() => setAddStart("choose")}
      >
        <Plus size={18} />
        Tambah
      </Button>

      <TransactionDetailSheet
        transaction={selected}
        onClose={() => setSelectedId(null)}
      />

      {addStart && (
        <AddTransactionModal startAt={addStart} onClose={closeAddModal} />
      )}
    </div>
  );
}

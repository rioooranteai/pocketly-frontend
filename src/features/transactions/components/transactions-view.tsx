"use client";

import { useRef, useState } from "react";
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
  TRANSACTIONS_PAGE_SIZE,
  type CategoryFilter,
} from "@/features/transactions/list-utils";
import { ROUTES } from "@/lib/constants";
import { paginate } from "@/lib/pagination";

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
  const [page, setPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addStart, setAddStart] = useState<AddTransactionStart | null>(
    initialAdd ?? null
  );

  const isFiltered = search.trim() !== "" || category !== "all";
  const visible = filterTransactions(data ?? [], { month, search, category });
  const summary = summarizeSpending(visible);
  // paginate() clamps the page, e.g. after deleting a page's last row.
  const pageSlice = paginate(visible, page, TRANSACTIONS_PAGE_SIZE);
  const groups = groupByDay(pageSlice.items, new Date(), visible);
  // Read from the query cache so edits/deletes refresh the open sheet.
  const selected = data?.find((tx) => tx.id === selectedId) ?? null;

  // Any filter change starts over at page 1.
  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function changePage(next: number) {
    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeAddModal() {
    setAddStart(null);
    // Drop ?add=… so a refresh doesn't reopen the modal.
    if (initialAdd) router.replace(ROUTES.TRANSACTIONS.LIST);
  }

  return (
    <div className="min-w-0 space-y-5 pb-24 lg:pb-4">
      <div className="flex items-end justify-between gap-4 lg:px-2 lg:pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-[28px]">
            Transaksi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua pengeluaran yang sudah kamu catat.
          </p>
        </div>
        <div className="hidden shrink-0 gap-2 lg:flex">
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
        onMonthChange={withPageReset(setMonth)}
        search={search}
        onSearchChange={withPageReset(setSearch)}
        category={category}
        onCategoryChange={withPageReset(setCategory)}
      />

      <SpendingSummary
        month={month}
        summary={summary}
        isLoading={isLoading}
        isFiltered={isFiltered}
      />

      {/* scroll-mt: lands just above the list, not flush against the edge. */}
      <div ref={listTopRef} className="scroll-mt-4" />
      <TransactionList
        groups={groups}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onSelect={(tx) => setSelectedId(tx.id)}
        onAdd={setAddStart}
        monthLabel={formatMonthLabel(month)}
        isFiltered={isFiltered}
        pagination={{ ...pageSlice, onPageChange: changePage }}
      />

      {/* Mobile: one FAB → method picker (desktop has both CTAs in the header). */}
      <Button
        className="fixed bottom-6 right-4 z-40 h-14 gap-2 rounded-full px-6 text-[15px] font-semibold shadow-lg lg:hidden"
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

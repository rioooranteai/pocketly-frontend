"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus } from "lucide-react";

import { TopBar } from "@/components/shared/top-bar";
import { Button } from "@/components/ui/button";
import {
  AddTransactionModal,
  type AddTransactionStart,
} from "@/features/transactions/components/add-transaction-modal";
import { TransactionDetailSheet } from "@/features/transactions/components/transaction-detail-sheet";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import { TransactionsToolbar } from "@/features/transactions/components/transactions-toolbar";
import { TransactionsSummaryLine } from "@/features/transactions/components/transactions-summary-line";
import { useTransactions } from "@/features/transactions/hooks";
import {
  filterTransactions,
  formatMonthLabel,
  groupByDay,
  startOfMonth,
  TRANSACTIONS_PAGE_SIZE,
  type CategoryFilter,
} from "@/features/transactions/list-utils";
import { ROUTES } from "@/lib/constants";
import { paginate } from "@/lib/pagination";
import { useAuthStore } from "@/stores/auth";

/** Greeting by local time of day. */
function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

interface TransactionsViewProps {
  /** Opens the add modal on arrival (e.g. sidebar "Scan Receipt" → ?add=scan). */
  initialAdd?: Exclude<AddTransactionStart, "choose">;
}

export function TransactionsView({ initialAdd }: TransactionsViewProps) {
  const router = useRouter();
  const firstName = useAuthStore((s) => s.user?.name?.trim().split(/\s+/)[0]) ?? "kamu";
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
      <TopBar
        search={search}
        onSearchChange={withPageReset(setSearch)}
        searchPlaceholder="Cari deskripsi atau item…"
      />

      {/* scroll-mt: lands just above the card, not flush against the edge. */}
      <div ref={listTopRef} className="scroll-mt-4" />
      {/* Header, filters and list share one card. */}
      <div className="overflow-hidden rounded-[20px] bg-card">
        <div className="flex items-center justify-between gap-4 px-4 pt-5 md:px-6">
          <div className="min-w-0">
            <h1 className="text-[26px] font-medium tracking-tight text-foreground lg:text-[32px]">
              {getGreeting()}, {firstName}!
            </h1>
            <TransactionsSummaryLine
              transactions={data}
              month={month}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
          <div className="hidden shrink-0 gap-2 lg:flex">
            <Button
              size="lg"
              className="gap-2 rounded-full px-5"
              onClick={() => setAddStart("scan")}
            >
              <Camera size={16} />
              Scan Struk
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-full px-5"
              onClick={() => setAddStart("manual")}
            >
              <Plus size={16} />
              Tambah Manual
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-5 md:px-6">
          <TransactionsToolbar
            month={month}
            onMonthChange={withPageReset(setMonth)}
            category={category}
            onCategoryChange={withPageReset(setCategory)}
          />
        </div>
        {/* Inset frame, a lighter tint of the page background, holding the list. */}
        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <div className="overflow-hidden rounded-2xl bg-background/60">
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
          </div>
        </div>
      </div>

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

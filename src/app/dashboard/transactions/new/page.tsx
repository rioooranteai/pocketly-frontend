"use client";

import { useState } from "react";
import { PenLine, Camera } from "lucide-react";

import { cn } from "@/lib/utils";
import { ManualTransactionForm } from "@/features/transactions/components/manual-transaction-form";
import { ScanReceiptForm } from "@/features/transactions/components/scan-receipt-form";

type Mode = "manual" | "scan";

export default function NewTransactionPage() {
  const [mode, setMode] = useState<Mode>("manual");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Tambah Transaksi
        </h1>
        <p className="text-sm text-muted-foreground">
          Catat manual atau scan struk belanja kamu.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setMode("manual")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            mode === "manual"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine size={15} />
          Manual
        </button>
        <button
          onClick={() => setMode("scan")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            mode === "scan"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Camera size={15} />
          Scan Struk
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {mode === "manual" ? <ManualTransactionForm /> : <ScanReceiptForm />}
      </div>
    </div>
  );
}

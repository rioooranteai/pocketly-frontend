"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import type { TransactionResponse } from "@/types/api";
import { useScanReceipt } from "@/features/transactions/hooks";
import { useReceiptFile } from "@/features/transactions/hooks/use-receipt-file";
import { ChooseMethodStep } from "@/features/transactions/components/add-transaction-steps/choose-method-step";
import { ManualEntryStep } from "@/features/transactions/components/add-transaction-steps/manual-entry-step";
import { ScanUploadStep } from "@/features/transactions/components/add-transaction-steps/scan-upload-step";
import { ScanProcessingStep } from "@/features/transactions/components/add-transaction-steps/scan-processing-step";
import { ScanReviewStep } from "@/features/transactions/components/add-transaction-steps/scan-review-step";

type Step = "choose" | "manual" | "scan-upload" | "processing" | "review";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Locked, step-driven modal for adding a transaction:
 * choose -> manual (submit straight to create) OR
 * choose -> scan-upload -> processing (cannot be closed) -> review
 * (AI-extracted result, pre-filled and editable) -> save.
 *
 * Note: the backend's /transactions/scan endpoint creates the
 * transaction immediately (no separate "dry-run extract" endpoint
 * exists yet), so the review step actually edits an already-saved
 * record via PUT. Closing the modal after a successful scan without
 * hitting "Simpan" still leaves the AI's raw extraction saved.
 */
export function AddTransactionModal({
  open,
  onOpenChange,
}: AddTransactionModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const [scanResult, setScanResult] = useState<TransactionResponse | null>(
    null
  );
  const receipt = useReceiptFile();
  const scanReceipt = useScanReceipt();

  function handleOpenChange(next: boolean) {
    // Locked while processing — ignore ESC / outside click / close button.
    if (!next && step === "processing") return;
    if (!next) {
      setStep("choose");
      setScanResult(null);
      receipt.clear();
    }
    onOpenChange(next);
  }

  function handleScanSubmit() {
    if (!receipt.file) {
      receipt.setError("Pilih gambar struk dulu.");
      return;
    }
    receipt.setError(null);
    setStep("processing");

    scanReceipt.mutate(receipt.file, {
      onSuccess: (result) => {
        setScanResult(result);
        setStep("review");
      },
      onError: (err) => {
        receipt.setError(
          err instanceof ApiError ? err.message : "Gagal memproses struk."
        );
        setStep("scan-upload");
      },
    });
  }

  const close = () => handleOpenChange(false);
  const backToChoose = () => setStep("choose");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showClose={step !== "processing"} preventOutsideClose>
        {step === "choose" && (
          <ChooseMethodStep
            onManual={() => setStep("manual")}
            onScan={() => setStep("scan-upload")}
          />
        )}
        {step === "manual" && (
          <ManualEntryStep onBack={backToChoose} onSaved={close} />
        )}
        {step === "scan-upload" && (
          <ScanUploadStep
            receipt={receipt}
            onBack={backToChoose}
            onSubmit={handleScanSubmit}
          />
        )}
        {step === "processing" && <ScanProcessingStep />}
        {step === "review" && scanResult && (
          <ScanReviewStep transaction={scanResult} onSaved={close} />
        )}
      </DialogContent>
    </Dialog>
  );
}

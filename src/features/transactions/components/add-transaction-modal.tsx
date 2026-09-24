"use client";

import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api-client";
import type { TransactionResponse } from "@/types/api";
import { useScanReceipt } from "@/features/transactions/hooks";
import { useReceiptFile } from "@/features/transactions/hooks/use-receipt-file";
import { ChooseMethodStep } from "@/features/transactions/components/add-transaction-steps/choose-method-step";
import { ManualEntryStep } from "@/features/transactions/components/add-transaction-steps/manual-entry-step";
import { ScanUploadStep } from "@/features/transactions/components/add-transaction-steps/scan-upload-step";
import { ScanProcessingStep } from "@/features/transactions/components/add-transaction-steps/scan-processing-step";
import { ScanReviewStep } from "@/features/transactions/components/add-transaction-steps/scan-review-step";

type Step = "choose" | "manual" | "scan-upload" | "processing" | "review";

export type AddTransactionStart = "choose" | "manual" | "scan";

const START_STEP: Record<AddTransactionStart, Step> = {
  choose: "choose",
  manual: "manual",
  scan: "scan-upload",
};

interface AddTransactionModalProps {
  /** Which step to open on; "choose" shows the manual/scan picker first. */
  startAt: AddTransactionStart;
  onClose: () => void;
}

/**
 * Locked, step-driven modal for adding a transaction:
 * [choose ->] manual (submit straight to create) OR
 * [choose ->] scan-upload -> processing (cannot be closed) -> review
 * (AI-extracted result, pre-filled and editable) -> save.
 *
 * Mounted only while open, so every open starts from a clean state.
 *
 * Note: the backend's /transactions/scan endpoint creates the
 * transaction immediately (no separate "dry-run extract" endpoint
 * exists yet), so the review step actually edits an already-saved
 * record via PUT — the review UI says so explicitly.
 */
export function AddTransactionModal({
  startAt,
  onClose,
}: AddTransactionModalProps) {
  const [step, setStep] = useState<Step>(START_STEP[startAt]);
  const [scanResult, setScanResult] = useState<TransactionResponse | null>(
    null
  );
  const receipt = useReceiptFile();
  const scanReceipt = useScanReceipt();

  function handleOpenChange(open: boolean) {
    // Locked while processing — ignore ESC / outside click / close button.
    if (open || step === "processing") return;
    receipt.clear();
    onClose();
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
        receipt.setError(getErrorMessage(err, "Gagal memproses struk."));
        setStep("scan-upload");
      },
    });
  }

  const close = () => handleOpenChange(false);
  // Only offer "Kembali" when the person actually came from the picker.
  const backToChoose =
    startAt === "choose" ? () => setStep("choose") : undefined;

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={step !== "processing"}
        preventOutsideClose
        className={step === "review" ? "max-w-4xl p-0" : undefined}
      >
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
          <ScanReviewStep
            transaction={scanResult}
            receiptPreviewUrl={receipt.previewUrl}
            onDone={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

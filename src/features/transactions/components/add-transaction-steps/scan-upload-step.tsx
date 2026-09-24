"use client";

import { Camera, X, ArrowRight } from "lucide-react";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ReceiptFile } from "@/features/transactions/hooks/use-receipt-file";
import { BackButton } from "@/features/transactions/components/add-transaction-steps/back-button";

interface ScanUploadStepProps {
  receipt: ReceiptFile;
  /** Shown only when the modal started at the method picker. */
  onBack?: () => void;
  onSubmit: () => void;
}

export function ScanUploadStep({ receipt, onBack, onSubmit }: ScanUploadStepProps) {
  const { file, previewUrl, error, inputRef, select, clear } = receipt;

  return (
    <>
      <DialogHeader>
        {onBack && <BackButton onClick={onBack} />}
        <DialogTitle>Scan Struk</DialogTitle>
        <DialogDescription>
          Upload foto struk, AI akan baca deskripsi & item-nya otomatis.
        </DialogDescription>
      </DialogHeader>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={select}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-14 text-center transition-colors hover:border-primary hover:bg-muted/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload foto struk</p>
            <p className="text-xs text-muted-foreground">
              PNG atau JPG, maksimal 10MB
            </p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          {/* Local blob: preview — next/image can't optimize object URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview struk"
            className="max-h-72 w-full object-contain bg-muted"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-white hover:bg-foreground/90"
            aria-label="Hapus gambar"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-expense">{error}</p>}

      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={!file}
        className="mt-5 w-full gap-2 rounded-full"
      >
        Scan Sekarang
        <ArrowRight size={16} />
      </Button>
    </>
  );
}

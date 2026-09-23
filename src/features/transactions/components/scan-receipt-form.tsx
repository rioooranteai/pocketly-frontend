"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useScanReceipt } from "../hooks";
import { ROUTES } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import { VALIDATION } from "@/lib/constants";

export function ScanReceiptForm() {
  const router = useRouter();
  const scanReceipt = useScanReceipt();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setFormError(null);

    if (!selected) return;

    if (selected.size > VALIDATION.MAX_FILE_SIZE) {
      setFormError("Ukuran gambar maksimal 10MB.");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function clearFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit() {
    if (!file) {
      setFormError("Pilih gambar struk dulu.");
      return;
    }
    setFormError(null);

    scanReceipt.mutate(file, {
      onSuccess: () => {
        router.push(ROUTES.TRANSACTIONS.LIST);
      },
    });
  }

  const errorMessage =
    formError ??
    (scanReceipt.isError
      ? scanReceipt.error instanceof ApiError
        ? scanReceipt.error.message
        : "Gagal memproses struk. Coba lagi."
      : null);

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-14 text-center transition-colors hover:border-primary hover:bg-muted/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Upload foto struk
            </p>
            <p className="text-xs text-muted-foreground">
              PNG atau JPG, maksimal 10MB
            </p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img
            src={previewUrl}
            alt="Preview struk"
            className="max-h-96 w-full object-contain bg-muted"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-white backdrop-blur-sm hover:bg-foreground/90"
            aria-label="Hapus gambar"
          >
            <X size={16} />
          </button>

          {scanReceipt.isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/60 text-white backdrop-blur-sm">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm font-medium">
                AI lagi baca struk kamu...
              </p>
            </div>
          )}
        </div>
      )}

      {errorMessage && <p className="text-sm text-expense">{errorMessage}</p>}

      <Button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
        disabled={!file || scanReceipt.isPending}
      >
        {scanReceipt.isPending ? "Memproses..." : "Scan & Simpan"}
      </Button>
    </div>
  );
}

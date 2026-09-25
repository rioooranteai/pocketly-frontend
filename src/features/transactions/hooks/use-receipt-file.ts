"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { VALIDATION } from "@/lib/constants";

/**
 * Holds the selected receipt image + its object-URL preview. Lives in
 * the modal (not the upload step) so the chosen file survives the
 * upload -> processing -> upload round-trip when a scan fails.
 */
export function useReceiptFile() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function select(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) return;

    if (selected.size > VALIDATION.MAX_FILE_SIZE) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function clear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return { file, previewUrl, error, setError, inputRef, select, clear };
}

export type ReceiptFile = ReturnType<typeof useReceiptFile>;

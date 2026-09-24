"use client";

import { Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api-client";
import type { TransactionResponse } from "@/types/api";
import { useUpdateTransaction } from "@/features/transactions/hooks";
import { CategoryChip } from "@/features/transactions/components/category-badge";
import { TransactionFieldsForm } from "@/features/transactions/components/transaction-fields-form";
import {
  toTransactionFieldsValue,
  toTransactionPayload,
} from "@/features/transactions/utils";

interface ScanReviewStepProps {
  transaction: TransactionResponse;
  /** Object URL of the uploaded receipt, shown beside the extraction. */
  receiptPreviewUrl: string | null;
  onDone: () => void;
}

/**
 * The scan endpoint already saved the transaction, so this step edits
 * it in place via PUT — and says so, so nobody expects "close" to discard.
 */
export function ScanReviewStep({
  transaction,
  receiptPreviewUrl,
  onDone,
}: ScanReviewStepProps) {
  const updateTransaction = useUpdateTransaction();

  return (
    <div className="grid md:grid-cols-[340px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3.5 bg-background p-6 md:p-7">
        <p className="text-xs font-semibold text-muted-foreground">
          Struk yang kamu upload
        </p>
        {receiptPreviewUrl ? (
          // Local blob: preview — next/image can't optimize object URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={receiptPreviewUrl}
            alt="Foto struk yang diupload"
            className="max-h-64 w-full rounded-md bg-card object-contain shadow-sm md:max-h-[560px]"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Pratinjau tidak tersedia.</p>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Cocokkan setiap item dengan struk sebelum menyimpan.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-[18px] p-6 md:px-8 md:py-7">
        <div className="pr-12">
          <DialogTitle className="text-[22px] font-semibold tracking-tight">
            Cek hasil scan
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            AI sudah membaca {transaction.items.length} item dari struk kamu.
          </DialogDescription>
        </div>

        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl bg-accent/50 px-3.5 py-3 text-[13px] leading-snug text-foreground"
        >
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>
            <strong className="font-semibold">Transaksi sudah tersimpan.</strong>{" "}
            Perubahan di sini akan memperbarui transaksi tersebut, bukan membuat
            yang baru.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground">Kategori</span>
          <CategoryChip category={transaction.category} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles size={13} aria-hidden="true" />
            dipilih AI
          </span>
        </div>

        <TransactionFieldsForm
          initialValues={toTransactionFieldsValue(transaction)}
          onSubmit={(value) =>
            updateTransaction.mutate(
              { id: transaction.id, data: toTransactionPayload(value) },
              {
                onSuccess: () => {
                  toast.success("Perubahan disimpan.");
                  onDone();
                },
              }
            )
          }
          isSubmitting={updateTransaction.isPending}
          submitLabel="Simpan perubahan"
          onCancel={onDone}
          cancelLabel="Selesai tanpa perubahan"
          errorMessage={
            updateTransaction.isError
              ? getErrorMessage(updateTransaction.error, "Gagal menyimpan perubahan.")
              : null
          }
        />
      </div>
    </div>
  );
}

"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import type { TransactionResponse } from "@/types/api";
import { useUpdateTransaction } from "@/features/transactions/hooks";
import { TransactionFieldsForm } from "@/features/transactions/components/transaction-fields-form";
import { toTransactionPayload } from "@/features/transactions/utils";

interface ScanReviewStepProps {
  transaction: TransactionResponse;
  onSaved: () => void;
}

/**
 * The scan endpoint already saved the transaction, so this step edits
 * it in place via PUT rather than creating a new one.
 */
export function ScanReviewStep({ transaction, onSaved }: ScanReviewStepProps) {
  const updateTransaction = useUpdateTransaction();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Cek Hasil Scan</DialogTitle>
        <DialogDescription>
          Sudah tersimpan — revisi dulu kalau ada yang kurang pas, lalu simpan.
        </DialogDescription>
      </DialogHeader>
      <TransactionFieldsForm
        initialValues={{
          description: transaction.description,
          date: transaction.date.slice(0, 10),
          items: transaction.items.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            price: String(item.price),
          })),
        }}
        onSubmit={(value) =>
          updateTransaction.mutate(
            { id: transaction.id, data: toTransactionPayload(value) },
            { onSuccess: onSaved }
          )
        }
        isSubmitting={updateTransaction.isPending}
        submitLabel="Simpan Perubahan"
        errorMessage={
          updateTransaction.isError
            ? updateTransaction.error instanceof ApiError
              ? updateTransaction.error.message
              : "Gagal menyimpan perubahan."
            : null
        }
      />
    </>
  );
}

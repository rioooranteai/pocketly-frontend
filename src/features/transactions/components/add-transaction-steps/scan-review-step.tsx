"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api-client";
import type { TransactionResponse } from "@/types/api";
import { useUpdateTransaction } from "@/features/transactions/hooks";
import { TransactionFieldsForm } from "@/features/transactions/components/transaction-fields-form";
import {
  toTransactionFieldsValue,
  toTransactionPayload,
} from "@/features/transactions/utils";

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
        initialValues={toTransactionFieldsValue(transaction)}
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
            ? getErrorMessage(updateTransaction.error, "Gagal menyimpan perubahan.")
            : null
        }
      />
    </>
  );
}

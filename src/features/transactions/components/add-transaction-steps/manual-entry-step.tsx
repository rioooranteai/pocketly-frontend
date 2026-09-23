"use client";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";
import { useCreateTransaction } from "@/features/transactions/hooks";
import { TransactionFieldsForm } from "@/features/transactions/components/transaction-fields-form";
import { toTransactionPayload } from "@/features/transactions/utils";
import { BackButton } from "@/features/transactions/components/add-transaction-steps/back-button";

interface ManualEntryStepProps {
  onBack: () => void;
  onSaved: () => void;
}

export function ManualEntryStep({ onBack, onSaved }: ManualEntryStepProps) {
  const createTransaction = useCreateTransaction();

  return (
    <>
      <DialogHeader>
        <BackButton onClick={onBack} />
        <DialogTitle>Input Manual</DialogTitle>
      </DialogHeader>
      <TransactionFieldsForm
        onSubmit={(value) =>
          createTransaction.mutate(toTransactionPayload(value), {
            onSuccess: onSaved,
          })
        }
        isSubmitting={createTransaction.isPending}
        submitLabel="Simpan Transaksi"
        errorMessage={
          createTransaction.isError
            ? createTransaction.error instanceof ApiError
              ? createTransaction.error.message
              : "Gagal menyimpan transaksi."
            : null
        }
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TransactionDetailView } from "@/features/transactions/components/transaction-detail-view";
import { TransactionFieldsForm } from "@/features/transactions/components/transaction-fields-form";
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from "@/features/transactions/hooks";
import {
  toTransactionFieldsValue,
  toTransactionPayload,
} from "@/features/transactions/utils";
import { getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { TransactionResponse } from "@/types/api";

/** Fades the body up just after the panel starts sliding in (and on view/edit swaps). */
const CONTENT_ANIMATION =
  "flex min-h-0 flex-1 flex-col animate-content-in [animation-delay:80ms] motion-reduce:animate-none";

interface TransactionDetailSheetProps {
  transaction: TransactionResponse | null;
  onClose: () => void;
}

/**
 * Side panel for one transaction: read view with items, plus in-place
 * edit (reuses TransactionFieldsForm) and delete (ConfirmDialog).
 */
export function TransactionDetailSheet({
  transaction,
  onClose,
}: TransactionDetailSheetProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  // Keep the last transaction on screen while the sheet animates out —
  // `transaction` turns null the moment it closes.
  const [shown, setShown] = useState(transaction);
  if (transaction && transaction !== shown) setShown(transaction);

  function handleOpenChange(open: boolean) {
    if (open || updateTransaction.isPending) return;
    setMode("view");
    updateTransaction.reset();
    onClose();
  }

  function handleDelete() {
    if (!transaction) return;
    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => {
        setConfirmingDelete(false);
        toast.success("Transaksi dihapus.");
        onClose();
      },
    });
  }

  return (
    <>
      <Sheet open={transaction !== null} onOpenChange={handleOpenChange}>
        <SheetContent aria-describedby={undefined}>
          {shown && mode === "view" && (
            <div key="view" className={CONTENT_ANIMATION}>
              <TransactionDetailView
                transaction={shown}
                onEdit={() => setMode("edit")}
                onDelete={() => {
                  deleteTransaction.reset();
                  setConfirmingDelete(true);
                }}
              />
            </div>
          )}
          {shown && mode === "edit" && (
            <div
              key="edit"
              className={cn(CONTENT_ANIMATION, "overflow-y-auto scrollbar-none px-7 pb-6 pt-6")}
            >
              <SheetTitle className="text-lg font-semibold">Edit transaksi</SheetTitle>
              <SheetDescription className="mb-5 mt-1 text-sm text-muted-foreground">
                Total dihitung ulang otomatis dari item.
              </SheetDescription>
              <TransactionFieldsForm
                initialValues={toTransactionFieldsValue(shown)}
                onSubmit={(value) =>
                  updateTransaction.mutate(
                    { id: shown.id, data: toTransactionPayload(value) },
                    {
                      onSuccess: () => {
                        toast.success("Perubahan disimpan.");
                        setMode("view");
                      },
                    }
                  )
                }
                isSubmitting={updateTransaction.isPending}
                submitLabel="Simpan perubahan"
                onCancel={() => {
                  updateTransaction.reset();
                  setMode("view");
                }}
                errorMessage={
                  updateTransaction.isError
                    ? getErrorMessage(updateTransaction.error, "Gagal menyimpan perubahan.")
                    : null
                }
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Hapus transaksi?"
        description={`"${shown?.description ?? ""}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        isPending={deleteTransaction.isPending}
        errorMessage={
          deleteTransaction.isError
            ? getErrorMessage(deleteTransaction.error, "Gagal menghapus transaksi.")
            : null
        }
      />
    </>
  );
}

"use client";

import { useId, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency, toDateInputValue } from "@/lib/utils";
import type {
  ItemRow,
  TransactionFieldsValue,
} from "@/features/transactions/types";
import { TransactionItemRow } from "@/features/transactions/components/transaction-item-row";
import { transactionFieldsSchema } from "@/features/transactions/schemas";
import { createItemRow } from "@/features/transactions/utils";

interface TransactionFieldsFormProps {
  initialValues?: TransactionFieldsValue;
  onSubmit: (value: TransactionFieldsValue) => void;
  isSubmitting?: boolean;
  submitLabel: string;
  errorMessage?: string | null;
  /** Adds a secondary outline button next to submit (e.g. "Batal"). */
  onCancel?: () => void;
  cancelLabel?: string;
}

/**
 * Shared description + date + dynamic items editor. Used both for
 * manual entry (empty initialValues) and for reviewing/editing an
 * AI-scanned result (pre-filled initialValues) before final save —
 * the parent (ManualEntryStep / ScanReviewStep / the detail sheet's
 * edit mode) owns submission and API calls.
 */
export function TransactionFieldsForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  errorMessage: externalError,
  onCancel,
  cancelLabel = "Batal",
}: TransactionFieldsFormProps) {
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [date, setDate] = useState(
    initialValues?.date ?? toDateInputValue()
  );
  const [items, setItems] = useState<ItemRow[]>(
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items
      : [createItemRow()]
  );
  const [formError, setFormError] = useState<string | null>(null);
  const fieldId = useId();

  const total = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, createItemRow()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = transactionFieldsSchema.safeParse({
      description,
      date,
      items,
    });
    if (!result.success) {
      // One message at a time, in field order — the form has a single error slot.
      setFormError(result.error.issues[0]?.message ?? "Data tidak valid.");
      return;
    }

    onSubmit(result.data);
  }

  const errorMessage = formError ?? externalError ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor={`${fieldId}-description`}
            className="text-xs text-muted-foreground"
          >
            Deskripsi
          </Label>
          <Input
            id={`${fieldId}-description`}
            placeholder="Contoh: Belanja bulanan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={`${fieldId}-date`}
            className="text-xs text-muted-foreground"
          >
            Tanggal
          </Label>
          <Input
            id={`${fieldId}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Item</p>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={14} />
            Tambah item
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <TransactionItemRow
              key={item.id}
              item={item}
              onChange={(patch) => updateItem(index, patch)}
              onRemove={() => removeItem(index)}
              canRemove={items.length > 1}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          Total
        </span>
        <span className="text-lg font-semibold text-foreground">
          {formatCurrency(total)}
        </span>
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-expense">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full px-5"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          size="lg"
          className={cn("rounded-full px-6", !onCancel && "w-full")}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

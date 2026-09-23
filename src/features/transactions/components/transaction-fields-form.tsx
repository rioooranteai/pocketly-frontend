"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";

export interface ItemRow {
  name: string;
  quantity: string;
  price: string;
}

export interface TransactionFieldsValue {
  description: string;
  date: string; // yyyy-mm-dd
  items: ItemRow[];
}

const EMPTY_ITEM: ItemRow = { name: "", quantity: "1", price: "" };

interface TransactionFieldsFormProps {
  initialValues?: TransactionFieldsValue;
  onSubmit: (value: TransactionFieldsValue) => void;
  isSubmitting?: boolean;
  submitLabel: string;
  errorMessage?: string | null;
}

/**
 * Shared description + date + dynamic items editor. Used both for
 * manual entry (empty initialValues) and for reviewing/editing an
 * AI-scanned result (pre-filled initialValues) before final save —
 * the parent step (ManualEntryStep / ScanReviewStep) owns submission
 * and API calls.
 */
export function TransactionFieldsForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  errorMessage: externalError,
}: TransactionFieldsFormProps) {
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [date, setDate] = useState(
    initialValues?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [items, setItems] = useState<ItemRow[]>(
    initialValues?.items && initialValues.items.length > 0
      ? initialValues.items
      : [{ ...EMPTY_ITEM }]
  );
  const [formError, setFormError] = useState<string | null>(null);

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
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError("Deskripsi wajib diisi.");
      return;
    }
    for (const item of items) {
      if (!item.name.trim() || !item.quantity || !item.price) {
        setFormError("Semua field item (nama, jumlah, harga) wajib diisi.");
        return;
      }
    }

    onSubmit({ description: description.trim(), date, items });
  }

  const errorMessage = formError ?? externalError ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Deskripsi
          </label>
          <Input
            placeholder="Contoh: Belanja bulanan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Tanggal
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Item
          </label>
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
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Nama item"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: e.target.value })
                }
                className="w-20"
              />
              <Input
                type="number"
                min={0}
                placeholder="Harga"
                value={item.price}
                onChange={(e) => updateItem(index, { price: e.target.value })}
                className="w-32"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
                  "hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent"
                )}
                aria-label="Hapus item"
              >
                <Trash2 size={15} />
              </button>
            </div>
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

      {errorMessage && <p className="text-sm text-expense">{errorMessage}</p>}

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}

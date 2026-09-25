import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ItemRow } from "@/features/transactions/types";

interface TransactionItemRowProps {
  item: ItemRow;
  onChange: (patch: Partial<ItemRow>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

/** One editable line item (name, qty, price) in the transaction form. */
export function TransactionItemRow({
  item,
  onChange,
  onRemove,
  canRemove,
}: TransactionItemRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Input
        placeholder="Nama item"
        aria-label="Nama item"
        value={item.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="min-w-0 flex-1 px-4"
      />
      <Input
        type="number"
        min={0}
        step={1}
        placeholder="Qty"
        aria-label="Jumlah"
        value={item.quantity}
        onChange={(e) => onChange({ quantity: e.target.value })}
        className="w-16 shrink-0 px-3 text-center sm:w-20"
      />
      <Input
        type="number"
        min={0}
        placeholder="Harga"
        aria-label="Harga"
        value={item.price}
        onChange={(e) => onChange({ price: e.target.value })}
        className="w-24 shrink-0 px-3 text-right sm:w-32"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
          "hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent"
        )}
        aria-label="Hapus item"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

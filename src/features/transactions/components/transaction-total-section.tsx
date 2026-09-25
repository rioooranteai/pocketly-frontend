"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";
import { getDiscountAmount } from "@/features/transactions/discount";
import type {
  DiscountType,
  DiscountValue,
} from "@/features/transactions/types";

const DISCOUNT_TYPES: { type: DiscountType; label: string; name: string }[] = [
  { type: "percent", label: "%", name: "Diskon persen" },
  { type: "amount", label: "Rp", name: "Diskon nominal" },
];

interface TransactionTotalSectionProps {
  subtotal: number;
  discount: DiscountValue;
  onDiscountChange: (discount: DiscountValue) => void;
}

/**
 * Receipt-level discount input (% or Rp) plus the subtotal → discount →
 * total breakdown. The discount only lives in the form; on save it's
 * folded into the item prices (see discount.ts).
 */
export function TransactionTotalSection({
  subtotal,
  discount,
  onDiscountChange,
}: TransactionTotalSectionProps) {
  const inputId = useId();
  const discountAmount = getDiscountAmount(subtotal, discount);
  const isPercent = discount.type === "percent";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">
          Diskon <span className="font-normal">(opsional)</span>
        </Label>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Jenis diskon"
            className="flex shrink-0 rounded-full border border-border bg-card p-0.5"
          >
            {DISCOUNT_TYPES.map(({ type, label, name }) => (
              <button
                key={type}
                type="button"
                aria-label={name}
                aria-pressed={discount.type === type}
                // Switching type keeps the number; the user retypes if needed.
                onClick={() => onDiscountChange({ ...discount, type })}
                className={cn(
                  "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  discount.type === type
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Input
            id={inputId}
            type="number"
            min={0}
            max={isPercent ? 100 : undefined}
            step="any"
            inputMode="decimal"
            placeholder="0"
            value={discount.value}
            onChange={(e) =>
              onDiscountChange({ ...discount, value: e.target.value })
            }
            className="w-28 px-3 text-right sm:w-32"
          />
        </div>
      </div>

      <dl className="space-y-1.5 rounded-xl bg-muted px-4 py-3">
        {discountAmount > 0 && (
          <>
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow
              label={isPercent ? `Diskon ${discount.value}%` : "Diskon"}
              value={`−${formatCurrency(discountAmount)}`}
              valueClassName="text-income"
            />
          </>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-sm font-medium text-muted-foreground">Total</dt>
          <dd className="text-lg font-semibold text-foreground">
            {formatCurrency(subtotal - discountAmount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums text-foreground", valueClassName)}>
        {value}
      </dd>
    </div>
  );
}

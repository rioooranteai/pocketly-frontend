import type { TransactionItem } from "@/types/api";
import type { DiscountValue, ItemRow } from "@/features/transactions/types";

export const NO_DISCOUNT: DiscountValue = { type: "percent", value: "" };

/** Sum of quantity × price; unparseable inputs count as 0 while typing. */
export function getSubtotal(
  items: Pick<ItemRow, "quantity" | "price">[]
): number {
  return items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
}

/** Rupiah taken off `subtotal`, clamped to [0, subtotal]. */
export function getDiscountAmount(
  subtotal: number,
  discount: DiscountValue
): number {
  const value = Number(discount.value) || 0;
  const amount = discount.type === "percent" ? (subtotal * value) / 100 : value;
  return Math.min(Math.max(amount, 0), subtotal);
}

const toCents = (value: number) => Math.round(value * 100) / 100;

/**
 * Folds a receipt-level discount into the items' unit prices,
 * proportionally to each line's share of the subtotal — the API stores
 * only what was actually paid, and computes the total from the items.
 * Prices keep 2 decimals (the API accepts decimals), so the saved total
 * matches the discounted total to within rounding.
 */
export function applyDiscount(
  items: TransactionItem[],
  discount: DiscountValue
): TransactionItem[] {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const amount = getDiscountAmount(subtotal, discount);
  if (subtotal === 0 || amount === 0) return items;

  const factor = (subtotal - amount) / subtotal;
  return items.map((item) => ({
    ...item,
    price: toCents(item.price * factor),
  }));
}

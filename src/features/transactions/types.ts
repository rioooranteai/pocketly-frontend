/**
 * Form-side shapes for the transaction editor. Kept as strings because
 * that's what the inputs hold; `toTransactionPayload` converts them to
 * the API request shape in `@/types/api`.
 */
export interface ItemRow {
  /** Client-only React key, so removing a row doesn't shift input focus. */
  id: string;
  name: string;
  quantity: string;
  price: string;
}

/** "percent" = % off the subtotal; "amount" = rupiah off the subtotal. */
export type DiscountType = "percent" | "amount";

/**
 * Receipt-level discount. FE-only: the API has no discount field, so it
 * is folded into each item's unit price before saving (see discount.ts).
 */
export interface DiscountValue {
  type: DiscountType;
  /** Raw input; "" means no discount. */
  value: string;
}

export interface TransactionFieldsValue {
  description: string;
  date: string; // yyyy-mm-dd
  items: ItemRow[];
  discount: DiscountValue;
}

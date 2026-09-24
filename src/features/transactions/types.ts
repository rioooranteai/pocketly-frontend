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

export interface TransactionFieldsValue {
  description: string;
  date: string; // yyyy-mm-dd
  items: ItemRow[];
}

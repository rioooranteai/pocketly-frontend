import type {
  CreateTransactionRequest,
  TransactionResponse,
} from "@/types/api";
import type {
  ItemRow,
  TransactionFieldsValue,
} from "@/features/transactions/types";
import { toDateInputValue, toRfc3339 } from "@/lib/utils";
import { applyDiscount, NO_DISCOUNT } from "@/features/transactions/discount";

let itemRowSequence = 0;

/** New form row with a unique client-side id (defaults to an empty row). */
export function createItemRow(
  values: Partial<Omit<ItemRow, "id">> = {}
): ItemRow {
  itemRowSequence += 1;
  return {
    id: `item-${itemRowSequence}`,
    name: "",
    quantity: "1",
    price: "",
    ...values,
  };
}

/**
 * The form only picks a day, but the API wants a full RFC 3339 timestamp.
 * An unchanged day keeps the saved timestamp as-is; a newly picked day
 * gets the current local time of day, so it sorts naturally among that
 * day's other transactions.
 */
function toPayloadDate(day: string, originalDate?: string): string {
  if (originalDate && toDateInputValue(new Date(originalDate)) === day) {
    return originalDate;
  }
  const [year, month, date] = day.split("-").map(Number);
  const now = new Date();
  return toRfc3339(
    new Date(
      year,
      month - 1,
      date,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    )
  );
}

/**
 * Converts the form's string-based values into the API request shape.
 * The discount is folded into the item prices, so what's saved is what
 * was actually paid. Pass `original` when editing, so an untouched date
 * keeps its time.
 */
export function toTransactionPayload(
  value: TransactionFieldsValue,
  original?: TransactionResponse
): CreateTransactionRequest {
  return {
    description: value.description.trim(),
    date: toPayloadDate(value.date, original?.date),
    items: applyDiscount(
      value.items.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      value.discount
    ),
  };
}

/** Inverse of `toTransactionPayload`: pre-fills the form from a saved transaction. */
export function toTransactionFieldsValue(
  transaction: TransactionResponse
): TransactionFieldsValue {
  return {
    description: transaction.description,
    // Local day, matching how the list groups it (scans come back in UTC).
    date: toDateInputValue(new Date(transaction.date)),
    items: transaction.items.map((item) =>
      createItemRow({
        name: item.name,
        quantity: String(item.quantity),
        price: String(item.price),
      })
    ),
    // Saved prices already include any discount.
    discount: NO_DISCOUNT,
  };
}

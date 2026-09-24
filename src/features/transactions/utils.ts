import type {
  CreateTransactionRequest,
  TransactionResponse,
} from "@/types/api";
import type {
  ItemRow,
  TransactionFieldsValue,
} from "@/features/transactions/types";

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

/** Converts the form's string-based values into the API request shape. */
export function toTransactionPayload(
  value: TransactionFieldsValue
): CreateTransactionRequest {
  return {
    description: value.description,
    date: new Date(value.date).toISOString(),
    items: value.items.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
  };
}

/** Inverse of `toTransactionPayload`: pre-fills the form from a saved transaction. */
export function toTransactionFieldsValue(
  transaction: TransactionResponse
): TransactionFieldsValue {
  return {
    description: transaction.description,
    date: transaction.date.slice(0, 10),
    items: transaction.items.map((item) =>
      createItemRow({
        name: item.name,
        quantity: String(item.quantity),
        price: String(item.price),
      })
    ),
  };
}

import type { CreateTransactionRequest } from "@/types/api";
import type { TransactionFieldsValue } from "@/features/transactions/components/transaction-fields-form";

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

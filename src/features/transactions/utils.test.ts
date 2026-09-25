import { describe, expect, it } from "vitest";

import {
  createItemRow,
  toTransactionFieldsValue,
  toTransactionPayload,
} from "@/features/transactions/utils";
import { NO_DISCOUNT } from "@/features/transactions/discount";
import type { TransactionResponse } from "@/types/api";

const RFC3339_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

const saved: TransactionResponse = {
  id: "6f87a151-8d04-4094-a584-14b885efb158",
  description: "Makan siang",
  category: "food",
  total_amount: 30000,
  date: "2026-09-25T12:30:00+07:00",
  items: [{ name: "Nasi goreng", quantity: 2, price: 15000 }],
};

describe("toTransactionPayload", () => {
  it("sends a full RFC 3339 date with offset, never a bare day", () => {
    const payload = toTransactionPayload({
      description: "  Kopi  ",
      date: "2026-09-20",
      items: [createItemRow({ name: " Latte ", quantity: "0", price: "0" })],
      discount: NO_DISCOUNT,
    });

    expect(payload.date).toMatch(RFC3339_WITH_OFFSET);
    expect(payload.date.startsWith("2026-09-20T")).toBe(true);
    expect(payload).toMatchObject({
      description: "Kopi",
      items: [{ name: "Latte", quantity: 0, price: 0 }],
    });
    // Server-computed fields are never sent.
    expect(payload).not.toHaveProperty("category");
    expect(payload).not.toHaveProperty("total_amount");
  });

  it("keeps the saved timestamp when the day is unchanged", () => {
    const value = toTransactionFieldsValue(saved);
    expect(toTransactionPayload(value, saved).date).toBe(saved.date);
  });

  it("folds a discount into the item prices, so the saved total is what was paid", () => {
    const payload = toTransactionPayload({
      description: "Indomaret",
      date: "2026-09-20",
      items: [
        createItemRow({ name: "Beras", quantity: "1", price: "40000" }),
        createItemRow({ name: "Minyak", quantity: "2", price: "5000" }),
      ],
      discount: { type: "amount", value: "5000" },
    });

    expect(payload.items).toEqual([
      { name: "Beras", quantity: 1, price: 36000 },
      { name: "Minyak", quantity: 2, price: 4500 },
    ]);
  });

  it("resets the discount when editing a saved transaction", () => {
    expect(toTransactionFieldsValue(saved).discount).toEqual(NO_DISCOUNT);
  });
});

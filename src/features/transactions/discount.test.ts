import { describe, expect, it } from "vitest";

import {
  applyDiscount,
  getDiscountAmount,
  getSubtotal,
  NO_DISCOUNT,
} from "@/features/transactions/discount";
import { transactionFieldsSchema } from "@/features/transactions/schemas";
import { createItemRow } from "@/features/transactions/utils";

const items = [
  { name: "Kopi", quantity: 2, price: 24000 },
  { name: "Croissant", quantity: 1, price: 19000 },
];
const total = (list: typeof items) =>
  list.reduce((sum, item) => sum + item.quantity * item.price, 0);

describe("getDiscountAmount", () => {
  it("handles percent and nominal discounts", () => {
    expect(getDiscountAmount(67000, { type: "percent", value: "10" })).toBe(
      6700
    );
    expect(getDiscountAmount(67000, { type: "amount", value: "7000" })).toBe(
      7000
    );
  });

  it("never goes below 0 or above the subtotal", () => {
    expect(getDiscountAmount(1000, { type: "amount", value: "5000" })).toBe(
      1000
    );
    expect(getDiscountAmount(1000, { type: "amount", value: "-5" })).toBe(0);
    expect(getDiscountAmount(1000, NO_DISCOUNT)).toBe(0);
  });
});

describe("applyDiscount", () => {
  it("leaves items untouched without a discount", () => {
    expect(applyDiscount(items, NO_DISCOUNT)).toBe(items);
  });

  it("makes the items add up to the discounted total", () => {
    const discounted = applyDiscount(items, { type: "percent", value: "10" });
    expect(total(discounted)).toBeCloseTo(67000 * 0.9, 1);
  });

  it("keeps rounding error within a cent per unit", () => {
    const odd = [{ name: "Tahu", quantity: 3, price: 1000 }];
    const discounted = applyDiscount(odd, { type: "amount", value: "1000" });
    expect(Math.abs(total(discounted) - 2000)).toBeLessThanOrEqual(0.03);
  });

  it("zeroes every price for a 100% discount", () => {
    const discounted = applyDiscount(items, { type: "percent", value: "100" });
    expect(discounted.every((item) => item.price === 0)).toBe(true);
  });
});

describe("discount validation", () => {
  const base = {
    description: "Kopi",
    date: "2026-09-20",
    items: [createItemRow({ name: "Kopi", quantity: "1", price: "20000" })],
  };
  const messageFor = (discount: {
    type: "percent" | "amount";
    value: string;
  }) =>
    transactionFieldsSchema.safeParse({ ...base, discount }).error?.issues[0]
      ?.message;

  it("accepts an empty or in-range discount", () => {
    expect(getSubtotal(base.items)).toBe(20000);
    expect(messageFor(NO_DISCOUNT)).toBeUndefined();
    expect(messageFor({ type: "amount", value: "20000" })).toBeUndefined();
  });

  it("rejects more than 100% or more than the subtotal", () => {
    expect(messageFor({ type: "percent", value: "120" })).toMatch(/100%/);
    expect(messageFor({ type: "amount", value: "25000" })).toMatch(/subtotal/);
    expect(messageFor({ type: "amount", value: "-1" })).toMatch(/negatif/);
  });
});

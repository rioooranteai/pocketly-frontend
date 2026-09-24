import { describe, expect, it } from "vitest";

import { CATEGORY_META, getCategoryMeta } from "@/features/transactions/categories";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";

describe("getCategoryMeta", () => {
  it("has display info for every known category", () => {
    for (const category of TRANSACTION_CATEGORIES) {
      expect(CATEGORY_META[category].label).toBeTruthy();
    }
  });

  it("maps known categories to their Indonesian label", () => {
    expect(getCategoryMeta("food").label).toBe("Makanan");
  });

  it("falls back to uncategorized for empty values", () => {
    expect(getCategoryMeta("")).toBe(CATEGORY_META.uncategorized);
    expect(getCategoryMeta(undefined)).toBe(CATEGORY_META.uncategorized);
  });

  it("keeps an unknown AI category's raw name with the 'other' look", () => {
    const meta = getCategoryMeta("groceries");
    expect(meta.label).toBe("groceries");
    expect(meta.icon).toBe(CATEGORY_META.other.icon);
  });
});

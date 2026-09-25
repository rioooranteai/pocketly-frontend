import { z } from "zod";

import { getSubtotal } from "@/features/transactions/discount";

const REQUIRED_ITEM_FIELDS =
  "Semua field item (nama, jumlah, harga) wajib diisi.";

// Inputs hold strings; the numeric rules run on their parsed value.
const itemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, REQUIRED_ITEM_FIELDS),
  quantity: z
    .string()
    .min(1, REQUIRED_ITEM_FIELDS)
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      "Jumlah item harus bilangan bulat, tidak boleh negatif."
    ),
  price: z
    .string()
    .min(1, REQUIRED_ITEM_FIELDS)
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
      "Harga item tidak boleh negatif."
    ),
});

const discountSchema = z.object({
  type: z.enum(["percent", "amount"]),
  value: z
    .string()
    .refine(
      (value) =>
        value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
      "Diskon tidak boleh negatif."
    ),
});

export const transactionFieldsSchema = z
  .object({
    description: z.string().trim().min(1, "Deskripsi wajib diisi."),
    date: z.string().min(1, "Tanggal wajib diisi."),
    items: z.array(itemSchema).min(1, "Minimal satu item."),
    discount: discountSchema,
  })
  .superRefine(({ discount, items }, ctx) => {
    const value = Number(discount.value) || 0;
    if (discount.type === "percent" && value > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: "Diskon maksimal 100%.",
      });
    }
    if (discount.type === "amount" && value > getSubtotal(items)) {
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: "Diskon tidak boleh lebih besar dari subtotal.",
      });
    }
  });

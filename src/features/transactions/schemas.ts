import { z } from "zod";

const REQUIRED_ITEM_FIELDS = "Semua field item (nama, jumlah, harga) wajib diisi.";

// Inputs hold strings; the numeric rules run on their parsed value.
const itemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, REQUIRED_ITEM_FIELDS),
  quantity: z
    .string()
    .min(1, REQUIRED_ITEM_FIELDS)
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 1,
      "Jumlah item harus bilangan bulat minimal 1."
    ),
  price: z
    .string()
    .min(1, REQUIRED_ITEM_FIELDS)
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
      "Harga item tidak boleh negatif."
    ),
});

export const transactionFieldsSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi wajib diisi."),
  date: z.string().min(1, "Tanggal wajib diisi."),
  items: z.array(itemSchema).min(1, "Minimal satu item."),
});

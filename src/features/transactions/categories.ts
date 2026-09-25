import {
  Car,
  CircleHelp,
  HeartPulse,
  ShoppingBag,
  Tag,
  Ticket,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types/api";

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Tile classes: tinted fill + icon color (tokens in globals.css). */
  tileClassName: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  food: {
    label: "Makanan",
    icon: Utensils,
    tileClassName: "bg-category-food text-category-food-foreground",
  },
  transportation: {
    label: "Transportasi",
    icon: Car,
    tileClassName:
      "bg-category-transportation text-category-transportation-foreground",
  },
  shopping: {
    label: "Belanja",
    icon: ShoppingBag,
    tileClassName: "bg-category-shopping text-category-shopping-foreground",
  },
  entertainment: {
    label: "Hiburan",
    icon: Ticket,
    tileClassName:
      "bg-category-entertainment text-category-entertainment-foreground",
  },
  bills: {
    label: "Tagihan",
    icon: Zap,
    tileClassName: "bg-category-bills text-category-bills-foreground",
  },
  health: {
    label: "Kesehatan",
    icon: HeartPulse,
    tileClassName: "bg-category-health text-category-health-foreground",
  },
  others: {
    label: "Lainnya",
    icon: Tag,
    tileClassName: "bg-category-others text-category-others-foreground",
  },
  uncategorized: {
    label: "Belum dikategorikan",
    icon: CircleHelp,
    // Dashed outline makes AI categorization misses easy to spot.
    tileClassName:
      "border-[1.5px] border-dashed border-border bg-card text-muted-foreground",
  },
};

/** Categories offered as one-tap filter chips; the rest sit in a select. */
export const PRIMARY_FILTER_CATEGORIES: Category[] = [
  "food",
  "transportation",
  "shopping",
];

export function isKnownCategory(value: string): value is Category {
  return Object.hasOwn(CATEGORY_META, value);
}

/**
 * Display info for any category string. The API contract limits category
 * to TRANSACTION_CATEGORIES, but categorization must never break the UI:
 * an unexpected value keeps its raw name with the "others" look, and an
 * empty one shows as "uncategorized".
 */
export function getCategoryMeta(
  category: string | null | undefined
): CategoryMeta {
  if (!category) return CATEGORY_META.uncategorized;
  if (isKnownCategory(category)) return CATEGORY_META[category];
  return { ...CATEGORY_META.others, label: category };
}

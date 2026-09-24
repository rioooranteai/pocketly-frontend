import { getCategoryMeta } from "@/features/transactions/categories";
import { cn } from "@/lib/utils";

const TILE_SIZES = {
  md: { box: "h-10 w-10 rounded-xl", icon: 18 },
  lg: { box: "h-12 w-12 rounded-[14px]", icon: 22 },
} as const;

/** Square category icon tile used in lists and the detail header. */
export function CategoryTile({
  category,
  size = "md",
}: {
  category: string;
  size?: keyof typeof TILE_SIZES;
}) {
  const { icon: Icon, tileClassName } = getCategoryMeta(category);
  const { box, icon } = TILE_SIZES[size];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center",
        box,
        tileClassName
      )}
    >
      <Icon size={icon} />
    </div>
  );
}

/** Pill with icon + label, e.g. the category on a transaction's detail. */
export function CategoryChip({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const { icon: Icon, label, tileClassName } = getCategoryMeta(category);
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold",
        tileClassName,
        className
      )}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { getCategoryMeta } from "@/features/transactions/categories";
import { cn, formatCurrency } from "@/lib/utils";
import type { CategoryTotal } from "@/types/api";

/**
 * Row 3, left — where this month's money went. Categories are nominal,
 * so every bar is the same color; identity comes from the icon tile and
 * label, and the bar length (share of the month) carries magnitude.
 */
export function CategoryBreakdown({
  categories,
}: {
  categories: CategoryTotal[];
}) {
  const monthTotal = categories.reduce((acc, c) => acc + c.total, 0);

  return (
    <DashboardCard
      title="Per kategori"
      description="Porsi pengeluaran bulan ini"
      className="lg:col-span-5"
    >
      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada pengeluaran bulan ini.
        </p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {categories.map((c) => {
            const meta = getCategoryMeta(c.category);
            const Icon = meta.icon;
            const share = monthTotal > 0 ? (c.total / monthTotal) * 100 : 0;
            return (
              <li key={c.category} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    meta.tileClassName
                  )}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-foreground">
                      {meta.label}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <svg className="h-1.5 flex-1" aria-hidden="true">
                      <rect
                        width="100%"
                        height="6"
                        rx="3"
                        className="fill-heat-0"
                      />
                      <rect
                        width={`${share}%`}
                        height="6"
                        rx="3"
                        className="fill-primary"
                      />
                    </svg>
                    <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {share.toFixed(0)}% · {c.count} trx
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}

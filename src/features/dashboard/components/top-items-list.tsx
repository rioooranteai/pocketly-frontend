import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { formatCurrency } from "@/lib/utils";
import type { TopItem } from "@/types/api";

/**
 * Row 4, right — the most specific view: the individual items that cost
 * the most this month (from transaction line items, not categories).
 */
export function TopItemsList({ items }: { items: TopItem[] }) {
  return (
    <DashboardCard
      title="Item paling menguras"
      description="Total per item bulan ini"
      className="lg:col-span-7"
    >
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada item tercatat bulan ini.
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {items.map((item, i) => (
            <li
              key={item.name}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity}× dibeli · {item.transaction_count} transaksi
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(item.total)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </DashboardCard>
  );
}

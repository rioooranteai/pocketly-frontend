import {
  formatMonthLabel,
  type SpendingSummary as Summary,
} from "@/features/transactions/list-utils";
import { cn, formatCurrency } from "@/lib/utils";

// Slice colors differ in lightness, not just hue, so they stay tellable apart.
const SLICE_COLORS = [
  "bg-chart-1",
  "bg-chart-3",
  "bg-chart-5",
  "bg-foreground/80",
  "bg-chart-4",
];

interface SpendingSummaryProps {
  month: Date;
  summary: Summary;
  isLoading: boolean;
  /** Search/category active: the numbers cover the filtered rows only. */
  isFiltered: boolean;
}

export function SpendingSummary({
  month,
  summary,
  isLoading,
  isFiltered,
}: SpendingSummaryProps) {
  const monthLabel = formatMonthLabel(month);

  return (
    <section
      aria-label={`Ringkasan ${monthLabel}`}
      className="flex flex-col gap-5 rounded-[20px] bg-card p-5 md:flex-row md:items-center md:gap-10 md:px-6 md:py-[22px]"
    >
      <div className="shrink-0 md:w-[250px]">
        <p className="text-xs text-muted-foreground">
          Total pengeluaran <span className="capitalize">{monthLabel}</span>
          {isFiltered && " · sesuai filter"}
        </p>
        {isLoading ? (
          <div className="mt-2 h-8 w-44 animate-pulse rounded-md bg-muted" />
        ) : (
          <p className="mt-1 text-[30px] font-semibold tracking-tight tabular-nums">
            {formatCurrency(summary.total)}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {summary.count} transaksi
          {summary.count > 0 && ` · rata-rata ${formatCurrency(summary.average)}`}
        </p>
      </div>

      {summary.slices.length > 0 && (
        <div className="flex flex-1 flex-col gap-3.5">
          <div
            role="img"
            aria-label="Porsi pengeluaran per kategori"
            className="flex h-3 gap-[3px]"
          >
            {summary.slices.map((slice, i) => (
              <div
                key={slice.key}
                className={cn("basis-0 rounded-full", SLICE_COLORS[i])}
                // Data-driven proportion — the one thing a static Tailwind
                // class can't express, so it's the exception to "no inline styles".
                style={{ flexGrow: slice.amount }}
              />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {summary.slices.map((slice, i) => (
              <li key={slice.key} className="flex flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className={cn("h-2 w-2 shrink-0 rounded-full", SLICE_COLORS[i])}
                  />
                  {slice.label}
                </span>
                <span className="text-[13px] font-semibold tabular-nums">
                  {formatCurrency(slice.amount)}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {Math.round(slice.share * 100)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

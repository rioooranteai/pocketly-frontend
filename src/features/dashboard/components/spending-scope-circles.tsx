import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";
import type { DashboardScopes } from "@/types/api";

/*
 * Nested circles (ref: "Annual profits" widget). Each scope contains the
 * next — this year ⊃ this month ⊃ this week ⊃ today — so the rings show
 * containment, while the printed values carry the magnitude. Ring sizes
 * are fixed steps, not scaled to the values: today is usually <1% of the
 * year and would vanish at true scale.
 *
 * Rings share a bottom edge. Each label sits halfway down its own band,
 * i.e. top = (own diameter - next diameter) / 2 / own diameter.
 */
const RINGS = [
  {
    key: "year",
    label: "Tahun ini",
    size: "w-full",
    labelTop: "top-[12%]",
    fill: "bg-primary/15",
  },
  {
    key: "month",
    label: "Bulan ini",
    size: "w-[76%]",
    labelTop: "top-[14.5%]",
    fill: "bg-primary/25",
  },
  {
    key: "week",
    label: "Minggu ini",
    size: "w-[54%]",
    labelTop: "top-[20.4%]",
    fill: "bg-primary/35",
  },
  {
    key: "today",
    label: "Hari ini",
    size: "w-[32%]",
    labelTop: "top-1/2",
    fill: "bg-primary",
  },
] as const;

/** Row 2, right — the same spend zoomed from the year down to today. */
export function SpendingScopeCircles({ scopes }: { scopes: DashboardScopes }) {
  return (
    <DashboardCard
      title="Cakupan pengeluaran"
      description="Dari setahun sampai hari ini"
      className="lg:col-span-4"
    >
      <div
        className="relative mx-auto mt-auto aspect-square w-full max-w-[280px]"
        aria-hidden="true"
      >
        {RINGS.map((ring, i) => (
          <div
            key={ring.key}
            className={cn(
              "absolute bottom-0 left-1/2 aspect-square -translate-x-1/2 rounded-full",
              ring.size,
              ring.fill,
              // 2px surface gap between nested rings.
              i > 0 && "border-2 border-card"
            )}
          >
            <div
              className={cn(
                "absolute left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center leading-tight text-foreground",
                ring.labelTop
              )}
            >
              <p className="text-[11px]">{ring.label}</p>
              <p className="text-sm font-semibold">
                {formatCompactCurrency(scopes[ring.key])}
              </p>
            </div>
          </div>
        ))}
      </div>

      <dl className="sr-only">
        {RINGS.map((ring) => (
          <div key={ring.key}>
            <dt>{ring.label}</dt>
            <dd>{formatCurrency(scopes[ring.key])}</dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}

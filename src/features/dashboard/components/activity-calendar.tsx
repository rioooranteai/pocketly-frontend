import { Flame } from "lucide-react";

import { DashboardCard } from "@/features/dashboard/components/dashboard-card";
import {
  buildCalendarWeeks,
  formatDayLong,
  type HeatLevel,
} from "@/features/dashboard/utils";
import { cn, formatCurrency } from "@/lib/utils";
import type { DailyTotal } from "@/types/api";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const LEVEL_FILL: Record<HeatLevel, string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3",
  4: "bg-heat-4",
};

/**
 * Row 4, left (ref: "13 Days" widget) — the logging streak plus a
 * five-week calendar. Each dot is a day; darker = more spent.
 */
export function ActivityCalendar({
  daily,
  streak,
}: {
  daily: DailyTotal[];
  streak: number;
}) {
  const weeks = buildCalendarWeeks(daily);

  return (
    <DashboardCard
      title="Kebiasaan mencatat"
      description="5 minggu terakhir"
      className="lg:col-span-5"
      action={
        <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-foreground">
          <Flame size={15} className="text-primary" aria-hidden="true" />
          {streak} hari beruntun
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="pb-1 text-[11px] text-muted-foreground">
            {day}
          </span>
        ))}
        {weeks
          .flat()
          .map((cell, i) =>
            cell === null ? (
              <span key={`pad-${i}`} aria-hidden="true" />
            ) : (
              <span
                key={cell.date}
                role={cell.isFuture ? undefined : "img"}
                title={
                  cell.isFuture
                    ? undefined
                    : `${formatDayLong(cell.date)}: ${formatCurrency(cell.total)} · ${cell.count} transaksi`
                }
                aria-label={
                  cell.isFuture
                    ? undefined
                    : `${formatDayLong(cell.date)}, ${formatCurrency(cell.total)}, ${cell.count} transaksi`
                }
                aria-hidden={cell.isFuture || undefined}
                className={cn(
                  "mx-auto aspect-square w-full max-w-7 rounded-full",
                  cell.isFuture
                    ? "border border-border"
                    : LEVEL_FILL[cell.level],
                  cell.isToday &&
                    "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                )}
              />
            )
          )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        <span>Tidak ada</span>
        <span className="h-3 w-3 rounded-full bg-heat-0" />
        <span className="ml-2">Sedikit</span>
        {([1, 2, 3, 4] as const).map((level) => (
          <span
            key={level}
            className={cn("h-3 w-3 rounded-full", LEVEL_FILL[level])}
          />
        ))}
        <span>Banyak</span>
      </div>
    </DashboardCard>
  );
}

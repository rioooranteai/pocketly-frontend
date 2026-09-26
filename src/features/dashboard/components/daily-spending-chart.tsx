"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartTooltipBox,
  DashboardCard,
} from "@/features/dashboard/components/dashboard-card";
import { formatDayLong, parseLocalDate } from "@/features/dashboard/utils";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import type { DailyTotal } from "@/types/api";

const DAYS_SHOWN = 14;
const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

interface DayRow extends DailyTotal {
  label: string;
  isToday: boolean;
}

/**
 * Row 3, right — the last two weeks day by day. Today is the emphasized
 * bar; the hairline marks this month's daily average for reference.
 */
export function DailySpendingChart({
  daily,
  dailyAverage,
}: {
  daily: DailyTotal[];
  dailyAverage: number;
}) {
  const recent = daily.slice(-DAYS_SHOWN);
  const rows: DayRow[] = recent.map((d, i) => ({
    ...d,
    label: String(parseLocalDate(d.date).getDate()),
    isToday: i === recent.length - 1,
  }));

  return (
    <DashboardCard
      title="Pengeluaran harian"
      description={`${DAYS_SHOWN} hari terakhir`}
      className="lg:col-span-7"
      action={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Hari ini
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-3 bg-muted-foreground" />
            Rata-rata bulan ini
          </span>
        </div>
      }
    >
      {/* Fills the card when its row neighbour (categories) is taller. */}
      <div
        className="h-64 w-full lg:h-auto lg:min-h-64 lg:flex-1"
        aria-hidden="true"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              dy={6}
            />
            <YAxis
              width={72}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as DayRow;
                return (
                  <ChartTooltipBox
                    title={formatDayLong(row.date)}
                    value={formatCurrency(row.total)}
                    detail={`${row.count} transaksi`}
                  />
                );
              }}
            />
            <ReferenceLine
              y={dailyAverage}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
            />
            <Bar dataKey="total" maxBarSize={24} radius={[4, 4, 0, 0]}>
              {rows.map((row) => (
                <Cell
                  key={row.date}
                  fill={row.isToday ? "var(--primary)" : "var(--heat-1)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Pengeluaran per hari, {DAYS_SHOWN} hari terakhir</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date}>
              <th scope="row">{formatDayLong(r.date)}</th>
              <td>{formatCurrency(r.total)}</td>
              <td>{r.count} transaksi</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardCard>
  );
}

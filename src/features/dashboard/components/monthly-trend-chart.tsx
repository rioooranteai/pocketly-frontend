"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartTooltipBox,
  DashboardCard,
} from "@/features/dashboard/components/dashboard-card";
import { formatMonthLong, formatMonthShort } from "@/features/dashboard/utils";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import type { MonthlyTotal } from "@/types/api";

interface TrendRow {
  label: string;
  month: string;
  total: number;
  isCurrent: boolean;
}

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };

/** Row 2, left — the long view: 12 months of spending as one line. */
export function MonthlyTrendChart({ trend }: { trend: MonthlyTotal[] }) {
  const rows: TrendRow[] = trend.map((m, i) => ({
    label: formatMonthShort(m.month),
    month: m.month,
    total: m.total,
    isCurrent: i === trend.length - 1,
  }));
  // Average of complete months only — the current one is still running.
  const complete = rows.filter((r) => !r.isCurrent);
  const average =
    complete.reduce((acc, r) => acc + r.total, 0) / (complete.length || 1);

  return (
    <DashboardCard
      title="Tren pengeluaran"
      description="12 bulan terakhir · bulan ini masih berjalan"
      className="lg:col-span-8"
      action={
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Rata-rata / bulan</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCompactCurrency(average)}
          </p>
        </div>
      }
    >
      <div className="h-64 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
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
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as TrendRow;
                return (
                  <ChartTooltipBox
                    title={formatMonthLong(row.month)}
                    value={formatCurrency(row.total)}
                    detail={row.isCurrent ? "Masih berjalan" : undefined}
                  />
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="var(--primary)"
              fillOpacity={0.1}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--primary)",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Pengeluaran per bulan, 12 bulan terakhir</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month}>
              <th scope="row">{formatMonthLong(r.month)}</th>
              <td>{formatCurrency(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardCard>
  );
}

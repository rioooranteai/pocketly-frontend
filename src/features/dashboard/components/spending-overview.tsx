import {
  CalendarDays,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { percentChange } from "@/features/dashboard/utils";
import { cn, formatCurrency } from "@/lib/utils";
import type { DashboardSummary } from "@/types/api";

/**
 * Row 1 — the most general view: this month's spend as the hero number,
 * then three supporting KPIs. Spending going UP is bad news, so the
 * delta reads red when it rises and green when it falls.
 */
export function SpendingOverview({
  summary,
  now = new Date(),
}: {
  summary: DashboardSummary;
  now?: Date;
}) {
  const change = percentChange(
    summary.month_total,
    summary.previous_month_to_date_total
  );
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const monthProgress = (now.getDate() / daysInMonth) * 100;
  const perTransaction =
    summary.transaction_count > 0
      ? summary.month_total / summary.transaction_count
      : 0;

  return (
    <>
      <section className="flex min-w-0 flex-col justify-between gap-5 rounded-[20px] bg-card p-5 lg:col-span-5">
        <div>
          <p className="text-sm text-muted-foreground">Pengeluaran bulan ini</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {formatCurrency(summary.month_total)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {change !== null && <DeltaBadge change={change} />}
            <span className="text-muted-foreground">
              vs {formatCurrency(summary.previous_month_to_date_total)} di
              periode yang sama bulan lalu
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Bulan berjalan</span>
            <span>
              Hari ke-{now.getDate()} dari {daysInMonth}
            </span>
          </div>
          {/* SVG so the runtime width needs no inline style. */}
          <svg className="h-2 w-full" aria-hidden="true">
            <rect width="100%" height="8" rx="4" className="fill-heat-0" />
            <rect
              width={`${monthProgress}%`}
              height="8"
              rx="4"
              className="fill-primary"
            />
          </svg>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
        <StatTile
          icon={<Wallet size={16} />}
          label="Rata-rata per hari"
          value={formatCurrency(summary.daily_average)}
          hint="Total ÷ hari berjalan"
        />
        <StatTile
          icon={<Receipt size={16} />}
          label="Jumlah transaksi"
          value={String(summary.transaction_count)}
          hint={`Rata-rata ${formatCurrency(perTransaction)} per transaksi`}
        />
        <StatTile
          icon={<CalendarDays size={16} />}
          label="Hari aktif mencatat"
          value={`${summary.active_days} hari`}
          hint={`Dari ${now.getDate()} hari bulan ini`}
        />
      </div>
    </>
  );
}

function DeltaBadge({ change }: { change: number }) {
  const isUp = change > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        isUp ? "bg-expense/10 text-expense" : "bg-income/10 text-income"
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {isUp ? "Naik" : "Turun"} {Math.abs(change).toFixed(1).replace(".", ",")}%
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-3 rounded-[20px] bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary"
        >
          {icon}
        </span>
        <p className="text-xs">{label}</p>
      </div>
      <div>
        <p className="truncate text-2xl font-semibold text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

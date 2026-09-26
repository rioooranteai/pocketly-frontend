"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivityCalendar } from "@/features/dashboard/components/activity-calendar";
import { CategoryBreakdown } from "@/features/dashboard/components/category-breakdown";
import { DailySpendingChart } from "@/features/dashboard/components/daily-spending-chart";
import { MonthlyTrendChart } from "@/features/dashboard/components/monthly-trend-chart";
import { SpendingOverview } from "@/features/dashboard/components/spending-overview";
import { SpendingScopeCircles } from "@/features/dashboard/components/spending-scope-circles";
import { TopItemsList } from "@/features/dashboard/components/top-items-list";
import { useDashboard } from "@/features/dashboard/hooks";
import { cn } from "@/lib/utils";

/**
 * Widgets are ordered general → specific along the reading path (left to
 * right, top to bottom):
 *   1. this month's total + KPIs
 *   2. 12-month trend       · year → today scopes
 *   3. categories this month · last 14 days
 *   4. logging calendar      · top items
 * On a 12-column grid at lg; below that everything stacks in that order.
 */
export function DashboardView() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-[20px] bg-card px-6 py-12 text-center"
      >
        <AlertCircle className="text-expense" aria-hidden="true" />
        <p className="text-sm text-foreground">Gagal memuat dashboard.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <SpendingOverview summary={data.summary} />
      <MonthlyTrendChart trend={data.monthly_trend} />
      <SpendingScopeCircles scopes={data.scopes} />
      <CategoryBreakdown categories={data.categories} />
      <DailySpendingChart
        daily={data.daily}
        dailyAverage={data.summary.daily_average}
      />
      <ActivityCalendar
        daily={data.daily}
        streak={data.summary.current_streak}
      />
      <TopItemsList items={data.top_items} />
    </div>
  );
}

/** Mirrors the real grid so nothing jumps when data arrives. */
function DashboardSkeleton() {
  const blocks = [
    "h-44 lg:col-span-5",
    "h-44 lg:col-span-7",
    "h-80 lg:col-span-8",
    "h-80 lg:col-span-4",
    "h-80 lg:col-span-5",
    "h-80 lg:col-span-7",
    "h-72 lg:col-span-5",
    "h-72 lg:col-span-7",
  ];
  return (
    <div
      aria-busy="true"
      aria-label="Memuat dashboard"
      className="grid grid-cols-1 gap-4 lg:grid-cols-12"
    >
      {blocks.map((block) => (
        <div
          key={block}
          className={cn("animate-pulse rounded-[20px] bg-card", block)}
        />
      ))}
    </div>
  );
}

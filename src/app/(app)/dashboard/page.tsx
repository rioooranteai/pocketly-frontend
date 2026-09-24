import type { Metadata } from "next";

import { MonthlySummaryCards } from "@/features/dashboard/components/monthly-summary-cards";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan pengeluaran kamu bulan ini.
        </p>
      </div>

      <MonthlySummaryCards />
    </div>
  );
}

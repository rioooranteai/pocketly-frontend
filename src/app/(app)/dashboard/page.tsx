import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import { IS_DASHBOARD_DUMMY } from "@/features/dashboard/api";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pengeluaran kamu, dari gambaran besar sampai ke detail.
          </p>
        </div>
        {IS_DASHBOARD_DUMMY && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <FlaskConical size={13} aria-hidden="true" />
            Data dummy — menunggu API dashboard
          </span>
        )}
      </div>

      <DashboardView />
    </div>
  );
}

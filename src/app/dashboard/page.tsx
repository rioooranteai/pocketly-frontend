export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Preview page — sidebar collapse/expand testing.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Total Balance</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            Rp 4.250.000
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Income (bulan ini)</p>
          <p className="mt-1 text-2xl font-semibold text-income">
            +Rp 8.000.000
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Expense (bulan ini)</p>
          <p className="mt-1 text-2xl font-semibold text-expense">
            -Rp 3.750.000
          </p>
        </div>
      </div>
    </div>
  );
}

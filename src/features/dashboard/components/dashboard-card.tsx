import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  /** Right side of the header: a figure, a chip, a legend. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Shared white card shell for every dashboard widget. */
export function DashboardCard({
  title,
  description,
  action,
  className,
  children,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-[20px] bg-card p-5",
        className
      )}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

/** Tooltip body shared by the Recharts charts. */
export function ChartTooltipBox({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[10px] bg-btn-dark px-3 py-2 text-xs text-white shadow-lg">
      <p className="text-white/70">{title}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
      {detail && <p className="mt-0.5 text-white/70">{detail}</p>}
    </div>
  );
}

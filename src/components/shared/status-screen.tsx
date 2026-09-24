import { cn } from "@/lib/utils";

interface StatusScreenProps {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  /** Buttons/links for recovery, e.g. "Coba lagi" or "Kembali". */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Centered icon + message used by the route-level error and not-found
 * screens. Server-safe, so not-found can stay a Server Component.
 */
export function StatusScreen({
  icon,
  iconClassName = "bg-muted text-muted-foreground",
  title,
  description,
  children,
  className,
}: StatusScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          iconClassName
        )}
      >
        {icon}
      </div>
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children && (
        <div className="flex flex-wrap justify-center gap-2">{children}</div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

/* Both render inside the list's tinted frame, so fills use bg-card. */
export function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat transaksi" className="py-3">
      <div className="mx-4 mb-2.5 mt-2 h-2.5 w-32 animate-pulse rounded-md bg-card md:mx-6" />
      {["w-[62%]", "w-[48%]", "w-[70%]", "w-[55%]", "w-[44%]"].map((width) => (
        <div
          key={width}
          className="flex items-center gap-3.5 px-4 py-2.5 md:px-6"
        >
          <div className="h-10 w-10 animate-pulse rounded-xl bg-card" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn("h-3 animate-pulse rounded-md bg-card", width)}
            />
            <div className="h-2.5 w-1/3 animate-pulse rounded-md bg-card/60" />
          </div>
          <div className="h-3 w-[72px] animate-pulse rounded-md bg-card" />
        </div>
      ))}
    </div>
  );
}

export function ListMessage({
  icon,
  iconClassName = "bg-card text-muted-foreground",
  title,
  description,
  role,
  children,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  role?: "alert";
  children?: React.ReactNode;
}) {
  return (
    <div
      role={role}
      className="flex flex-1 flex-col items-center justify-center gap-3.5 px-6 py-12 text-center"
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          iconClassName
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

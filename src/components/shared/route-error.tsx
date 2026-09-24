"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { StatusScreen } from "@/components/shared/status-screen";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
  /** Where "Kembali" leads, e.g. the dashboard inside the app shell. */
  homeHref: string;
  className?: string;
}

/** Fallback UI shared by the `error.tsx` boundaries. */
export function RouteError({
  error,
  retry,
  homeHref,
  className,
}: RouteErrorProps) {
  useEffect(() => {
    // Hook an error reporting service (e.g. Sentry) in here once there is one.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      className={className}
      icon={<AlertTriangle size={28} />}
      iconClassName="bg-category-health text-category-health-foreground"
      title="Terjadi kesalahan"
      description="Halaman ini gagal dimuat. Coba lagi, atau kembali ke halaman sebelumnya."
    >
      <Button className="gap-2 rounded-full px-5" onClick={() => retry()}>
        <RefreshCw size={16} />
        Coba lagi
      </Button>
      <Button asChild variant="outline" className="rounded-full px-5">
        <Link href={homeHref}>Kembali</Link>
      </Button>
      {error.digest && (
        <p className="w-full text-xs text-muted-foreground">
          Kode error: {error.digest}
        </p>
      )}
    </StatusScreen>
  );
}

"use client";

import { RouteError } from "@/components/shared/route-error";
import { ROUTES } from "@/lib/constants";

/** Renders inside the app shell, so the sidebar stays usable after a crash. */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      homeHref={ROUTES.DASHBOARD}
      className="min-h-full rounded-[20px] bg-card"
    />
  );
}

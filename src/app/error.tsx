"use client";

import { RouteError } from "@/components/shared/route-error";
import { ROUTES } from "@/lib/constants";

/** Catches render errors outside the app shell (auth pages, root redirects). */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <RouteError
        error={error}
        retry={retry}
        homeHref={ROUTES.AUTH.LOGIN}
        className="w-full max-w-lg rounded-3xl bg-card"
      />
    </main>
  );
}

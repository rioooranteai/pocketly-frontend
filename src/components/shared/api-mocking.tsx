"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";

import { env } from "@/lib/env";

// Never in production builds, whatever the env var says.
const MOCKING_ENABLED =
  process.env.NODE_ENV === "development" &&
  env.NEXT_PUBLIC_API_MOCKING === "enabled";

/**
 * When mock mode is on, starts the MSW service worker before rendering
 * the app so the very first request already hits the dummy data. The
 * mocks are dynamically imported, so they never load otherwise.
 */
export function ApiMocking({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCKING_ENABLED);

  useEffect(() => {
    if (!MOCKING_ENABLED) return;
    let active = true;
    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      {children}
      {MOCKING_ENABLED && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg"
        >
          <FlaskConical size={13} aria-hidden="true" />
          Mode data dummy
        </div>
      )}
    </>
  );
}

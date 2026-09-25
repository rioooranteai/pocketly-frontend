"use client";

import { useEffect, useState } from "react";

/**
 * Seconds left before an action may be retried — for a 429's
 * `Retry-After`. `start(n)` begins counting down from n; 0 means ready.
 */
export function useCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return { secondsLeft, start: setSecondsLeft };
}

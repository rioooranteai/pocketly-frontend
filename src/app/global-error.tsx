"use client";

import "./globals.css";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces
 * that layout, so it renders its own <html>/<body> and imports the global
 * styles — and deliberately avoids app components that might be what broke.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-dvh items-center justify-center bg-background p-4">
        <title>Terjadi kesalahan · Pocketly</title>
        <main className="w-full max-w-md rounded-3xl bg-card px-6 py-12 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Terjadi kesalahan
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Aplikasi gagal dimuat. Coba lagi dalam beberapa saat.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-5 h-10 rounded-full bg-btn-dark px-5 text-sm font-medium text-white transition-colors hover:bg-btn-dark-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}

"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { getQueryClient } from "@/lib/query-client";
import { ApiMocking } from "@/components/shared/api-mocking";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ApiMocking>{children}</ApiMocking>
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/features/dashboard/api";
import { dashboardKeys } from "@/features/dashboard/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: ({ signal }) => dashboardApi.get(signal),
  });
}

import { buildDashboardMock } from "@/features/dashboard/mock-data";
import type { DashboardResponse } from "@/types/api";

/**
 * True while the dashboard renders dummy data. Flip to false (and drop
 * the mock) once the dedicated backend endpoint ships.
 */
export const IS_DASHBOARD_DUMMY = true;

/** Short fake latency so loading states are visible during prototyping. */
const MOCK_LATENCY_MS = 400;

export const dashboardApi = {
  /**
   * TODO(backend): replace the body with
   *   return apiClient.get<DashboardResponse>("/api/v1/dashboard", { signal });
   * once the endpoint exists. Its shape is drafted as `DashboardResponse`
   * in `@/types/api`; the components only depend on that type.
   */
  get(signal?: AbortSignal): Promise<DashboardResponse> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => resolve(buildDashboardMock()),
        MOCK_LATENCY_MS
      );
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason);
        },
        { once: true }
      );
    });
  },
};

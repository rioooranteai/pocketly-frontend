/**
 * Query key factory for the dashboard. When the real endpoint lands,
 * transaction mutations should also invalidate `dashboardKeys.all`.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};

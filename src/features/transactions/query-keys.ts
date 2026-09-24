/**
 * Query key factory — the single place transaction cache keys are built.
 * Invalidating `transactionKeys.all` refreshes every transaction query.
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
};

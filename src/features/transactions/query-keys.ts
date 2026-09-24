/**
 * Query key factory — the single place transaction cache keys are built.
 * Invalidating `transactionKeys.all` refreshes lists and details at once.
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
};

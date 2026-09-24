/** Client-side pagination helpers (the list API returns everything at once). */

export interface PageSlice<T> {
  items: T[];
  /** Clamped into 1..totalPages (e.g. after deleting the last row of a page). */
  page: number;
  totalPages: number;
  /** 1-based range shown ("11–20"); both 0 when there are no items. */
  from: number;
  to: number;
  total: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PageSlice<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return {
    items: pageItems,
    page: current,
    totalPages,
    from: pageItems.length > 0 ? start + 1 : 0,
    to: start + pageItems.length,
    total: items.length,
  };
}

export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to render: always first and last, the current page ±1,
 * and an ellipsis for each gap — `1 … 4 5 6 … 12`. Never more than 7.
 */
export function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  // Keep the window 3 wide even at the edges: 1 2 3 4 … 12 / 1 … 9 10 11 12.
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
}

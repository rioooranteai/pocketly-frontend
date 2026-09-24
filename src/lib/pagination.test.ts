import { describe, expect, it } from "vitest";

import { getPageItems, paginate } from "@/lib/pagination";

const items = Array.from({ length: 23 }, (_, i) => i + 1);

describe("paginate", () => {
  it("slices a page and reports its 1-based range", () => {
    expect(paginate(items, 2, 10)).toMatchObject({
      items: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      page: 2,
      totalPages: 3,
      from: 11,
      to: 20,
      total: 23,
    });
    expect(paginate(items, 3, 10)).toMatchObject({
      items: [21, 22, 23],
      from: 21,
      to: 23,
    });
  });

  it("clamps an out-of-range page (e.g. the last row of a page was deleted)", () => {
    expect(paginate(items, 9, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
  });

  it("reports one empty page for no items", () => {
    expect(paginate([], 1, 10)).toMatchObject({
      items: [],
      page: 1,
      totalPages: 1,
      from: 0,
      to: 0,
    });
  });
});

describe("getPageItems", () => {
  it("lists every page when there are few", () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses gaps around the current page", () => {
    expect(getPageItems(6, 12)).toEqual([
      1,
      "ellipsis-start",
      5,
      6,
      7,
      "ellipsis-end",
      12,
    ]);
  });

  it("keeps a full window at the edges", () => {
    expect(getPageItems(1, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 12]);
    expect(getPageItems(12, 12)).toEqual([
      1,
      "ellipsis-start",
      8,
      9,
      10,
      11,
      12,
    ]);
  });

  it("never renders more than 7 slots", () => {
    for (let page = 1; page <= 30; page += 1) {
      expect(getPageItems(page, 30).length).toBeLessThanOrEqual(7);
    }
  });
});

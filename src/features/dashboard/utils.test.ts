import { describe, expect, it } from "vitest";

import { buildDashboardMock } from "@/features/dashboard/mock-data";
import {
  buildCalendarWeeks,
  heatLevel,
  percentChange,
} from "@/features/dashboard/utils";

describe("percentChange", () => {
  it("returns the signed change in percent", () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(80, 100)).toBe(-20);
  });

  it("returns null without a base to compare against", () => {
    expect(percentChange(50, 0)).toBeNull();
  });
});

describe("heatLevel", () => {
  it("maps nothing to 0 and the busiest day to 4", () => {
    expect(heatLevel(0, 100)).toBe(0);
    expect(heatLevel(1, 100)).toBe(1);
    expect(heatLevel(60, 100)).toBe(3);
    expect(heatLevel(100, 100)).toBe(4);
  });
});

describe("buildCalendarWeeks", () => {
  it("starts on the first Monday and fills the last week with future days", () => {
    // 2026-09-20 is a Sunday, 2026-09-21 a Monday, 2026-09-26 a Saturday.
    const weeks = buildCalendarWeeks([
      { date: "2026-09-20", total: 5, count: 1 },
      { date: "2026-09-21", total: 10, count: 1 },
      { date: "2026-09-22", total: 0, count: 0 },
      { date: "2026-09-23", total: 0, count: 0 },
      { date: "2026-09-24", total: 0, count: 0 },
      { date: "2026-09-25", total: 0, count: 0 },
      { date: "2026-09-26", total: 20, count: 2 },
    ]);
    expect(weeks).toHaveLength(1);
    const [week] = weeks;
    expect(week[0]?.date).toBe("2026-09-21");
    expect(week[5]).toMatchObject({ isToday: true, level: 4 });
    expect(week[6]).toMatchObject({ date: "2026-09-27", isFuture: true });
  });

  it("pads a window shorter than a week that has no Monday", () => {
    const [week] = buildCalendarWeeks([
      { date: "2026-09-24", total: 10, count: 1 },
    ]);
    expect(week.slice(0, 3)).toEqual([null, null, null]);
    expect(week[3]?.date).toBe("2026-09-24");
  });

  it("gives the mock's 35 days five full rows", () => {
    const weeks = buildCalendarWeeks(
      buildDashboardMock(new Date(2026, 8, 26)).daily
    );
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
});

describe("buildDashboardMock", () => {
  const now = new Date(2026, 8, 26, 21, 0);
  const data = buildDashboardMock(now);

  it("is deterministic for the same moment", () => {
    expect(buildDashboardMock(now)).toEqual(data);
  });

  it("keeps the totals internally consistent", () => {
    const monthDays = data.daily.filter((d) => d.date.startsWith("2026-09"));
    const sumOf = (values: number[]) => values.reduce((a, b) => a + b, 0);

    expect(data.daily).toHaveLength(35);
    expect(data.daily.at(-1)?.date).toBe("2026-09-26");
    expect(data.summary.month_total).toBe(sumOf(monthDays.map((d) => d.total)));
    expect(sumOf(data.categories.map((c) => c.total))).toBe(
      data.summary.month_total
    );
    expect(data.monthly_trend.at(-1)?.total).toBe(data.summary.month_total);
    expect(data.scopes.today).toBeLessThanOrEqual(data.scopes.week);
    expect(data.scopes.week).toBeLessThanOrEqual(data.scopes.month);
    expect(data.scopes.month).toBeLessThanOrEqual(data.scopes.year);
  });
});

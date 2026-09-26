import { toDateInputValue } from "@/lib/utils";
import type { DailyTotal } from "@/types/api";

/**
 * Pure helpers for the dashboard charts. Kept free of React so they're
 * easy to unit test and to reuse once the real endpoint ships.
 */

/** Percent change from `previous` to `current`; null when there's no base. */
export function percentChange(current: number, previous: number) {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/** "yyyy-mm-dd" → local Date at midnight (not UTC, unlike `new Date(str)`). */
export function parseLocalDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "yyyy-mm" → local Date on the 1st. */
export function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

export function formatMonthShort(key: string) {
  return parseMonthKey(key).toLocaleDateString("id-ID", { month: "short" });
}

export function formatMonthLong(key: string) {
  return parseMonthKey(key).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

/** "2026-09-26" → "Sab, 26 Sep" */
export function formatDayLong(key: string) {
  return parseLocalDate(key).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

/** 0 = nothing spent; 1..4 = quarters of the busiest day in the window. */
export function heatLevel(total: number, max: number): HeatLevel {
  if (total <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((total / max) * 4))) as HeatLevel;
}

export interface CalendarCell {
  date: string;
  total: number;
  count: number;
  level: HeatLevel;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Lays the daily totals out as calendar weeks, Monday first. Days before
 * the first Monday are dropped so the grid starts on a full row; days
 * after the last one (today) are marked `isFuture` so the final week
 * still has seven cells.
 */
export function buildCalendarWeeks(daily: DailyTotal[]) {
  const firstMonday = daily.findIndex(
    (d) => parseLocalDate(d.date).getDay() === 1
  );
  const days = firstMonday === -1 ? daily : daily.slice(firstMonday);
  if (days.length === 0) return [];

  const max = Math.max(...days.map((d) => d.total));
  // Only a window shorter than a week can lack a Monday: pad its start.
  const leading =
    firstMonday === -1 ? (parseLocalDate(days[0].date).getDay() + 6) % 7 : 0;
  const cells: (CalendarCell | null)[] = Array(leading).fill(null);
  days.forEach((day, i) => {
    cells.push({
      ...day,
      level: heatLevel(day.total, max),
      isToday: i === days.length - 1,
      isFuture: false,
    });
  });

  const last = parseLocalDate(daily[daily.length - 1].date);
  const trailing = 6 - ((last.getDay() + 6) % 7);
  for (let i = 1; i <= trailing; i++) {
    const date = new Date(last);
    date.setDate(last.getDate() + i);
    cells.push({
      date: toDateInputValue(date),
      total: 0,
      count: 0,
      level: 0,
      isToday: false,
      isFuture: true,
    });
  }

  const weeks: (CalendarCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

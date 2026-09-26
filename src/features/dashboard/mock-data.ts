import { toDateInputValue, toRfc3339 } from "@/lib/utils";
import type {
  Category,
  CategoryTotal,
  DailyTotal,
  DashboardResponse,
  MonthlyTotal,
  TopItem,
} from "@/types/api";

/**
 * Dummy data for the dashboard until `GET /api/v1/dashboard` exists.
 * Everything is generated relative to `now` and seeded by date, so the
 * page always looks current and a given day keeps the same numbers
 * across reloads. Totals are internally consistent (the month total is
 * the sum of this month's days, categories add up to it, etc.).
 */

export const DAILY_WINDOW_DAYS = 35;

/** Small deterministic PRNG (FNV-1a hash → mulberry32). */
function seededRandom(key: string) {
  let hash = 2166136261;
  for (const char of key) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let r = Math.imul(state ^ (state >>> 15), 1 | state);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const roundTo500 = (value: number) => Math.round(value / 500) * 500;

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function mockDay(date: Date, isToday: boolean): DailyTotal {
  const key = toDateInputValue(date);
  const rand = seededRandom(key);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  // About 1 in 5 days has nothing logged — but never today, so the
  // streak and the "today" scope always have something to show.
  if (!isToday && rand() < 0.2) return { date: key, total: 0, count: 0 };

  const count = 1 + Math.floor(rand() * (isWeekend ? 4 : 3));
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += 15000 + rand() * (isWeekend ? 220000 : 120000);
  }
  return { date: key, total: roundTo500(total), count };
}

const CATEGORY_WEIGHTS: [Category, number][] = [
  ["food", 0.36],
  ["transportation", 0.17],
  ["shopping", 0.15],
  ["bills", 0.13],
  ["entertainment", 0.08],
  ["health", 0.05],
  ["others", 0.04],
  ["uncategorized", 0.02],
];

function mockCategories(
  monthKey: string,
  monthTotal: number,
  transactionCount: number
): CategoryTotal[] {
  const rand = seededRandom(`categories-${monthKey}`);
  const jittered = CATEGORY_WEIGHTS.map(
    ([category, weight]) => [category, weight * (0.7 + rand() * 0.6)] as const
  );
  const weightSum = sum(jittered.map(([, w]) => w));

  const rows = jittered.map(([category, w]) => ({
    category,
    total: roundTo500((monthTotal * w) / weightSum),
    count: Math.max(1, Math.round((transactionCount * w) / weightSum)),
  }));
  rows.sort((a, b) => b.total - a.total);
  // Rounding drift goes to the largest category so the parts add up.
  rows[0].total += monthTotal - sum(rows.map((r) => r.total));
  return rows.filter((r) => r.total > 0);
}

const ITEM_CATALOG = [
  { name: "Kopi susu gula aren", price: 22000, perDay: 0.9 },
  { name: "Bensin Pertalite", price: 50000, perDay: 0.35 },
  { name: "Nasi goreng", price: 18000, perDay: 0.6 },
  { name: "Ojek online", price: 16000, perDay: 0.7 },
  { name: "Token listrik", price: 200000, perDay: 0.04 },
  { name: "Air mineral 1,5 L", price: 7000, perDay: 0.8 },
  { name: "Roti tawar", price: 17500, perDay: 0.25 },
];

function mockTopItems(monthKey: string, dayOfMonth: number): TopItem[] {
  const rand = seededRandom(`items-${monthKey}-${dayOfMonth}`);
  return ITEM_CATALOG.map((item) => {
    const quantity = Math.max(
      1,
      Math.round(item.perDay * dayOfMonth * (0.7 + rand() * 0.6))
    );
    return {
      name: item.name,
      quantity,
      total: quantity * item.price,
      transaction_count: Math.max(1, Math.round(quantity * 0.8)),
    };
  })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export function buildDashboardMock(now: Date = new Date()): DashboardResponse {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthKey = toDateInputValue(today).slice(0, 7);

  const daily = Array.from({ length: DAILY_WINDOW_DAYS }, (_, i) => {
    const offset = i - (DAILY_WINDOW_DAYS - 1);
    return mockDay(addDays(today, offset), offset === 0);
  });

  // 35 days always covers the whole current month (max 31 days).
  const thisMonth = daily.filter((d) => d.date.startsWith(monthKey));
  const monthTotal = sum(thisMonth.map((d) => d.total));
  const transactionCount = sum(thisMonth.map((d) => d.count));

  let streak = 0;
  for (let i = daily.length - 1; i >= 0 && daily[i].count > 0; i--) streak++;

  const mondayOffset = (today.getDay() + 6) % 7;
  const weekStart = toDateInputValue(addDays(today, -mondayOffset));

  const monthlyTrend: MonthlyTotal[] = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    const key = toDateInputValue(month).slice(0, 7);
    if (i === 11) return { month: key, total: monthTotal };
    const rand = seededRandom(`month-${key}`);
    return { month: key, total: roundTo500(3_200_000 + rand() * 3_300_000) };
  });

  const daysInPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  ).getDate();
  const previousToDate = roundTo500(
    monthlyTrend[10].total * Math.min(1, today.getDate() / daysInPreviousMonth)
  );

  return {
    generated_at: toRfc3339(now),
    summary: {
      month_total: monthTotal,
      previous_month_to_date_total: previousToDate,
      transaction_count: transactionCount,
      daily_average: roundTo500(monthTotal / today.getDate()),
      active_days: thisMonth.filter((d) => d.count > 0).length,
      current_streak: streak,
    },
    scopes: {
      year: sum(
        monthlyTrend
          .filter((m) => m.month.startsWith(`${today.getFullYear()}-`))
          .map((m) => m.total)
      ),
      month: monthTotal,
      week: sum(daily.filter((d) => d.date >= weekStart).map((d) => d.total)),
      today: daily[daily.length - 1].total,
    },
    monthly_trend: monthlyTrend,
    daily,
    categories: mockCategories(monthKey, monthTotal, transactionCount),
    top_items: mockTopItems(monthKey, today.getDate()),
  };
}

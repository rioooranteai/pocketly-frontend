/**
 * API Type Definitions
 * Source of truth: the backend's docs/api-contract.md (API v1).
 */

import type { TRANSACTION_CATEGORIES } from "@/lib/constants";

// ============ Common ============

/** Body of every JSON error response (except unknown routes: plain text). */
export interface ApiErrorBody {
  error: string;
}

// ============ Auth Types ============

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

/** Returned by /register and /login — NOT wrapped in `data`. */
export interface AuthResponse {
  name: string;
  email: string;
  token: string;
}

/** What the client keeps about the signed-in user (from AuthResponse). */
export interface User {
  name: string;
  email: string;
}

// ============ Transaction Types ============

export type Category = (typeof TRANSACTION_CATEGORIES)[number];

export interface TransactionItem {
  name: string;
  /** Integer, >= 0. */
  quantity: number;
  /** Unit price, >= 0. */
  price: number;
}

/**
 * Body for POST /transactions and PUT /transactions/:id. `category`,
 * `total_amount` and `id` are computed by the server — never send them.
 */
export interface CreateTransactionRequest {
  description: string;
  /** Full RFC 3339 with time and offset; a bare date is rejected. */
  date: string;
  /** At least one; PUT replaces the whole list. */
  items: TransactionItem[];
}

export type UpdateTransactionRequest = CreateTransactionRequest;

export interface TransactionResponse {
  id: string;
  description: string;
  category: Category;
  total_amount: number;
  /** RFC 3339, in the offset it was sent with (scans: UTC). */
  date: string;
  /** Items carry no id of their own. */
  items: TransactionItem[];
}

// ============ Dashboard Types (PROPOSED) ============
//
// Draft shape for a dedicated `GET /api/v1/dashboard` — NOT in the backend
// contract yet. Until it ships, the FE renders it from dummy data
// (features/dashboard/mock-data.ts). Update these when the contract lands.
// All amounts are expenses in IDR, aggregated in the user's timezone.

export interface DashboardSummary {
  /** Spending from the 1st of this month up to now. */
  month_total: number;
  /** Last month over the same number of days, for a fair comparison. */
  previous_month_to_date_total: number;
  transaction_count: number;
  /** month_total / days elapsed this month. */
  daily_average: number;
  /** Days this month with at least one transaction. */
  active_days: number;
  /** Consecutive days, ending today, with at least one transaction. */
  current_streak: number;
}

/** Nested spending scopes: today ⊂ this week ⊂ this month ⊂ this year. */
export interface DashboardScopes {
  year: number;
  month: number;
  /** Monday of this week up to now. */
  week: number;
  today: number;
}

export interface MonthlyTotal {
  /** yyyy-mm */
  month: string;
  total: number;
}

export interface DailyTotal {
  /** yyyy-mm-dd, local calendar date. */
  date: string;
  total: number;
  count: number;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

export interface TopItem {
  name: string;
  /** Sum of item quantities this month. */
  quantity: number;
  total: number;
  /** How many transactions contained the item. */
  transaction_count: number;
}

export interface DashboardResponse {
  /** RFC 3339 */
  generated_at: string;
  summary: DashboardSummary;
  scopes: DashboardScopes;
  /** Last 12 months, oldest first; the current month is partial. */
  monthly_trend: MonthlyTotal[];
  /** Last 35 days, oldest first, ending today; empty days included as 0. */
  daily: DailyTotal[];
  /** This month, highest total first. */
  categories: CategoryTotal[];
  /** This month, highest total first, at most 5. */
  top_items: TopItem[];
}

// ============ Envelopes ============

/** GET /transactions and GET /transactions/:id. */
export interface DataResponse<T> {
  data: T;
}

/** POST /transactions, PUT /transactions/:id, POST /transactions/scan. */
export interface MessageDataResponse<T> {
  message: string;
  data: T;
}

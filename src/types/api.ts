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

/**
 * API Type Definitions
 * Derived from Pocketly backend Go DTOs
 */

import type { TRANSACTION_CATEGORIES } from "@/lib/constants";

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

export interface AuthResponse {
  name: string;
  email: string;
  token: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  createdAt?: string;
}

// ============ Transaction Types ============

export interface TransactionItemRequest {
  name: string;
  quantity: number;
  price: number;
}

export interface TransactionItemResponse {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateTransactionRequest {
  description: string;
  date: string; // ISO 8601 format
  items: TransactionItemRequest[];
}

export type UpdateTransactionRequest = CreateTransactionRequest;

export interface TransactionResponse {
  id: string;
  description: string;
  category: string;
  total_amount: number;
  date: string; // ISO 8601 format
  items: TransactionItemResponse[];
}

/** Alias for compatibility */
export type Transaction = TransactionResponse;

// ============ List Response Types ============

export interface ListTransactionResponse {
  data: TransactionResponse[];
  message?: string;
}

export interface GetTransactionResponse {
  data: TransactionResponse;
  message?: string;
}

export interface CreateTransactionResponse {
  message: string;
  data: TransactionResponse;
}

export interface UpdateTransactionResponse {
  message: string;
  data: TransactionResponse;
}

// ============ Helper Types ============

export type Category = (typeof TRANSACTION_CATEGORIES)[number];

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
}

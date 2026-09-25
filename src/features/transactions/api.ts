import { apiClient } from "@/lib/api-client";
import { SCAN_TIMEOUT } from "@/lib/constants";
import type {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from "@/types/api";

/**
 * Transaction API calls (contract §5). All routes require auth (apiClient
 * attaches the Bearer token). Responses come as {data: T} or
 * {message, data: T}; apiClient unwraps them, so callers get T directly.
 * DELETE answers 204 with no body.
 */
export const transactionsApi = {
  list(signal?: AbortSignal) {
    return apiClient.get<TransactionResponse[]>("/api/v1/transactions", {
      signal,
    });
  },

  create(data: CreateTransactionRequest) {
    return apiClient.post<TransactionResponse>("/api/v1/transactions", data);
  },

  update(id: string, data: UpdateTransactionRequest) {
    return apiClient.put<TransactionResponse>(
      `/api/v1/transactions/${id}`,
      data
    );
  },

  remove(id: string) {
    return apiClient.delete<void>(`/api/v1/transactions/${id}`);
  },

  /**
   * Upload a receipt image (form field "receipt", max 5MB) — the backend
   * reads description + items with AI, categorizes, and saves it in one
   * step, dated at scan time (UTC). Takes up to ~25s; a 422 means the
   * receipt couldn't be read and nothing was saved.
   */
  scan(file: File) {
    return apiClient.uploadFile<TransactionResponse>(
      "/api/v1/transactions/scan",
      file,
      "receipt",
      { timeoutMs: SCAN_TIMEOUT }
    );
  },
};

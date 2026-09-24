import { apiClient } from "@/lib/api-client";
import type {
  CreateTransactionRequest,
  TransactionResponse,
  UpdateTransactionRequest,
} from "@/types/api";

/**
 * Transaction API calls. All routes require auth (apiClient attaches
 * the Bearer token automatically). Response shapes vary slightly per
 * endpoint on the backend ({data: T} vs {message, data: T}), but
 * apiClient already unwraps the outer {data: T} envelope, so callers
 * here just get T back directly.
 */
export const transactionsApi = {
  list(signal?: AbortSignal) {
    return apiClient.get<TransactionResponse[]>("/api/v1/transactions", {
      signal,
    });
  },

  get(id: string, signal?: AbortSignal) {
    return apiClient.get<TransactionResponse>(`/api/v1/transactions/${id}`, {
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
   * Upload a receipt image — backend extracts description + items via
   * OpenAI Vision, categorizes it, and creates the transaction in one
   * step. Field name must be "receipt" to match the Go handler's
   * c.FormFile("receipt").
   */
  scan(file: File) {
    return apiClient.uploadFile<TransactionResponse>(
      "/api/v1/transactions/scan",
      file,
      "receipt"
    );
  },
};

import { API_BASE_URL, API_TIMEOUT } from "@/lib/constants";
import { getQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth";

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiErrorDetail {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorDetail {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * User-facing message for any thrown error: the backend's message for an
 * ApiError, otherwise the caller's fallback (unexpected/non-API errors).
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export interface RequestOptions {
  /** Lets TanStack Query cancel in-flight requests (unmount, key change). */
  signal?: AbortSignal;
  /** Overrides API_TIMEOUT for slow endpoints (ms). */
  timeoutMs?: number;
}

/**
 * Expired/invalid token: drop the session and every cached query so the
 * next user never sees this one's data. AuthGuard notices the null token
 * and redirects to /login on its own.
 */
function handleUnauthorized() {
  useAuthStore.getState().clearAuth();
  getQueryClient().clear();
}

/**
 * HTTP client untuk komunikasi dengan backend.
 * Automatically attach auth token, handle errors, dan timeout.
 */
export const apiClient = {
  async request<T = unknown>(
    endpoint: string,
    { timeoutMs = API_TIMEOUT, ...options }: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);

    // FormData needs the browser to set Content-Type (with its boundary).
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = useAuthStore.getState().token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // One signal for both the timeout and the caller's own cancellation.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const callerSignal = options.signal;
    const abortFromCaller = () => controller.abort();
    if (callerSignal?.aborted) controller.abort();
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type");
      let data: unknown = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text")) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      if (!response.ok) {
        // Only an authenticated request means the session died; a 401
        // from /login is just wrong credentials.
        if (response.status === 401 && token) {
          handleUnauthorized();
        }

        const errorMessage =
          typeof data === "object" && data !== null && "error" in data
            ? (data as { error: string }).error
            : `HTTP ${response.status}`;

        throw new ApiError(response.status, errorMessage, data);
      }

      // Handle response shape: sometimes wrapped in {data: T}, sometimes direct T
      if (
        typeof data === "object" &&
        data !== null &&
        "data" in data &&
        !Array.isArray(data)
      ) {
        return (data as { data: T }).data;
      }

      return data as T;
    } catch (error) {
      // Cancelled by the caller — rethrow as-is so TanStack Query treats
      // it as a cancellation, not a timeout.
      if (error instanceof ApiError || callerSignal?.aborted) {
        throw error;
      }

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiError(0, "Network error. Please check your connection.");
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(0, `Request timeout (${timeoutMs}ms exceeded)`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  },

  get<T = unknown>(endpoint: string, { signal }: RequestOptions = {}) {
    return this.request<T>(endpoint, { method: "GET", signal });
  },

  post<T = unknown>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T = unknown>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  },

  /**
   * Upload file dengan multipart/form-data
   */
  uploadFile<T = unknown>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    { timeoutMs }: RequestOptions = {}
  ) {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
      timeoutMs,
    });
  },
};

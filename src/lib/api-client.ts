import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "./constants";

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
 * HTTP client untuk komunikasi dengan backend.
 * Automatically attach auth token, handle errors, dan retry logic.
 */
export const apiClient = {
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== "undefined" 
      ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiError(0, "Network error. Please check your connection.");
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(0, `Request timeout (${API_TIMEOUT}ms exceeded)`);
      }

      throw error;
    }
  },

  get<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
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
  async uploadFile<T = unknown>(
    endpoint: string,
    file: File,
    fieldName: string = "file"
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : null;

    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error || `HTTP ${response.status}`;
        throw new ApiError(response.status, errorMessage, data);
      }

      if (typeof data === "object" && data !== null && "data" in data) {
        return (data as { data: T }).data;
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(0, `Request timeout (${API_TIMEOUT}ms exceeded)`);
      }

      throw error;
    }
  },
};

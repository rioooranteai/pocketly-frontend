import { env } from "@/lib/env";

/**
 * API Configuration
 */
export const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Routes
 */
export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  TRANSACTIONS: {
    LIST: "/transactions",
    NEW: "/transactions/new",
    DETAIL: (id: string) => `/transactions/${id}`,
    EDIT: (id: string) => `/transactions/${id}/edit`,
  },
  CHATBOT: "/chatbot",
  SETTINGS: "/settings",
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_STORE: "pocketly_auth",
  // Old key where the whole auth store used to live — removed on startup.
  LEGACY_AUTH_TOKEN: "pocketly_token",
} as const;

/**
 * Transaction Categories (fallback values)
 */
export const TRANSACTION_CATEGORIES = [
  "uncategorized",
  "food",
  "transportation",
  "shopping",
  "entertainment",
  "utilities",
  "health",
  "education",
  "other",
] as const;

/**
 * Form Validation Rules
 */
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  TRANSACTION_DESCRIPTION_MIN: 3,
  TRANSACTION_DESCRIPTION_MAX: 500,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * UI Constants
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

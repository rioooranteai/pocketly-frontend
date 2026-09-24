import { env } from "@/lib/env";

/**
 * API Configuration
 */
export const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;
export const API_TIMEOUT = 30000; // 30 seconds
// Receipt scans wait on OpenAI Vision, which regularly takes longer.
export const SCAN_TIMEOUT = 90000; // 90 seconds

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

import { env } from "@/lib/env";

/**
 * API Configuration
 */
export const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;
export const API_TIMEOUT = 30000; // 30 seconds
// The backend gives OpenAI Vision up to 25s per scan; the API contract
// asks the client to wait at least 30s, so leave headroom above that.
export const SCAN_TIMEOUT = 40000; // 40 seconds

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
 * Session marker cookie — mirrors "has a token" from the auth store so
 * src/proxy.ts (which can't read localStorage) can redirect optimistically.
 * Holds no secret; the token itself stays in localStorage.
 */
export const SESSION_COOKIE = {
  NAME: "pocketly_session",
  MAX_AGE: 60 * 60 * 24 * 30, // 30 days
} as const;

/**
 * Transaction categories — the closed set the backend assigns (API
 * contract §3). "others" is a confident "none of the above";
 * "uncategorized" means the AI couldn't decide.
 */
export const TRANSACTION_CATEGORIES = [
  "food",
  "transportation",
  "shopping",
  "bills",
  "entertainment",
  "health",
  "others",
  "uncategorized",
] as const;

/**
 * Form Validation Rules
 */
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  // Receipt upload limit on POST /transactions/scan.
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

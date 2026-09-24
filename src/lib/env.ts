import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url({
    message:
      "NEXT_PUBLIC_API_BASE_URL must be a full URL (e.g. http://localhost:8080)",
  }),
  // "enabled" serves dummy data from src/mocks (MSW) instead of the backend.
  // Development only — ignored in production builds.
  NEXT_PUBLIC_API_MOCKING: z.enum(["enabled", "disabled"]).default("disabled"),
});

const isProduction = process.env.NODE_ENV === "production";

// NEXT_PUBLIC_* vars are inlined at build time only when read as literal
// `process.env.X` expressions, so each one is listed explicitly here.
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    // Local dev/tests fall back to the default backend; production must
    // set it explicitly so a missing value fails the build, not users.
    (isProduction ? undefined : "http://localhost:8080"),
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`
  );
}

export const env = parsed.data;

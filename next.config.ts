import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// The browser calls the backend directly, so its origin must be allowed in
// connect-src. src/lib/env.ts fails the build when this is missing in prod.
const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).origin;

/**
 * Static CSP (no nonces), per the Next.js CSP guide — keeps pages
 * statically renderable. 'unsafe-inline' scripts are needed for Next's
 * inline bootstrap without nonces; 'unsafe-eval' only in dev for React's
 * debugging. blob: covers the local receipt previews before upload.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${apiOrigin}`,
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Would rewrite an http:// API (local dev, `next start` locally) to https.
  ...(apiOrigin.startsWith("https:") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Browsers ignore HSTS over plain http, so it's only sent in production.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

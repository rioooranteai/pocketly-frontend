import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

/**
 * End-to-end tests run against `next dev` in dummy-data mode (MSW), so
 * they need no backend. Locally they reuse an already-running dev server.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080",
      NEXT_PUBLIC_API_MOCKING: "enabled",
    },
  },
});

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  // Browser startup and axe injection can be slow on constrained CI hosts.
  // Keep the suite serial and give genuine checks time to complete.
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4325",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      // Tolerate font-antialiasing noise; catch real layout regressions.
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npx astro preview --port 4325 --host 127.0.0.1",
    url: "http://127.0.0.1:4325/en/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

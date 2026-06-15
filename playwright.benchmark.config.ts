import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/benchmark",
  timeout: 10 * 60 * 1000,
  expect: { timeout: 5 * 60 * 1000 },
  // Run serially — network contention between parallel tests would skew timings
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "benchmark-report", open: "never" }],
  ],
  use: {
    trace: "off",
    screenshot: "off",
    // No baseURL — tests use full URLs from env vars / defaults in spec
  },
  projects: [
    // Single browser for consistency; Chromium is fastest and closest to real usage
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // No webServer block — tests target external dev deployments
});

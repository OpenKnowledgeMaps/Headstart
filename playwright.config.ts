import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Folder for e2e tests
  testDir: "./e2e",
  // Maximum duration of a single test
  timeout: 5 * 60 * 1000,
  // Allow running test files in parallel
  fullyParallel: true,
  // Protect against accidental commit of test.only in CI
  forbidOnly: !!process.env.CI,
  // Number of retries for failed tests
  retries: process.env.CI ? 2 : 0,
  // In CI, limit to one worker for stability
  workers: process.env.CI ? 1 : undefined,
  // Report format after running
  reporter: "html",
  // Explicitly specify the test files to run
  testMatch: /.*\.spec\.ts/,
  // Output directory for test artifacts (screenshots/traces/videos)
  outputDir: "test-results/",
  // Global browser context settings for all tests
  use: {
    // Base URL for page.goto("/path")
    baseURL: "http://localhost:8085",
    // Trace is collected only on the first retry (useful for debugging failures)
    trace: "on-first-retry",
    // Screenshot is saved only on test failure
    screenshot: "only-on-failure",
  },
  // Set of browsers/environments to run tests on
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  // Local dev server that is started before tests
  webServer: {
    // Command to start the application before tests
    command: "npm start",
    // URL that Playwright waits for the application to be ready
    url: "http://localhost:8085",
    // Reuse the already started server locally; in CI always start a new
    reuseExistingServer: !process.env.CI,
    // Maximum wait time for server startup
    timeout: 120_000,
  },
});

import { test, expect } from "@playwright/test";

test.describe("Headstart base example", () => {
  test("Loads search box on landing page", async ({ page }) => {
    await page.goto("/");

    const searchForm = page.locator("#searchform");
    await expect(searchForm).toBeVisible();
  });
});

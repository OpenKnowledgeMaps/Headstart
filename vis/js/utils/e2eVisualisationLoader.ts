import { expect, Page } from "@playwright/test";

export const prepareVisualisation = async (page: Page, url: string) => {
  await page.goto(url);

  const contextLine = page.getByTestId("context");
  await expect(contextLine).toBeVisible({ timeout: 60_000 });

  await expect
    .poll(
      async () =>
        ((await contextLine.textContent()) ?? "").replace(/\s+/g, " ").trim(),
      { timeout: 60_000, intervals: [500, 1000, 2000, 5000] },
    )
    .not.toBe("");
};

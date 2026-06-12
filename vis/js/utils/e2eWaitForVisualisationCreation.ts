import { expect, Page } from "@playwright/test";

export const waitForVisualisationCreation = async (page: Page) => {
  const contextLine = page.getByTestId("context");
  await expect(contextLine).toBeVisible();

  await expect
    .poll(
      async () =>
        ((await contextLine.textContent()) ?? "").replace(/\s+/g, " ").trim(),
      { timeout: 5 * 60 * 1000, intervals: [500, 1000, 2000, 5000] },
    )
    .not.toBe("");
};

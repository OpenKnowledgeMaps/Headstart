import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Basic tests for PubMed integration (Knowledge Map visualisation type)", () => {
  test("Loads default Knowledge Map visualisation", async ({ page }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&q=infection&service=pubmed&sorting=most-relevant";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "infection",
    );
    await expect(page.locator("#source")).toContainText("Data source: PubMed");
    await page.getByTestId("context").getByText("More information").click();
    await expect(page.locator("#info-body")).toContainText(
      "This knowledge map presents you with a topical overview of research on infection based on the 100 most relevant resources matching your search query.",
    );
  });
});

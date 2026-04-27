import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Basic tests for ORCID integration (Knowledge Map visualisation type)", () => {
  test("Loads default Knowledge Map visualisation (using direct URL)", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0001-6011-4382&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Sebastian  Dennerlein (0000-0001-6011-4382)",
    );
    await page.goto(
      "http://localhost:8085/map/4355a899a6d71b9c6863cf34577bf17e?embed=true",
    );
    await page.getByText("About the map").click();
    await expect(page.locator("#info-body")).toContainText(
      "This knowledge map presents you with a topical overview of the most recent works of Sebastian Dennerlein (0000-0001-6011-4382).",
    );
  });
});

import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Basic tests for AQUANAVI integration (Geomap visualisation type)", () => {
  test.describe("Using direct dynamic URL / PSVS link", () => {
    test("Loads default Geomap visualisation", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=mesocosms&service=aquanavi&custom_title=aquatic+mesocosm+facilities&min_descsize=0";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await expect(page.locator("#search-term-unique")).toContainText(
        "aquatic mesocosm facilities",
      );
      await expect(page.locator("#source")).toContainText(
        "Data source: AQUANAVI",
      );
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of aquatic mesocosm facilities.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "This visualization has a custom title and was created using the following query: mesocosms",
      );
    });
  });
});

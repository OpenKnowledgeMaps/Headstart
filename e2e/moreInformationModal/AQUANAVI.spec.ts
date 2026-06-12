import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("More information modal window in AQUANAVI", () => {
  test.describe("Interactivity tests", () => {
    test("Opening and closing correctly", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=&service=aquanavi&min_descsize=0&q_advanced=query+advanced";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info_modal")).toBeVisible();
      await page.getByRole("button", { name: "Close Close" }).click();
      await expect(page.locator("#info_modal")).toBeHidden();

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info_modal")).toBeVisible();

      await page.locator("#info_modal").click({ position: { x: 0, y: 0 } });
      await expect(page.locator("#info_modal")).toBeHidden();
    });
  });

  test.describe("Different combinations of query, query advanced and custom title", () => {
    test("Query, no query advanced, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=mesocosms&service=aquanavi&min_descsize=0";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of mesocosms.",
      );
    });

    test("Query, query advanced, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=mesocosms&service=aquanavi&min_descsize=0&q_advanced=query+advanced";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of mesocosms and query advanced.",
      );
    });

    test("Query, query advanced, custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=mesocosms&service=aquanavi&min_descsize=0&q_advanced=query+advanced&custom_title=aquatic+mesocosm+facilities";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of aquatic mesocosm facilities.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "This visualization has a custom title and was created using the following query: mesocosms and query advanced",
      );
    });

    test("No query, no query advanced, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=&service=aquanavi&min_descsize=0";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of .",
      );
    });

    test("No query, no query advanced, custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=&service=aquanavi&custom_title=aquatic+mesocosm+facilities&min_descsize=0";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of aquatic mesocosm facilities.",
      );
    });

    test("No query, query advanced, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=geomap&q=&service=aquanavi&min_descsize=0&q_advanced=query+advanced";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This geo map presents you with an overview of query advanced.",
      );
    });
  });
});

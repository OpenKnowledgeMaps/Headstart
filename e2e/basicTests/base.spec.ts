import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import { waitForVisualisationCreation } from "../../vis/js/utils/e2eWaitForVisualisationCreation";

test.describe("Basic tests for BASE integration (Knowledge Map and Streamgraph visualisation types)", () => {
  test.describe("Using direct dynamic URL / PSVS link", () => {
    test("Loads default Knowledge Map visualisation", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await expect(page.locator("#search-term-unique")).toContainText(
        "digital education",
      );
      await expect(page.locator("#source")).toContainText("Data source: BASE");
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on digital education based on the 100 most relevant resources matching your search query.",
      );
    });

    test("Loads default Streamgraph visualisation", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=timeline&q=climate%20change&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await expect(page.locator("#search-term-unique")).toContainText(
        "climate change",
      );
      await expect(page.locator("#source")).toContainText("Data source: BASE");
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This streamgraph presents you with an overview of the main keywords related to climate change over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.Please read our FAQs to find out more about streamgraphs.Data sourceThe data is taken from BASE. BASE provides access to over 400 million resources from more than 10,000 content sources in all disciplines. For more information please visit the BASE website.Open source softwareThe visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.If you want to support us financially, you can:Make a donationBecome an organisational memberBecome a funder of our roadmapSign-up for our newsletter to receive occasional updates.",
      );
    });
  });

  test.describe("Using search embedded search box", () => {
    const SEARCH_BOX_URL = "/embedded_searchbox";

    test("Loads default Knowledge Map visualisation", async ({ page }) => {
      await page.goto(SEARCH_BOX_URL);
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .click();
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .fill("digital education");
      await page.getByRole("button", { name: "Create Overview" }).click();
      await waitForVisualisationCreation(page);

      await expect(page.locator("#search-term-unique")).toContainText(
        "digital education",
      );
      await expect(page.locator("#source")).toContainText("Data source: BASE");
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on digital education based on the 100 most relevant resources matching your search query.",
      );
    });

    test("Loads default Streamgraph visualisation", async ({ page }) => {
      await page.goto(SEARCH_BOX_URL + "?service=base&show_vis_type=true");

      await page.getByText("Show advanced search options").click();
      await page
        .getByRole("radio", { name: 'Option "Streamgraph" for "' })
        .check();
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .click();
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .fill("climate change");
      await page.getByRole("button", { name: "Create Overview" }).click();
      await waitForVisualisationCreation(page);
      await expect(page.locator("#search-term-unique")).toContainText(
        "climate change",
      );
      await expect(page.locator("#source")).toContainText("Data source: BASE");
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This streamgraph presents you with an overview of the main keywords related to climate change over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.Please read our FAQs to find out more about streamgraphs.Data sourceThe data is taken from BASE. BASE provides access to over 400 million resources from more than 10,000 content sources in all disciplines. For more information please visit the BASE website.Open source softwareThe visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.If you want to support us financially, you can:Make a donationBecome an organisational memberBecome a funder of our roadmapSign-up for our newsletter to receive occasional updates.",
      );
    });
  });
});

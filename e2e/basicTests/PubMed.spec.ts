import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import { waitForVisualisationCreation } from "../../vis/js/utils/e2eWaitForVisualisationCreation";

test.describe("Basic tests for PubMed integration (Knowledge Map visualisation type)", () => {
  test.describe("Using direct dynamic URL / PSVS link", () => {
    test("Loads default Knowledge Map visualisation", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=infection&service=pubmed&sorting=most-relevant";

      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await expect(page.locator("#search-term-unique")).toContainText(
        "infection",
      );
      await expect(page.locator("#source")).toContainText(
        "Data source: PubMed",
      );
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on infection based on the 100 most relevant resources matching your search query.",
      );
    });
  });

  test.describe("Using search embedded search box", () => {
    test("Loads default Knowledge Map visualisation", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL = "/embedded_searchbox?service=pubmed";

      await page.goto(VISUALISATION_DYNAMIC_URL);
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .click();
      await page
        .getByRole("textbox", { name: "Enter search query (e.g." })
        .fill("infection");
      await page.getByRole("button", { name: "Create Overview" }).click();
      await waitForVisualisationCreation(page);

      await expect(page.locator("#search-term-unique")).toContainText(
        "infection",
      );
      await expect(page.locator("#source")).toContainText(
        "Data source: PubMed",
      );
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on infection based on the 100 most relevant resources matching your search query.",
      );
    });
  });

  test.describe("Using old search box", () => {
    const MAIN_PAGE = "";

    test("Loads default Knowledge Map visualisation using the 'covid-19' try out link", async ({
      page,
    }) => {
      await page.goto(MAIN_PAGE);

      await page.getByRole("radio", { name: "PubMed (life sciences)" }).check();

      const visualisationPagePromise = page.waitForEvent("popup");
      await page.getByRole("link", { name: "covid-" }).click();
      const visualisationPage = await visualisationPagePromise;

      await waitForVisualisationCreation(visualisationPage);

      await expect(
        visualisationPage.locator("#search-term-unique"),
      ).toContainText("covid-19");
      await expect(visualisationPage.locator("#source")).toContainText(
        "Data source: PubMed",
      );
      await visualisationPage
        .getByTestId("context")
        .getByText("More information")
        .click();
      await expect(visualisationPage.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on covid-19 based on the 100 most relevant resources matching your search query.We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.Please read our FAQs to find out more about knowledge maps.Data sourceThe data is taken from PubMed. PubMed comprises more than 38 million citations for biomedical literature from MEDLINE, life science journals, and online books. For more information please visit the PubMed website.Citations are available for resources with a DOI and based on citation data provided by Crossref. Results may be impacted by accuracy and completeness of this data.Open source softwareThe visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.If you want to support us financially, you can:Make a donationBecome an organisational memberBecome a funder of our roadmapSign-up for our newsletter to receive occasional updates.",
      );
    });

    test('Loads default Knowledge Map visualisation using the "climate change" try out link', async ({
      page,
    }) => {
      await page.goto(MAIN_PAGE);

      await page.getByRole("radio", { name: "PubMed (life sciences)" }).check();

      const visualisationPagePromise = page.waitForEvent("popup");
      await page.getByRole("link", { name: '"climate change"' }).click();
      const visualisationPage = await visualisationPagePromise;

      await waitForVisualisationCreation(visualisationPage);

      await expect(
        visualisationPage.locator("#search-term-unique"),
      ).toContainText('"climate change"');
      await expect(visualisationPage.locator("#source")).toContainText(
        "Data source: PubMed",
      );
      await visualisationPage
        .getByTestId("context")
        .getByText("More information")
        .click();
      await expect(visualisationPage.locator("#info-body")).toContainText(
        'This knowledge map presents you with a topical overview of research on "climate change" based on the 100 most relevant resources matching your search query.',
      );
    });
  });
});

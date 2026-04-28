import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("More information modal window in PubMed", () => {
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
    test("Query, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=infection&service=pubmed&sorting=most-relevant";
      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on infection based on the 100 most relevant resources matching your search query.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Please read our FAQs to find out more about knowledge maps.",
      );
      await expect(page.locator("#info-body")).toContainText("Data source");
      await expect(page.locator("#info-body")).toContainText(
        "The data is taken from PubMed. PubMed comprises more than 38 million citations for biomedical literature from MEDLINE, life science journals, and online books. For more information please visit the PubMed website.Citations are available for resources with a DOI and based on citation data provided by Crossref. Results may be impacted by accuracy and completeness of this data.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Open source software",
      );
      await expect(page.locator("#info-body")).toContainText(
        "The visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "If you want to support us financially, you can:",
      );
      await expect(page.getByRole("list")).toContainText("Make a donation");
      await expect(page.getByRole("list")).toContainText(
        "Become an organisational member",
      );
      await expect(page.getByRole("list")).toContainText(
        "Become a funder of our roadmap",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Sign-up for our newsletter to receive occasional updates.",
      );
      await expect(
        page.getByRole("link", { name: "OKMaps logo" }),
      ).toBeVisible();
    });

    test("No query, no custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=&service=pubmed&sorting=most-relevant";
      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research based on 100 resources.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Please read our FAQs to find out more about knowledge maps.",
      );
      await expect(page.locator("#info-body")).toContainText("Data source");
      await expect(page.locator("#info-body")).toContainText(
        "The data is taken from PubMed. PubMed comprises more than 38 million citations for biomedical literature from MEDLINE, life science journals, and online books. For more information please visit the PubMed website.Citations are available for resources with a DOI and based on citation data provided by Crossref. Results may be impacted by accuracy and completeness of this data.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Open source software",
      );
      await expect(page.locator("#info-body")).toContainText(
        "The visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "If you want to support us financially, you can:",
      );
      await expect(page.getByRole("list")).toContainText("Make a donation");
      await expect(page.getByRole("list")).toContainText(
        "Become an organisational member",
      );
      await expect(page.getByRole("list")).toContainText(
        "Become a funder of our roadmap",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Sign-up for our newsletter to receive occasional updates.",
      );
    });

    test("No query, custom title", async ({ page }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=&service=pubmed&sorting=most-relevant";
      await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);
      await page.goto(
        "/map/f3bfddcad6bbdaef4647517827e6a6cb&custom_title=custom+title+via+URL",
      );

      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on custom title via URL based on the 100 most relevant resources matching your search query.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Please read our FAQs to find out more about knowledge maps.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "The data is taken from PubMed. PubMed comprises more than 38 million citations for biomedical literature from MEDLINE, life science journals, and online books. For more information please visit the PubMed website.Citations are available for resources with a DOI and based on citation data provided by Crossref. Results may be impacted by accuracy and completeness of this data.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "The visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "If you want to support us financially, you can:",
      );
      await expect(page.getByRole("list")).toContainText("Make a donation");
      await expect(page.getByRole("list")).toContainText(
        "Become an organisational member",
      );
      await expect(page.getByRole("list")).toContainText(
        "Become a funder of our roadmap",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Sign-up for our newsletter to receive occasional updates.",
      );
      await expect(page.locator("#info-title")).toContainText("What's this?");
      await expect(page.locator("#info-body")).toContainText("Data source");
      await expect(page.locator("#info-body")).toContainText(
        "Open source software",
      );
    });

    test("Query, custom title", async ({ page }) => {
      await page.goto(
        "http://localhost:8085/map/6d9987f5edd8165da49a51774bc4f7a1&custom_title=custom+title+via+URL",
      );
      await page.getByTestId("context").getByText("More information").click();
      await expect(page.locator("#info-body")).toContainText(
        "This knowledge map presents you with a topical overview of research on custom title via URL based on the 100 most relevant resources matching your search query.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "This visualization has a custom title and was created using the following query: infection",
      );
      await expect(page.locator("#info-body")).toContainText(
        "We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Please read our FAQs to find out more about knowledge maps.",
      );
      await expect(page.locator("#info-title")).toContainText("What's this?");
      await expect(page.locator("#info-body")).toContainText("Data source");
      await expect(page.locator("#info-body")).toContainText(
        "The data is taken from PubMed. PubMed comprises more than 38 million citations for biomedical literature from MEDLINE, life science journals, and online books. For more information please visit the PubMed website.Citations are available for resources with a DOI and based on citation data provided by Crossref. Results may be impacted by accuracy and completeness of this data.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Open source software",
      );
      await expect(page.locator("#info-body")).toContainText(
        "The visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.",
      );
      await expect(page.locator("#info-body")).toContainText(
        "If you want to support us financially, you can:",
      );
      await expect(page.getByRole("list")).toContainText("Make a donation");
      await expect(page.getByRole("list")).toContainText(
        "Become an organisational member",
      );
      await expect(page.getByRole("list")).toContainText(
        "Become a funder of our roadmap",
      );
      await expect(page.locator("#info-body")).toContainText(
        "Sign-up for our newsletter to receive occasional updates.",
      );
    });
  });
});

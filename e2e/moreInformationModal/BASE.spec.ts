import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("More information modal window in BASE", () => {
  test.describe("Interactivity tests", () => {
    test("Opening and closing correctly (Knowledge Map visualisation type)", async ({
      page,
    }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

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

    test("Opening and closing correctly (Streamgraph visualisation type)", async ({
      page,
    }) => {
      const VISUALISATION_DYNAMIC_URL =
        "/search?type=get&vis_type=timeline&q=climate%20change&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

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
    test.describe("Knowledge Map visualisation", () => {
      test("Query, no query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);
        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This knowledge map presents you with a topical overview of research on digital education based on the 100 most relevant resources matching your search query.",
        );
      });

      test("Query, query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true&q_advanced=query+advanced";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This knowledge map presents you with a topical overview of research on digital education and query advanced based on the 100 most relevant resources matching your search query.",
        );
      });

      test("Query, query advanced, custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true&q_advanced=query+advanced&custom_title=custom+title";
        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);
        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This knowledge map presents you with a topical overview of research on custom title based on the 100 most relevant resources matching your search query.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "This visualization has a custom title and was created using the following query: digital education and query advanced",
        );
      });

      test("No query, no query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true";
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
      });

      test("No query, no query advanced, custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true&custom_title=custom+title";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This knowledge map presents you with a topical overview of research on custom title based on the 100 most relevant resources matching your search query.",
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
      });

      test("No query, query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=overview&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&from=1665-01-01&min_descsize=0&exclude_date_filters=true&q_advanced=query+advanced";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This knowledge map presents you with a topical overview of research on query advanced based on the 100 most relevant resources matching your search query.",
        );
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
      });
    });

    test.describe("Streamgraph visualisation", () => {
      test("Query, no query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=climate%20change&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true";
        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This streamgraph presents you with an overview of the main keywords related to climate change over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Please read our FAQs to find out more about streamgraphs.",
        );
      });

      test("Query, query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=climate%20change&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true&q_advanced=dcrelation:%22https://zenodo.org/communities/biosyslit%22";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          'This streamgraph presents you with an overview of the main keywords related to climate change and dcrelation:"https://zenodo.org/communities/biosyslit" over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.',
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
      });

      test("Query, query advanced, custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=climate%20change&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true&q_advanced=query+advanced&custom_title=custom+title";

        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This streamgraph presents you with an overview of the main keywords related to custom title over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "This visualization has a custom title and was created using the following query: climate change",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Please read our FAQs to find out more about streamgraphs.",
        );
      });

      test("No query, no query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true";
        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This streamgraph presents you with an overview of the main keywords over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Please read our FAQs to find out more about streamgraphs.",
        );
      });

      test("No query, no query advanced, custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true&custom_title=custom+title";
        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          "This streamgraph presents you with an overview of the main keywords related to custom title over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Please read our FAQs to find out more about streamgraphs.",
        );
      });

      test("No query, query advanced, no custom title", async ({ page }) => {
        const VISUALISATION_DYNAMIC_URL =
          "/search?type=get&vis_type=timeline&q=&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&embed=true&q_advanced=dccoverage:%22Rocky%20Mountains%22";
        await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

        await page.getByTestId("context").getByText("More information").click();
        await expect(page.locator("#info-body")).toContainText(
          'This streamgraph presents you with an overview of the main keywords related to dccoverage:"Rocky Mountains" over time. It is based on the most relevant resources related to the main keywords. Up to 1000 resources have been taken into consideration for the computation of the streamgraph.',
        );
        await expect(page.locator("#info-body")).toContainText(
          "The height of a stream represents the number of resources with this keyword at a specific time. It is important to note that the number of resources matches the relative height, not the absolute height of the stream.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Streamgraphs are particularly useful for investigating the evolution of keywords over time and to analyse trends in research.",
        );
        await expect(page.locator("#info-body")).toContainText(
          "Please read our FAQs to find out more about streamgraphs.",
        );
      });
    });
  });
});

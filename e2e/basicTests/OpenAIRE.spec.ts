import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Basic tests for OpenAIRE integration (Knowledge Map visualisation type)", () => {
  test("Loads default Knowledge Map visualisation", async ({ page }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=&q=&service=openaire&project_id=710722&funder=EC";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator(".truncated-project-title")).toContainText(
      "OpenUP - OPENing UP new methods, indicators",
    );
    await expect(page.locator("#source")).toContainText(
      "Data source: OpenAIRE",
    );
    await page.getByTestId("context").getByText("More information").click();
    await expect(page.locator("#info-body")).toContainText(
      "This knowledge map presents you with a topical overview of research conducted in the following project:Project DetailsTitleOPENing UP new methods, indicators and tools for peer review, impact measurement and dissemination of research resultsAcronymOpenUPFunderECFunding programCSAH2020CallH2020-GARRI-2015-1Contract (GA) number710722Start Date2016-06-01End Date2018-11-30Open Access mandatetrueOrganizationsUGOE, UvA, PUBLIC POLICY AND MANAGEMENT INSTITUTE, FRONTIERS MEDIA  SA, UoA, DZHW, AIT, Know Center, CNROpenAire LinkLinkWe use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.Knowledge maps provide an instant overview of a topic by showing the main areas at a glance, and resources related to them. This makes it possible to easily identify useful, pertinent information.Please read our FAQs to find out more about knowledge maps.Data sourceThe data is taken from OpenAIRE. OpenAIRE is a key infrastructure that enables the European transition to open science. It provides access to 3 million research projects and more than 70 million research outputs from more than 100,000 data sources.Open source softwareThe visualization is created with the award winning open source software Head Start provided by Open Knowledge Maps. Open Knowledge Maps is a non-profit organisation run by a group of dedicated team members and volunteers. In order to improve our free and open service, we need your support. Please send us your feedback to info@openknowledgemaps.org.If you want to support us financially, you can:Make a donationBecome an organisational memberBecome a funder of our roadmapSign-up for our newsletter to receive occasional updates.",
    );
  });
});

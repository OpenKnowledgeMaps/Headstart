import { test, expect } from "@playwright/test";

test.describe("The interface checks the names of the visualisation entries around the app", () => {
  test("Context line component contains correct entries naming", async ({
    page,
  }) => {
    await page.goto(
      "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    );

    const contextLine = page.getByTestId("context");
    await expect(contextLine).toBeVisible({ timeout: 60_000 });

    await expect
      .poll(
        async () =>
          ((await contextLine.textContent()) ?? "").replace(/\s+/g, " ").trim(),
        { timeout: 60_000, intervals: [500, 1000, 2000, 5000] },
      )
      .not.toBe("");

    const mostRelevantResourcesLink = contextLine.getByText("most relevant");
    const resourceTypesLink = contextLine.getByText("Resource types");
    const dataQualityLink = contextLine.getByText("Data quality");
    const moreInfoLink = contextLine.getByText("More information");

    await mostRelevantResourcesLink.hover();
    await expect(
      page.getByText(
        "To determine the most relevant resources, we use the relevance ranking provided by the data source e.g. BASE. Data sources mainly use text similarity between your query and the article metadata to determine the relevance ranking. Please consult the FAQs for more information.",
      ),
    ).toBeVisible();

    await expect(resourceTypesLink).toBeVisible();

    await expect(dataQualityLink).toBeVisible();
    await contextLine.getByText("Data quality").hover();
    await expect(
      page.getByText(
        "This visualization only includes resources with an abstract (min. 300 characters). High metadata quality significantly improves the quality of your visualization.",
      ),
    ).toBeVisible();

    await expect(moreInfoLink).toBeVisible();
    await moreInfoLink.click();

    await expect(page.locator("#info-body")).toContainText(
      "This knowledge map presents you with a topical overview of research on digital education based on the 100 most relevant resources matching your search query.",
    );
    await expect(page.locator("#info-body")).toContainText(
      "We use text similarity to create a knowledge map. The algorithm groups those resources together that have many words in common. Area titles are created from subject keywords of resources that have been assigned to the same area. We select those keywords and phrases that appear frequently in one area, and seldom in other areas.",
    );
    await expect(page.locator("#info-body")).toContainText(
      "The data is taken from BASE. BASE provides access to over 400 million resources from more than 10,000 content sources in all disciplines. For more information please visit the BASE website.",
    );
    await page.getByRole("button", { name: "Close Close" }).click();
  });

  test("List component contains correct entries naming", async ({ page }) => {
    await page.goto(
      "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    );

    const contextLine = page.getByTestId("context");
    await expect(contextLine).toBeVisible({ timeout: 60_000 });

    await expect
      .poll(
        async () =>
          ((await contextLine.textContent()) ?? "").replace(/\s+/g, " ").trim(),
        { timeout: 60_000, intervals: [500, 1000, 2000, 5000] },
      )
      .not.toBe("");

    await expect(page.getByText("Overview (100 resources)")).toBeVisible();

    await page.getByRole("button", { name: "Cite as" }).first().click();
    await expect(page.locator("#cite-paper-title")).toContainText(
      "Cite this resource as",
    );
    await page.getByRole("button", { name: "Close Close" }).click();

    await page.getByRole("button", { name: "Export" }).first().click();
    await expect(page.locator("#export-paper-title")).toContainText(
      "Export this resource",
    );
    await page.getByRole("button", { name: "Close Close" }).click();
  });

  test("BASE integration after cold start", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Refine your search")).toBeVisible();
    await page.getByText("Refine your search ").click();

    await expect(page.locator("#filters")).toContainText("1 Resource types");
  });

  test("PubMed integration after cold start", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("radio", { name: "PubMed (life sciences)" }).check();

    await page.getByText("Refine your search").click();

    await expect(page.locator("#filters")).toContainText("91 Resource types");
  });

  test("Embedded search box for BASE contains select resources type(s) select", async ({
    page,
  }) => {
    await page.goto("/embedded_searchbox?service=base");

    await expect(page.getByText("Show advanced search options")).toBeVisible();
    await page.getByText("Show advanced search options").click();
    await expect(page.getByText("select resources type(s)")).toBeVisible();
  });

  test("Embedded search box for PubMed contains select resources type(s) select", async ({
    page,
  }) => {
    await page.goto("/embedded_searchbox?service=pubmed");

    await expect(page.getByText("Show advanced search options")).toBeVisible();
    await page.getByText("Show advanced search options").click();
    await expect(page.getByText("select resources type(s)")).toBeVisible();
  });

  test("Embedded search box for BASE and PubMed contains select resources type(s) select", async ({
    page,
  }) => {
    await page.goto("/embedded_searchbox?service=pubmed");

    await expect(page.getByText("Show advanced search options")).toBeVisible();
    await page.getByText("Show advanced search options").click();
    await expect(page.getByText("select resources type(s)")).toBeVisible();
  });
});

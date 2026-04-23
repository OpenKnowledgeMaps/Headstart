import { test, expect } from "@playwright/test";

test.describe("Toolbar component interactions", () => {
  const VISUALISATION_SEARCH_URL =
    "/search?type=get&vis_type=overview&q=digital%20education&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

  const prepareVisualisation = async (page) => {
    await page.goto(VISUALISATION_SEARCH_URL);

    const contextLine = page.getByTestId("context");
    await expect(contextLine).toBeVisible({ timeout: 60_000 });

    await expect
      .poll(
        async () =>
          ((await contextLine.textContent()) ?? "").replace(/\s+/g, " ").trim(),
        { timeout: 60_000, intervals: [500, 1000, 2000, 5000] },
      )
      .not.toBe("");
  };

  test("Share with email", async ({ page }) => {
    await prepareVisualisation(page);

    const EMAIL_BUTTON_TITLE = "Share this visualization via email";
    const emailButton = page.getByTitle(EMAIL_BUTTON_TITLE);

    await expect(emailButton).toBeVisible();
  });

  test("Embed visualisation", async ({ page }) => {
    await prepareVisualisation(page);

    const EMBED_BUTTON_TITLE = "Embed this visualization on other websites";
    const embedButton = page.getByTitle(EMBED_BUTTON_TITLE);
    await expect(embedButton).toBeVisible();

    const MODAL_TITLE = "embed visualization";
    const MODAL_DESCRIPTION =
      "You can use this code to embed the visualization on your own website or in a dashboard.";
    const IFRAME_CONTENT_START_WITH = '<iframe width="1260" height="';

    await embedButton.click();

    const modalTitleElement = page.locator("#embed-title");
    const modalDescriptionElement = page.locator("#embed-body-text");
    const iframeElement = page.getByText(IFRAME_CONTENT_START_WITH);
    const copyButtonElement = page.getByRole("button", { name: "Copy" });
    const closeButtonElement = page.getByRole("button", {
      name: "Close Close",
    });

    await expect(modalTitleElement).toContainText(MODAL_TITLE);
    await expect(modalDescriptionElement).toContainText(MODAL_DESCRIPTION);
    await expect(iframeElement).toBeVisible();
    await expect(copyButtonElement).toBeVisible();
    await expect(closeButtonElement).toBeVisible();
    await closeButtonElement.click();
  });

  test("Cite visualisation", async ({ page }) => {
    await prepareVisualisation(page);

    const CITE_BUTTON_TITLE = "Cite this visualization";
    const citeButton = page.getByTitle(CITE_BUTTON_TITLE);
    await expect(citeButton).toBeVisible();

    const MODAL_TITLE = "Cite this visualization";
    const MODAL_DESCRIPTION = "Please cite this knowledge map as follows:";
    const COPY_CONTENT_STARTS_WITH =
      "Open Knowledge Maps (2026). Knowledge Map for research on";

    await citeButton.click();

    const modalTitleElement = page.locator("#cite-title");
    const modalDescriptionElement = page.getByRole("paragraph");
    const textToCopyElement = page.getByText(COPY_CONTENT_STARTS_WITH);
    const copyButtonElement = page.getByRole("button", { name: "Copy" });
    const closeButtonElement = page.getByRole("button", {
      name: "Close Close",
    });

    await expect(modalTitleElement).toContainText(MODAL_TITLE);
    await expect(modalDescriptionElement).toContainText(MODAL_DESCRIPTION);
    await expect(textToCopyElement).toBeVisible();
    await expect(copyButtonElement).toBeVisible();
    await expect(closeButtonElement).toBeVisible();
    await closeButtonElement.click();
  });
});

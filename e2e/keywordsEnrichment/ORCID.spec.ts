import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Tests to check how keywords enrichment works", () => {
  test.skip("Keywords enrichment for the 'Asymmetric Power Boosts Extortion in an Economic Experiment' document (replace strategy)", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0001-5116-955X&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Christian Hilbe (0000-0001-5116-955X)",
    );
    await page
      .getByTitle("Asymmetric Power Boosts Extortion in an Economic Experiment")
      .click();
    await expect(page.locator("#list_holder")).toContainText(
      "Keywords: Physical Sciences; Mathematics; Applied Mathematics; Game Theory; Social Sciences; Economics; Experimental Economics; Prisoner's Dilemma; Biology and Life Sciences; Behavior; Psychology; Social Psychology; Experimental Design; Mathematical and Statistical Techniques; Statistical Methods; Generalized Linear Model; Statistics (Mathematics); Recreation; Games",
    );
  });
});

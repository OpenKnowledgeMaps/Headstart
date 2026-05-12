import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

test.describe("Verify abstract and keywords are merged correctly, bugfix 1", () => {
  test("Keywords enrichment for the 'Ten simple rules for innovative dissemination of research' document", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0002-5238-4195&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Peter Kraker (0000-0002-5238-4195)",
    );
    const paper = page.getByTitle(
      "Ten simple rules for innovative dissemination of research",
    );
    await expect(paper).toBeVisible();
    await paper.click();
    await expect(page.locator("#list_holder")).toContainText(
      "Keywords: Biology (General); Humans [MeSH]; Information Dissemination [MeSH]; Innovative dissemination;  Online Social Networking [MeSH]; Open Science; Research Personnel [MeSH]; Scientific publishing; QH301-705.5",
    );
  });
});

test.describe("Verify abstract and keywords are merged correctly, bugfix 1", () => {
  test("Abstract enrichment for the 'Ten simple rules for innovative dissemination of research' document", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0002-5238-4195&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Peter Kraker (0000-0002-5238-4195)",
    );
    const paper = page.getByTitle(
      "Ten simple rules for innovative dissemination of research",
    );
    await expect(paper).toBeVisible();
    await paper.click();
    await expect(page.locator("#list_holder")).toContainText(
      "How we communicate research is changing because of new (especially digital) possibilities. This article sets out 10 easy steps researchers can take to disseminate their work in novel and engaging ways, and hence increase the impact of their research on science and society.",
    );
  });
});


test.describe("Verify abstract and keywords are merged correctly, bugfix 1", () => {
  test("Keywords enrichment for the 'Social immunity modulates competition between coinfecting pathogens' document", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0001-5116-955X&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Christian Hilbe (0000-0001-5116-955X)",
    );
    const paper = page.getByTitle(
      "Social immunity modulates competition between coinfecting pathogens",
    );
    await expect(paper).toBeVisible();
    await paper.click();
    await expect(page.locator("#list_holder")).toContainText(
      "Keywords: Animals [MeSH]; Ants [MeSH]; Argentine ants; ddc:570; grooming; Grooming [MeSH]; immune-mediated competition; infectious disease; host-pathogen interactions; Host-Pathogen Interactions [MeSH]; metarhizium fungus; Metarhizium [MeSH]; multiple infections; pathogen competition; pathogen diversity; Social Behavior [MeSH]; social insects; Virulence [MeSH];",
    );
  });
});

test.describe("Verify abstract and keywords are merged correctly, bugfix 1", () => {
  test("Abstract enrichment for the 'Social immunity modulates competition between coinfecting pathogens' document", async ({
    page,
  }) => {
    const VISUALISATION_DYNAMIC_URL =
      "/search?type=get&vis_type=overview&orcid=0000-0001-5116-955X&service=orcid&embed=true";

    await prepareVisualisation(page, VISUALISATION_DYNAMIC_URL);

    await expect(page.locator("#search-term-unique")).toContainText(
      "Christian Hilbe (0000-0001-5116-955X)",
    );
    const paper = page.getByTitle(
      "Social immunity modulates competition between coinfecting pathogens",
    );
    await expect(paper).toBeVisible();
    await paper.click();
    await expect(page.locator("#list_holder")).toContainText(
      "Abstract Coinfections with multiple pathogens can result in complex within‐host dynamics affecting virulence and transmission. While multiple infections are intensively studied in solitary hosts, it is so far unresolved how social host interactions interfere with pathogen competition, and if this depends on coinfection diversity. We studied how the collective disease defences of ants – their social immunity – influence pathogen competition in coinfections of same or different fungal pathogen species. Social immunity reduced virulence for all pathogen combinations, but interfered with spore production only in different‐species coinfections. Here, it decreased overall pathogen sporulation success while increasing co‐sporulation on individual cadavers and maintaining a higher pathogen diversity at the community level. Mathematical modelling revealed that host sanitary care alone can modulate competitive outcomes between pathogens, giving advantage to fast‐germinating, thus less grooming‐sensitive ones. Host social interactions can hence modulate infection dynamics in coinfected group members, thereby altering pathogen communities at the host level and population level.",
    );
  });
});

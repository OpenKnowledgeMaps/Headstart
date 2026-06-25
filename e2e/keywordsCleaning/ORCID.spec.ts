import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import { assertNoClassificationLeaks, extractDocuments } from "./invariant";

// const uniqueOrcids = [...new Set(testCases.map((tc) => tc.orcid).filter(Boolean))];

const additionalUniqueOrcids = [
  "0000-0001-6011-4382",
  "0000-0003-0204-881X",
  "0000-0001-5116-955X",
  "0000-0003-2897-6075",
  "0000-0002-8911-7832",
  "0000-0002-9843-6798",
  "0000-0003-4221-6275",
  "0000-0002-4505-0517",
  "0000-0002-2233-6926",
  "0000-0002-2441-4043",
  "0000-0001-9287-3770",
  "0000-0001-9612-7791",
  "0000-0002-4971-2944",
  "0000-0001-9062-6039",
  "0000-0002-3924-6636",
  "0000-0001-5849-8137",
  "0000-0003-0297-9614",
];

const allUniqueOrcids = [...new Set([ ...additionalUniqueOrcids])];


// This can also be used to pre-load the unique ORCID profiles, so that the subsequent tests run faster
// npx playwright test "e2e/keywordsCleaning/ORCID.spec.ts" --grep "Warm-up: pre-load unique ORCID profiles"
test.describe("Warm-up: pre-load unique ORCID profiles", () => {
  for (const orcid of allUniqueOrcids) {
    test(`${orcid}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&orcid=${orcid}&service=orcid&embed=true&academic_age_offset=1`;
      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(`(${orcid})`);
    });
  }
});

// Classification-leak invariant: no classification marker or MeSH qualifier may
// survive in the cleaned `subject` or in an area title. See ./invariant.ts for
// the rationale and the marker set.
test.describe("No classification markers leak into subject or area titles", () => {
  for (const orcid of allUniqueOrcids) {
    test(`subject + area titles are clean — ${orcid}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&orcid=${orcid}&service=orcid&embed=true&academic_age_offset=1`;

      // Register before navigation so we capture the data load that populates
      // the visualisation. The backend pipeline can take minutes, so match the
      // global test timeout.
      const responsePromise = page.waitForResponse(
        (r) => r.url().includes("getLatestRevision.php") && r.ok(),
        { timeout: 5 * 60 * 1000 },
      );

      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(`(${orcid})`);

      const json = await (await responsePromise).json();
      // A loaded profile should carry documents; if it is genuinely empty there
      // is nothing to clean, which trivially satisfies the invariant.
      assertNoClassificationLeaks(extractDocuments(json), orcid);
    });
  }
});

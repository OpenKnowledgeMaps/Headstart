import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import { assertNoClassificationLeaks, extractDocuments } from "./invariant";

// Classification-leak invariant for BASE searches (mirrors ORCID.spec.ts). The
// queries are chosen to surface the schemes/forms the cleaner targets:
//   * MeSH descriptors, qualifiers and space-joined blobs (biomedical queries:
//     "pharmacology", "therapeutic use", "chemically induced", ...);
//   * FOS / arXiv / ddc / LCC classifications (discipline queries: "game theory",
//     "machine translation", ...).
// document_types=121 (articles) + min_descsize=300 reproduces the records the
// cleaning was validated against. See ./invariant.ts for the marker set.

interface BaseSearch {
  query: string;
  search_params: string;
}

// most-relevant articles, min description size 300 (the records the cleaning was
// validated against).
//
// NOTE: `type=get` returns the cached revision for a given (query, params, date)
// hash. So after a cleaning change, re-running the same search returns the stale
// pre-change map. To force a fresh recomputation against the current backend,
// vary a date param, e.g. append "&from=1665-02-05" (any unused value). A clean
// CI database computes fresh on first run, so the default below is fine there.
const ARTICLES =
  "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";

const searches: BaseSearch[] = [
  { query: "pharmacology", search_params: ARTICLES },
  { query: "therapeutic use", search_params: ARTICLES },
  { query: "chemically induced", search_params: ARTICLES },
  { query: "antagonists & inhibitors", search_params: ARTICLES },
  { query: "enzyme inhibitors", search_params: ARTICLES },
  { query: '"game theory"', search_params: ARTICLES },
  { query: "machine translation", search_params: ARTICLES },
  { query: "physics", search_params: ARTICLES },
  { query: "medicine", search_params: ARTICLES },
];

// Pre-load the BASE searches so subsequent runs are faster.
// npx playwright test "e2e/keywordsCleaning/BASE.spec.ts" --grep "Warm-up: pre-load BASE searches"
test.describe("Warm-up: pre-load BASE searches", () => {
  for (const { query, search_params } of searches) {
    test(`${query}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&q=${query}${search_params}`;
      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(query.replace(/"/g, ""));
    });
  }
});

test.describe("No classification markers leak into subject or area titles", () => {
  for (const { query, search_params } of searches) {
    test(`subject + area titles are clean — ${query}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&q=${query}${search_params}`;

      // Register before navigation so we capture the data load that populates
      // the visualisation. The backend pipeline can take minutes, so match the
      // global test timeout.
      const responsePromise = page.waitForResponse(
        (r) => r.url().includes("getLatestRevision.php") && r.ok(),
        { timeout: 5 * 60 * 1000 },
      );

      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(query.replace(/"/g, ""));

      const json = await (await responsePromise).json();
      assertNoClassificationLeaks(extractDocuments(json), query);
    });
  }
});

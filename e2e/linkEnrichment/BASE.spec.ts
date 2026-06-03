import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import {
  capturePapersFromLatestRevision,
  papersWithLinkEnrichment,
  candidatesAsString,
} from "./helpers";

/**
 * BASE link-enrichment smoke test.
 *
 * Query/params chosen from dev-base-1 logs: a `"game theory"` BASE search
 * with the same param set used in the existing keyword-enrichment BASE spec
 * produced 27 `[ENRICHMENT_APPLIED] link` events in a recent test run. The
 * URL shape mirrors keywordsEnrichment/BASE.spec.ts so any future param
 * drift surfaces in both tests at once.
 *
 * Two assertions are made:
 *   1. Volume — at least MIN_ENRICHED_PAPERS papers have non-empty
 *      pdf_link_candidates_from_duplicates. This catches a wholesale
 *      regression (enrichment silently turning off).
 *   2. Containment on a specific paper — the survey on Game Theory & WSN
 *      security gains a PubMed URL via duplicate grouping. Containment
 *      (rather than equality) means the test stays green if the duplicate
 *      group picks up additional sibling URLs over time.
 */
const QUERY = '"game theory"';
const SEARCH_PARAMS =
  "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300";
const URL = `/search?type=get&vis_type=overview&q=${encodeURIComponent(QUERY)}${SEARCH_PARAMS}&embed=true`;

const MIN_ENRICHED_PAPERS = 1;

const PINNED_PAPER_TITLE =
  "Game Theory Meets Wireless Sensor Networks Security Requirements and Threats Mitigation: A Survey";
// PubMed identifiers are stable for the life of the record, so this URL
// fragment is a sturdy assertion target.
const PINNED_EXPECTED_CANDIDATE_SUBSTRING =
  "pubmed.ncbi.nlm.nih.gov/27367700";

test.describe("BASE link enrichment smoke", () => {
  test(`at least ${MIN_ENRICHED_PAPERS} paper has pdf_link_candidates_from_duplicates for query '${QUERY}'`, async ({
    page,
  }) => {
    const papers = await capturePapersFromLatestRevision(page, async () => {
      await prepareVisualisation(page, URL);
      await expect(page.locator("#search-term-unique")).toContainText(
        "game theory",
      );
    });

    const enriched = papersWithLinkEnrichment(papers);

    if (enriched.length > 0) {
      const sample = enriched.slice(0, 3).map((p) => ({
        title: p.title?.slice(0, 80),
        doi: p.doi,
        candidates: p.pdf_link_candidates_from_duplicates,
      }));
      // eslint-disable-next-line no-console
      console.log("[linkEnrichment/BASE] sample enriched papers:", sample);
    }

    expect(enriched.length).toBeGreaterThanOrEqual(MIN_ENRICHED_PAPERS);
  });

  test(`pinned paper '${PINNED_PAPER_TITLE}' has candidate containing '${PINNED_EXPECTED_CANDIDATE_SUBSTRING}'`, async ({
    page,
  }) => {
    const papers = await capturePapersFromLatestRevision(page, async () => {
      await prepareVisualisation(page, URL);
      await expect(page.locator("#search-term-unique")).toContainText(
        "game theory",
      );
    });

    const pinned = papers.find((p) => p?.title === PINNED_PAPER_TITLE);
    expect(pinned, `paper '${PINNED_PAPER_TITLE}' not found in results`)
      .toBeDefined();

    const candidates = candidatesAsString(pinned);
    expect(candidates).toContain(PINNED_EXPECTED_CANDIDATE_SUBSTRING);
  });
});

import { test, expect } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";
import {
  capturePapersFromLatestRevision,
  papersWithLinkEnrichment,
  candidatesAsString,
} from "./helpers";

/**
 * ORCID link-enrichment smoke test.
 *
 * 0000-0001-5116-955X is a heavy contributor in the dev-base-1 enrichment
 * logs — a recent run produced dozens of `[ENRICHMENT_APPLIED] link` events
 * for this profile. Two assertions are made:
 *
 *   1. Volume — at least MIN_ENRICHED_PAPERS papers have non-empty
 *      pdf_link_candidates_from_duplicates. Catches a wholesale regression.
 *   2. Containment on a specific paper — "Local Replicator Dynamics..."
 *      gains a PubMed URL via duplicate grouping. Containment (rather than
 *      equality) keeps the test green if the dedup graph picks up more
 *      sibling URLs later. The same paper is also tracked in
 *      oaStatusEnrichment/ORCID.spec.ts as a non-OA negative case, so the
 *      two specs share fate if BASE stops returning this record at all.
 */
const ORCID = "0000-0001-5116-955X";
const URL = `/search?type=get&vis_type=overview&orcid=${ORCID}&service=orcid&embed=true`;

const MIN_ENRICHED_PAPERS = 1;

const PINNED_PAPER_TITLE =
  "Local Replicator Dynamics: A Simple Link Between Deterministic and Stochastic Models of Evolutionary Game Theory";
const PINNED_EXPECTED_CANDIDATE_SUBSTRING =
  "pubmed.ncbi.nlm.nih.gov/21181502";

test.describe("ORCID link enrichment smoke", () => {
  test(`at least ${MIN_ENRICHED_PAPERS} paper has pdf_link_candidates_from_duplicates for ORCID ${ORCID}`, async ({
    page,
  }) => {
    const papers = await capturePapersFromLatestRevision(page, async () => {
      await prepareVisualisation(page, URL);
      await expect(page.locator("#search-term-unique")).toContainText(
        `(${ORCID})`,
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
      console.log("[linkEnrichment/ORCID] sample enriched papers:", sample);
    }

    expect(enriched.length).toBeGreaterThanOrEqual(MIN_ENRICHED_PAPERS);
  });

  test(`pinned paper '${PINNED_PAPER_TITLE}' has candidate containing '${PINNED_EXPECTED_CANDIDATE_SUBSTRING}'`, async ({
    page,
  }) => {
    const papers = await capturePapersFromLatestRevision(page, async () => {
      await prepareVisualisation(page, URL);
      await expect(page.locator("#search-term-unique")).toContainText(
        `(${ORCID})`,
      );
    });

    const pinned = papers.find((p) => p?.title === PINNED_PAPER_TITLE);
    expect(pinned, `paper '${PINNED_PAPER_TITLE}' not found in results`)
      .toBeDefined();

    const candidates = candidatesAsString(pinned);
    expect(candidates).toContain(PINNED_EXPECTED_CANDIDATE_SUBSTRING);
  });
});

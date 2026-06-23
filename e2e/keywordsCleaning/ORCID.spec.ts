import { test, expect, Page } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

interface EnrichmentTestCase {
  suiteName: string;
  orcid: string;
  paperTitle: string;
  keywords?: string;
  abstract?: string;
  flaky?: boolean;
}

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

// --- Classification-leak invariant ------------------------------------------
//
// The cleaning step removes classification-scheme keywords from the display
// `subject` field, and that cleaned field also feeds the cluster/area titles
// (summarize.R derives labels from metadata$subject). This is an *invariant*
// test, not an exact-output one: the live BASE API returns different records
// run-to-run, so we cannot pin the cleaned string. Instead we assert that no
// recognised classification marker survives anywhere in `subject` or in an
// area title, whatever BASE happens to return.
//
// Exact input -> output is covered deterministically by the R unit tests
// (other-scripts/test/test_subject_cleaning.R). Vocabulary-list schemes that
// carry no inline marker (e.g. the Toulouse letter-domain list) cannot be
// detected by pattern without false positives, so they are out of scope here
// and remain covered by the unit tests only.

// Mirrors the marker-bearing schemes in kwlib.SCHEMES (the analysis oracle).
// Keep in sync when a new marker-based scheme is added to the cleaner.
const CLASSIFICATION_MARKERS: { name: string; re: RegExp }[] = [
  { name: "mesh [MeSH]", re: /\[MeSH\]/i },
  { name: "mesh (mesh)", re: /\(mesh\)/i },
  { name: "mesh-chemical", re: /\[Chemical\]/i },
  { name: "rcdc", re: /\(rcdc\)/i },
  { name: "for / for-2020", re: /\(for(-2020)?\)/i },
  { name: "science-metrix", re: /\(science-metrix\)/i },
  { name: "sdg", re: /\(sdg\)/i },
  { name: "hrcs", re: /\(hrcs-[a-z]+\)/i },
  { name: "acm-ccs arrow", re: /→/ },
  { name: "keyvalue name=", re: /^name=/i },
  {
    name: "hal-shs domain code",
    re: /^\[(CHIM|INFO|MATH|NLIN|PHYS|SCCO|SDE|SDU|SDV|SHS|SPI|STAT|QFIN)(\.[A-Z-]+)*\]/,
  },
  { name: "url", re: /^https?:\/\// },
  { name: "not elsewhere classified", re: /not elsewhere classified/i },
  { name: "numeric path", re: /^\/[0-9/]+$/ },
];

interface BackendDocument {
  subject?: string;
  area?: string;
}

// getLatestRevision.php returns { context, data }, where data (a string that
// needs parsing) carries documents[] (itself sometimes a nested JSON string).
// Each document has the cleaned `subject` and the `area` (cluster) title.
function extractDocuments(json: any): BackendDocument[] {
  let data = json?.data;
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
  let documents = data?.documents ?? [];
  if (typeof documents === "string") {
    documents = JSON.parse(documents);
  }
  return Array.isArray(documents) ? documents : [];
}

function splitKeywords(subject: string | undefined): string[] {
  return String(subject ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

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
      const documents = extractDocuments(json);

      // A loaded profile should carry documents; if it is genuinely empty there
      // is nothing to clean, which trivially satisfies the invariant.
      const keywords = documents.flatMap((d) => splitKeywords(d.subject));
      for (const kw of keywords) {
        for (const { name, re } of CLASSIFICATION_MARKERS) {
          expect(
            re.test(kw),
            `subject keyword "${kw}" (${orcid}) still carries the ${name} classification marker`,
          ).toBe(false);
        }
      }

      const areaTitles = [
        ...new Set(documents.map((d) => d.area).filter(Boolean) as string[]),
      ];
      for (const title of areaTitles) {
        for (const { name, re } of CLASSIFICATION_MARKERS) {
          expect(
            re.test(title),
            `area title "${title}" (${orcid}) still carries the ${name} classification marker`,
          ).toBe(false);
        }
      }
    });
  }
});

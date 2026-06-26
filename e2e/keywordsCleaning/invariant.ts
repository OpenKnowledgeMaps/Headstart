import { expect } from "@playwright/test";

// Shared classification-leak invariant for the keyword-cleaning e2e tests
// (ORCID + BASE). The cleaning step removes classification-scheme keywords and
// MeSH subheading qualifiers from the display `subject` field, and that cleaned
// field also feeds the cluster/area titles (summarize.R derives labels from
// metadata$subject). These are *invariant* checks, not exact-output ones: the
// live BASE API returns different records run-to-run, so we cannot pin the
// cleaned string. Instead we assert that no recognised classification marker or
// MeSH qualifier survives anywhere in `subject` or in an area title, whatever
// BASE happens to return. Exact input -> output is covered deterministically by
// the R unit tests (other-scripts/test/test_subject_cleaning.R).
//
// Vocabulary-list schemes that carry no inline marker (e.g. the Toulouse
// letter-domain list) cannot be detected by pattern without false positives, so
// they are out of scope here and remain covered by the unit tests only.
//
// Deliberately NOT asserted: the "anzsrc-for: 3402 ..." form. In the current
// pipeline an earlier generic gsub strips its "for: ..." tail and leaves an
// orphan "anzsrc-" fragment, so neither the full marker nor a clean drop holds;
// the fix requires refactoring the existing cleanup, so it is left out rather
// than encoding a failing or misleading assertion.

// Classification-scheme markers. Keep in sync with kwlib.SCHEMES / the cleaner.
// Each pattern has been checked against real cleaned `subject` data: it is absent
// after cleaning while the scheme is present in the source `subject_orig`.
export const CLASSIFICATION_MARKERS: { name: string; re: RegExp }[] = [
  { name: "mesh [MeSH]", re: /\[MeSH\]/i },
  { name: "mesh (mesh)", re: /\(mesh\)/i },
  { name: "mesh-chemical", re: /\[Chemical\]/i },
  { name: "rcdc", re: /\(rcdc\)/i },
  { name: "for / for-2020", re: /\(for(-2020)?\)/i },
  { name: "science-metrix", re: /\(science-metrix\)/i },
  { name: "sdg (suffix marker)", re: /\(sdg\)/i },
  { name: "sdg (numbered prefix)", re: /^SDG ?\d+ ?[:.-]/i },
  { name: "hrcs", re: /\(hrcs-[a-z]+\)/i },
  { name: "acm-ccs arrow", re: /→/ },
  { name: "keyvalue name=", re: /^name=/i },
  {
    name: "hal-shs domain code",
    re: /^\[(CHIM|INFO|MATH|NLIN|PHYS|SCCO|SDE|SDU|SDV|SHS|SPI|STAT|QFIN)(\.[A-Z-]+)*\]/,
  },
  { name: "ddc", re: /\bddc:\s*\d/i },
  { name: "info:eu-repo", re: /info:eu-repo/i },
  { name: "pure ontology path", re: /\/dk\/atira/i },
  { name: "fos", re: /^FOS:\s/i },
  {
    name: "arxiv category (dotted)",
    re: /\b(cs|econ|eess|math|astro-ph|nlin|q-bio|q-fin|stat)\.[A-Z]{2}\b/,
  },
  {
    name: "arxiv category (bare)",
    re: /\b(quant-ph|gr-qc|math-ph|cond-mat|hep-(ex|lat|ph|th)|nucl-(ex|th))\b/,
  },
  { name: "url", re: /^https?:\/\// },
  { name: "not elsewhere classified", re: /not elsewhere classified/i },
  { name: "numeric path", re: /^\/[0-9/]+$/ },
  // Funder grant / scheme reference, e.g. "SP/19/3/34678", "MR/S003991/1".
  // Conservative regression marker: requires 3+ slash-separated alphanumeric
  // segments with both a letter and a digit, so 1-slash MeSH/gene forms
  // ("COVID-19/epidemiology", "HER-2/neu") and all-digit dates are not matched.
  {
    name: "grant id (slash code)",
    re: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9-]*(\/[A-Za-z0-9][A-Za-z0-9-]*){2,}$/,
  },
];

// MeSH subheadings/qualifiers (mirrors MESH_QUALIFIERS in subject_cleaning.R).
// A leak is a "Descriptor/qualifier" or "Descriptor - qualifier" pair, or a
// space-joined blob of headings, surviving into the cleaned subject.
const MESH_QUALIFIERS = [
  "analysis", "blood", "cerebrospinal fluid", "isolation & purification", "urine",
  "anatomy & histology", "blood supply", "cytology", "ultrastructure", "embryology",
  "abnormalities", "innervation", "pathology", "chemistry", "agonists",
  "analogs & derivatives", "antagonists & inhibitors", "chemical synthesis",
  "diagnosis", "diagnostic imaging", "etiology", "chemically induced", "complications",
  "secondary", "congenital", "genetics", "immunology", "microbiology", "virology",
  "parasitology", "transmission", "organization & administration", "economics",
  "legislation & jurisprudence", "standards", "supply & distribution", "trends",
  "pharmacology", "adverse effects", "poisoning", "toxicity", "pharmacokinetics",
  "physiology", "growth & development", "metabolism", "biosynthesis", "deficiency",
  "enzymology", "physiopathology", "statistics & numerical data", "epidemiology",
  "ethnology", "mortality", "therapeutic use", "therapy", "diet therapy",
  "drug therapy", "nursing", "prevention & control", "radiotherapy", "rehabilitation",
  "surgery", "transplantation", "classification", "drug effects", "education",
  "ethics", "history", "injuries", "instrumentation", "methods", "pathogenicity",
  "psychology", "radiation effects", "veterinary",
];
const QUAL = MESH_QUALIFIERS.slice()
  .sort((a, b) => b.length - a.length)
  .map((q) => q.replace(/[&]/g, "\\$&"))
  .join("|");

export const QUALIFIER_MARKERS: { name: string; re: RegExp }[] = [
  { name: "mesh qualifier (slash)", re: new RegExp(`/\\s*\\*?\\s*(?:${QUAL})\\*?\\s*$`, "i") },
  { name: "mesh qualifier (dash)", re: new RegExp(`\\s-\\s\\*?(?:${QUAL})\\*?\\s*$`, "i") },
  { name: "mesh blob (space-joined headings)", re: /\S+\/\S+\s+\S+\/\S+/ },
];

// Library of Congress Classification — clear-cut forms only, as regression
// markers. Deliberately conservative: each pattern matches a form that is
// unambiguously a classification, so an ambiguous true-negative (a non-LCC
// keyword that the cleaner legitimately keeps) does NOT trip it. We do not assert
// the bare-code / code+caption forms here, as those are intentionally ambiguous.
export const LCC_MARKERS: { name: string; re: RegExp }[] = [
  // Numeric class-number range, e.g. "QC1-999", "QH301-705.5", "HF5001-6182".
  // Both sides are pure digits, so MRI sequences ("T1-T2") and cell markers
  // ("CD4-CD8") — which have a letter after the dash — are not matched.
  { name: "lcc range", re: /^[A-Z]{1,3}\d{1,4}(\.\d+)?-\d{1,4}(\.\d+)?$/ },
];

const ALL_MARKERS = [...CLASSIFICATION_MARKERS, ...QUALIFIER_MARKERS, ...LCC_MARKERS];

export interface BackendDocument {
  subject?: string;
  area?: string;
}

// getLatestRevision.php returns { context, data }, where data (a string that
// needs parsing) carries documents[] (itself sometimes a nested JSON string).
// Each document has the cleaned `subject` and the `area` (cluster) title.
export function extractDocuments(json: any): BackendDocument[] {
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

export function splitKeywords(subject: string | undefined): string[] {
  return String(subject ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Assert that no classification marker or MeSH qualifier survives in any
// `subject` keyword or in any area title. `label` identifies the search (ORCID /
// query) in the failure message. An empty document set trivially passes.
export function assertNoClassificationLeaks(
  documents: BackendDocument[],
  label: string,
): void {
  const keywords = documents.flatMap((d) => splitKeywords(d.subject));
  for (const kw of keywords) {
    for (const { name, re } of ALL_MARKERS) {
      expect(
        re.test(kw),
        `subject keyword "${kw}" (${label}) still carries the ${name} marker`,
      ).toBe(false);
    }
  }

  const areaTitles = [
    ...new Set(documents.map((d) => d.area).filter(Boolean) as string[]),
  ];
  for (const title of areaTitles) {
    for (const { name, re } of ALL_MARKERS) {
      expect(
        re.test(title),
        `area title "${title}" (${label}) still carries the ${name} marker`,
      ).toBe(false);
    }
  }
}

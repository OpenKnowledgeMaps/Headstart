import { test, expect, Page } from "@playwright/test";
import { prepareVisualisation } from "../../vis/js/utils/e2eVisualisationLoader";

interface EnrichmentTestCase {
  suiteName: string;
  query: string;
  search_params: string;
  paperTitle: string;
  keywords?: string;
  abstract?: string;
  flaky?: boolean;
}

const testCases: EnrichmentTestCase[] = [
  {
    suiteName: "bugfix: retain anchor record",
    query: '"solar eclipse"',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    paperTitle: "Why every solar eclipse viewing event needs a disco ball",
    abstract:
      "Solar eclipses offer unparalleled opportunities for public engagement in astronomy. Large groups of people often gather to view eclipses, and these events require affordable and easy to use tools to safely observe the Sun. One unique way to observe a solar eclipse is by using a disco ball. Here, we present an analysis of the experiences of educators who used a disco ball as a solar projector during various public outreach events. Through a survey conducted shortly after the April 2024 total solar eclipse and the March 2025 partial solar eclipse, we collected data on the use, engagement, and perceived educational value of a disco ball projector from 31 individual events. The results suggest that disco balls were not only affordable and safe, but also popular and educational. ... : 22 pages, 8 figures, to be published in CAPJournal Volume 19 Issue 2 ...",
    keywords:
      "FOS: Physical sciences; Instrumentation and Methods for Astrophysics astro-ph.IM; Physics Education physics.ed-ph",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: 'clinical trials',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=0",
    paperTitle: "Clinical Trials and Clinical Research: A Comprehensive Review",
    flaky: true,
    abstract:
      "Clinical research is an alternative terminology used to describe medical research. Clinical research involves people, and it is generally carried out to evaluate the efficacy of a therapeutic drug, a medical/surgical procedure, or a device as a part of treatment and patient management. Moreover, any research that evaluates the aspects of a disease like the symptoms, risk factors, and pathophysiology, among others may be termed clinical research. However, clinical trials are those studies that assess the potential of a therapeutic drug/device in the management, control, and prevention of disease. In view of the increasing incidences of both communicable and non-communicable diseases, and especially after the effects that Coronavirus Disease-19 (COVID-19) had on public health worldwide, the emphasis on clinical research assumes extremely essential. The knowledge of clinical research will facilitate the discovery of drugs, devices, and vaccines, thereby improving preparedness during public health emergencies. Therefore, in this review, we comprehensively describe the critical elements of clinical research that include clinical trial phases, types, and designs of clinical trials, operations of trial, audit, and management, and ethical concerns.",
    keywords:
      "audit; clinical research; clinical trials; efficacy; ethical concerns; medical research; therapeutic drug",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: 'antibiotics prescription',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=0",
    paperTitle: "Clinical Trials and Clinical Research: A Comprehensive Review",
    flaky: true,
    abstract:
      "Purpose The purpose of the study was to assess the bacterial resistance and annual antibiotic consumption at a tertiary care hospital in Riyadh, Saudi Arabia over a two-year period. Methods This retrospective cohort study was conducted at a tertiary care hospital in Riyadh, Saudi Arabia from January 1, 2016, to December 31, 2017. Results The results showed that there was no significant difference between 2016 and 2017 data regarding patient characteristics like bed occupancy rate, the average length of stay, and the number of admissions; the same was true for bacterial characteristics like the number of bacteria, percentage of isolates in the group, and multidrug resistance (MDR) percentage (p: >0.05). Between 2016 and 2017, there was a slight reduction in the sensitivity of Escherichia​​​ coli (E. coli) carbapenem-resistant Enterobacteriaceae (CRE) (97%, 86%) and Klebsiella pneumoniae (K. pneumoniae) CRE (80%, 76%) towards colistin. There was also a decrease in the sensitivity of Acinetobacter baumannii (A. baumannii) multidrug-resistant organism (MDRO) from 42% to 29% against tigecycline, but an increase in the sensitivity of K. pneumoniae CRE (33%, 50%) and E. coli CRE (76%, 82%). The percentage of MDR strains in gram-positive bacteria showed that more than half of Staphylococcus aureus (S. aureus) were methicillin-resistant (61%, 59%) in 2016 and 2017 respectively. There was a reduction in the percentage of MDR strains in some gram-negative bacteria like Pseudomonas aeruginosa (P. aeruginosa) MDRO (24%, 19%),E. coli extended-spectrum beta-lactamases (ESBL) (56%, 50%), E. coli CRE (4%, 1%), K. pneumoniae CRE (49%, 33%), A. baumannii CRE (90%, 76%), and Proteus mirabilis​​​​​​​ (P. mirabilis) ESBL (54%, 50%). Conclusion MDRO bacteria are very common in the hospital where the study was conducted. Immediate action is required to tackle this problem.",
    keywords:
      "antibiotic; infection; infections; multidrug resistance organism; prescription; tertiary hospital",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: '"game theory"',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    paperTitle: "Game theory approaches for autonomy",
    abstract:
      "Game theory offers techniques for applying autonomy in the field. In this mini-review, we define autonomy, and briefly overview game theory with a focus on Nash and Stackleberg equilibria and Social dilemma. We provide a discussion of successful projects using game theory approaches applied to several autonomous systems.",
    keywords:
      "Physics; QC1-999; autonomous vehicles; game theory; nash equilibrium; robotics; self-driving cars",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: 'machine translation',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    paperTitle: "A Survey of Orthographic Information in Machine Translation",
    abstract:
      "Abstract Machine translation is one of the applications of natural language processing which has been explored in different languages. Recently researchers started paying attention towards machine translation for resource-poor languages and closely related languages. A widespread and underlying problem for these machine translation systems is the linguistic difference and variation in orthographic conventions which causes many issues to traditional approaches. Two languages written in two different orthographies are not easily comparable but orthographic information can also be used to improve the machine translation system. This article offers a survey of research regarding orthography’s influence on machine translation of under-resourced languages. It introduces under-resourced languages in terms of machine translation and how orthographic information can be utilised to improve machine translation. We describe previous work in this area, discussing what underlying assumptions were made, and showing how orthographic knowledge improves the performance of machine translation of under-resourced languages. We discuss different types of machine translation and demonstrate a recent trend that seeks to link orthographic information with well-established machine translation methods. Considerable attention is given to current efforts using cognate information at different levels of machine translation and the lessons that can be drawn from this. Additionally, multilingual neural machine translation of closely related languages is given a particular focus in this survey. This article ends with a discussion of the way forward in machine translation with orthographic information, focusing on multilingual settings and bilingual lexicon induction.",
    keywords:
      "Computation and Language cs.CL; FOS: Computer and information sciences; Machine translation; Neural machine translation; Orthography; Rule-based machine translation; Statistical machine translation; Under-resourced languages",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: '"climate change"',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=7&lang_id%5B%5D=all-lang&min_descsize=0",
    paperTitle: "LAICPMS_Pb.csv",
    flaky: true,
    abstract:
      "No abstract available",
    keywords:
      "Earth and Environmental Sciences; Medicine, Health and Life Sciences",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: 'big data',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=7&lang_id%5B%5D=all-lang&min_descsize=0",
    paperTitle: "Big Data or Big Fail? The Good, the Bad and the Ugly and the missing role of Statistics",
    flaky: true,
    abstract:
      "The so called “Big Data” are data which we think as being “big” because of their volume, their amount per unit of time and because they are un- structured. The usual sources of big data are administrative repositories, transaction data or social media and social network feeds. Someone defines big data as those data which cannot be analyzed on a desktop machine or stored on one’s hard disk. These ways of defining big data completely miss the point of view of Statistics: they seem to be tailored more to advertising campaign of SaS or storage solution rather than to Science. Moreover, recent big fails, like e.g. the famous/infamous Google Flu Trend experiment, raised a series of popular news paper articles against the validity of information contained in these data and Statistics itself, even though none of these bad practices has been conducted by statisticians. While Information Technol- ogy and Computer Science are good at efficiently retrive and manage them, these data should be soon brought back into the field of Statistics to where data belong and this Special Issues of EJASA is one important step in this direction.",
    keywords:
      "Big data; social media; unstructured data; statistics; Settore SECS-S/01 - Statistica; Settore MAT/06 - Probabilita' e Statistica Matematica",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: 'automation tools',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=7&lang_id%5B%5D=all-lang&min_descsize=0",
    paperTitle: "AEQUITAS. WP7. USE CASE HR1. DESC. v1.0",
    flaky: true,
    abstract:
      "The dataset contains the matching of job positions and hiring candidates; this data has been collected by a big Italian company, working in the HR sector - ADECCO. The detailed description of the data can be found in a README file within the compressed archive. This activity is part of the HORIZON-CL4-2021-HUMAN-01-24-AEQUITAS project (g.a. 101070363). The aim of AEQUITAS to address and tackle the multiple manifestations of bias and unfairness in Artificial Intelligence (AI) from a variety of dimensions, such as the development of AI tools, the data used to train, test and validate them or the interpretation practices developed around them. AEQUITAS offers an overall approach for tackling the problem, savant of the criticalities that automation and AI techniques bring about. This case study allows for detecting hiring dataset biases which are the primary source for training a novel AI system. For example, there are historical trends in the labour market in favour of men (higher levels of education, once of employment, hence of hiring) that might be reflected in the data history of ADECCO. Balancing these inequalities in data or leaving data biased and targeting debiasing or bias reducing algorithms is a key step for a fair AI system and dataset. The ADECCO data offer data were to compare selection decisions with regards to important bias, such as gender, age, economic background, etc.",
    keywords:
      "INF/01 Informatica; ING-INF/05 Sistemi di elaborazione delle informazioni",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: '"game theory"',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    paperTitle: "Composing games into complex institutions",
    keywords:
      "Computer Science and Game Theory cs.GT; FOS: Computer and information sciences; Medicine; Q; R; Science; Social and Information Networks cs.SI",
  },
  {
    suiteName: "bugfix: retain anchor record",
    query: '"game theory"',
    search_params: "&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300",
    paperTitle: "Medical ethics, logic traps, and game theory: an illustrative tale of brain death",
    flaky: true,
    keywords:
      "Adult [MeSH]; Analytical Approach; Attitude to Death [MeSH]; Brain Death [MeSH]; Death and Euthanasia; Decision Making [MeSH]; Female [MeSH]; Game Theory [MeSH]; Humans [MeSH]; Life Support Care [MeSH]; Logic [MeSH]; Withholding Treatment [MeSH]",
  },
];

const uniqueWarmups = testCases.filter(
  (tc, i, arr) =>
    arr.findIndex((t) => t.query === tc.query && t.search_params === tc.search_params) === i
);

// This can also be used to pre-load the BASE searches, so that the subsequent tests run faster
// npx playwright test "e2e/keywordsEnrichment/BASE.spec.ts" --grep "Warm-up: pre-load BASE searches"
test.describe("Warm-up: pre-load BASE searches", () => {
  for (const tc of uniqueWarmups) {
    test(`${tc.query}`, async ({ page }) => {
      const url = `/search?type=get&vis_type=overview&q=${tc.query}${tc.search_params}`;
      await prepareVisualisation(page, url);
      await expect(page.locator("#search-term-unique")).toContainText(tc.query);
    });
  }
});

for (const tc of testCases) {
  test.describe(
    `Verify abstract and keywords are merged correctly, ${tc.suiteName} [${tc.query}]`,
    () => {
      const url = `/search?type=get&vis_type=overview&q=${tc.query}${tc.search_params}`;

      async function openPaper(page: Page) {
        await prepareVisualisation(page, url);
        await expect(page.locator("#search-term-unique")).toContainText(
          tc.query,
        );
        const paper = page.getByTitle(tc.paperTitle);
        await expect(paper).toBeVisible();
        await paper.click();
        return paper;
      }

      if (tc.keywords) {
        const keywords = tc.keywords;
        const flaky = tc.flaky;
        test(`Keywords enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          test.fixme(!!flaky, "Flaky: depends on BASE API returning duplicate records consistently");
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(keywords);
        });
      }

      if (tc.abstract) {
        const abstract = tc.abstract;
        const flaky = tc.flaky;
        test(`Abstract enrichment for the '${tc.paperTitle}' document`, async ({
          page,
        }) => {
          test.fixme(!!flaky, "Flaky: depends on BASE API returning duplicate records consistently");
          await openPaper(page);
          await expect(page.locator("#list_holder")).toContainText(abstract);
        });
      }
    },
  );
}

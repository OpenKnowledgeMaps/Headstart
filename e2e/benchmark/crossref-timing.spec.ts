import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const MASTER_URL = process.env.BENCHMARK_MASTER_URL ?? "https://dev.openknowledgemaps.org/master";
const FEATURE_URL = process.env.BENCHMARK_FEATURE_URL ?? "https://dev.openknowledgemaps.org/crossref-rate-limit-enhancement";

const SEARCHES = [
  // ORCID — reuse IDs from existing e2e tests
  {
    name: "ORCID: Sebastian Dennerlein (0000-0001-6011-4382)",
    path: "/search?type=get&vis_type=overview&orcid=0000-0001-6011-4382&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: Christian Hilbe (0000-0001-5116-955X)",
    path: "/search?type=get&vis_type=overview&orcid=0000-0001-5116-955X&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0003-0204-881X",
    path: "/search?type=get&vis_type=overview&orcid=0000-0003-0204-881X&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0003-2897-6075",
    path: "/search?type=get&vis_type=overview&orcid=0000-0003-2897-6075&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0002-8911-7832",
    path: "/search?type=get&vis_type=overview&orcid=0000-0002-8911-7832&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0002-9843-6798",
    path: "/search?type=get&vis_type=overview&orcid=0000-0002-9843-6798&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0003-4221-6275",
    path: "/search?type=get&vis_type=overview&orcid=0000-0003-4221-6275&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0002-2233-6926",
    path: "/search?type=get&vis_type=overview&orcid=0000-0002-2233-6926&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0002-2441-4043",
    path: "/search?type=get&vis_type=overview&orcid=0000-0002-2441-4043&service=orcid&embed=true&academic_age_offset=1",
  },
  {
    name: "ORCID: 0000-0001-9287-3770",
    path: "/search?type=get&vis_type=overview&orcid=0000-0001-9287-3770&service=orcid&embed=true&academic_age_offset=1",
  },

  // PubMed — general biomedical domains
  {
    name: "PubMed: machine learning diagnosis",
    path: "/search?type=get&vis_type=overview&q=machine%20learning%20diagnosis&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: CRISPR gene editing",
    path: "/search?type=get&vis_type=overview&q=CRISPR%20gene%20editing&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: gut microbiome disease",
    path: "/search?type=get&vis_type=overview&q=gut%20microbiome%20disease&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: COVID-19 long-term effects",
    path: "/search?type=get&vis_type=overview&q=COVID-19%20long-term%20effects&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: Alzheimer neurodegeneration",
    path: "/search?type=get&vis_type=overview&q=Alzheimer%20neurodegeneration&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: immunotherapy cancer",
    path: "/search?type=get&vis_type=overview&q=immunotherapy%20cancer&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: antibiotic resistance",
    path: "/search?type=get&vis_type=overview&q=antibiotic%20resistance&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: cardiovascular risk factors",
    path: "/search?type=get&vis_type=overview&q=cardiovascular%20risk%20factors&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: mRNA vaccine",
    path: "/search?type=get&vis_type=overview&q=mRNA%20vaccine&service=pubmed&sorting=most-relevant",
  },
  {
    name: "PubMed: diabetes insulin resistance",
    path: "/search?type=get&vis_type=overview&q=diabetes%20insulin%20resistance&service=pubmed&sorting=most-relevant",
  },
];

async function timeVisualization(page: Page, fullUrl: string): Promise<number> {
  const start = Date.now();
  await page.goto(fullUrl);
  const context = page.getByTestId("context");
  await expect(context).toBeVisible({ timeout: 5 * 60 * 1000 });
  await expect
    .poll(
      async () => ((await context.textContent()) ?? "").replace(/\s+/g, " ").trim(),
      { timeout: 5 * 60 * 1000, intervals: [500, 1000, 2000, 5000] },
    )
    .not.toBe("");
  return Date.now() - start;
}

const results: { name: string; masterMs: number; featureMs: number; deltaMs: number }[] = [];

for (const search of SEARCHES) {
  test(search.name, async ({ page }, testInfo) => {
    const masterMs = await timeVisualization(page, MASTER_URL + search.path);
    const featureMs = await timeVisualization(page, FEATURE_URL + search.path);
    const deltaMs = featureMs - masterMs;

    testInfo.annotations.push(
      { type: "master_ms", description: String(masterMs) },
      { type: "feature_ms", description: String(featureMs) },
      { type: "delta_ms", description: String(deltaMs) },
    );

    await testInfo.attach("timing", {
      body: JSON.stringify({ name: search.name, masterMs, featureMs, deltaMs }),
      contentType: "application/json",
    });

    results.push({ name: search.name, masterMs, featureMs, deltaMs });

    const faster = deltaMs < 0;
    const pct = Math.abs((deltaMs / masterMs) * 100).toFixed(1);
    console.log(
      `\n  ${search.name}\n` +
      `    master:  ${(masterMs / 1000).toFixed(1)}s\n` +
      `    feature: ${(featureMs / 1000).toFixed(1)}s\n` +
      `    ${faster ? "▲ faster" : "▼ slower"} by ${Math.abs(deltaMs)}ms (${pct}%)`,
    );
  });
}

test.afterAll(async ({}, testInfo) => {
  if (results.length === 0) return;

  const totalMaster = results.reduce((s, r) => s + r.masterMs, 0);
  const totalFeature = results.reduce((s, r) => s + r.featureMs, 0);
  const totalDelta = totalFeature - totalMaster;

  const colWidth = Math.max(...results.map((r) => r.name.length)) + 2;
  const header =
    "Search".padEnd(colWidth) + "  master(s)  feature(s)     delta";
  const separator = "─".repeat(header.length);
  const rows = results.map((r) =>
    r.name.padEnd(colWidth) +
    `  ${(r.masterMs / 1000).toFixed(2).padStart(9)}` +
    `  ${(r.featureMs / 1000).toFixed(2).padStart(10)}` +
    `  ${(r.deltaMs > 0 ? "+" : "") + (r.deltaMs / 1000).toFixed(2).padStart(8)}s`,
  );
  const totalsRow =
    "TOTAL".padEnd(colWidth) +
    `  ${(totalMaster / 1000).toFixed(2).padStart(9)}` +
    `  ${(totalFeature / 1000).toFixed(2).padStart(10)}` +
    `  ${(totalDelta > 0 ? "+" : "") + (totalDelta / 1000).toFixed(2).padStart(8)}s`;

  const summary = [separator, header, separator, ...rows, separator, totalsRow, separator].join("\n");

  console.log("\n\nBENCHMARK SUMMARY\n" + summary);

  const outPath = path.resolve("benchmark-results.json");
  fs.writeFileSync(outPath, JSON.stringify({ master: MASTER_URL, feature: FEATURE_URL, results }, null, 2));
  console.log(`\nFull results written to ${outPath}`);

  await testInfo.attach("summary", {
    body: summary,
    contentType: "text/plain",
  });
});

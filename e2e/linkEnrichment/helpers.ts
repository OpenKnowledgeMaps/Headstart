import { Page, Response } from "@playwright/test";

/**
 * Capture the JSON payload returned by `services/getLatestRevision.php`.
 *
 * `prepareVisualisation` triggers a fetch of this endpoint when the
 * visualisation loads. We register the waiter *before* prepareVisualisation
 * runs so the response can't be missed.
 *
 * The response body wraps the paper array inside a `data` field that is
 * itself a JSON-encoded string — this helper handles that unpacking so call
 * sites just receive `papers[]`.
 */
export async function capturePapersFromLatestRevision(
  page: Page,
  trigger: () => Promise<void>,
): Promise<any[]> {
  const responsePromise = page.waitForResponse(
    (r: Response) =>
      r.url().includes("services/getLatestRevision.php") && r.status() === 200,
    { timeout: 60_000 },
  );

  await trigger();

  const response = await responsePromise;
  const body = await response.json();

  // Walk through the wrapping layers until we land on the paper array.
  // Observed shape from BASE/ORCID responses:
  //   body.data is a JSON-encoded string that parses to
  //     { author, documents, ... }
  //   where `documents` is itself a JSON-encoded string holding the paper
  //   array. So two parse steps + one key lookup. Other endpoints may
  //   deliver the array directly or under `data`/`papers`/`results`, so the
  //   loop is tolerant of those too.
  let cursor: any = body?.data;
  for (let i = 0; i < 6; i++) {
    if (Array.isArray(cursor)) return cursor;
    if (typeof cursor === "string") {
      try {
        cursor = JSON.parse(cursor);
        continue;
      } catch {
        break;
      }
    }
    if (cursor && typeof cursor === "object") {
      const nextKey = ["documents", "data", "papers", "results"].find(
        (k) => k in cursor,
      );
      if (nextKey) {
        cursor = cursor[nextKey];
        continue;
      }
    }
    break;
  }

  throw new Error(
    "Unexpected getLatestRevision payload shape — could not find papers array. body keys=" +
      JSON.stringify(Object.keys(body ?? {})) +
      ", data type=" +
      typeof body?.data +
      ", sample=" +
      JSON.stringify(body).slice(0, 500),
  );
}

/**
 * Returns papers whose `pdf_link_candidates_from_duplicates` field carries
 * at least one URL — i.e. papers where link enrichment actually fired.
 */
export function papersWithLinkEnrichment(papers: any[]): any[] {
  return papers.filter((p) => {
    const v = p?.pdf_link_candidates_from_duplicates;
    if (!v) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  });
}

/**
 * Return the candidates field for a paper as a single string, regardless
 * of whether the raw payload delivers it as a string or array. Returns ""
 * when the field is absent or empty.
 */
export function candidatesAsString(paper: any): string {
  const v = paper?.pdf_link_candidates_from_duplicates;
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join("; ");
  return "";
}

import {
  commentArrayValidator,
  commentsSanitizer,
  dateValidator,
  oaStateValidator,
  resultTypeSanitizer,
  stringArrayValidator,
} from "../../utils/data";

/**
 * Scheme object based on the metadata spreadsheet.
 *
 * https://docs.google.com/spreadsheets/d/112Anbf-sJYkehyFvjuxr1DuMih-fPB9nt3E8ll19Iyc/edit#gid=0
 *
 * It's an array of objects, each object describes a paper property.
 *
 * It has the following properties:
 *
 * - name: string - the paper property's name
 * - required?: boolean - true for mandatory properties
 * - type?: string[] - list of allowed js types
 * - protected?: boolean - true for properties that shouldn't be escaped
 * - validator?: (value: any) => boolean - validator function that receives the property value and returns true if the value is valid
 * - sanitizer?: (value: any) => any - sanitizer function that sanitizes the property value
 * - fallback?: (localization?: object, paper?: object) => any - fallback function that returns a fallback value
 *
 */
const DEFAULT_SCHEME = [
  {
    name: "id",
    required: true,
    type: ["string"],
    unique: true,
    fallback: (loc) => loc.default_id,
  },
  { name: "identifier", type: ["string"], fallback: () => "" },
  {
    name: "authors",
    required: true,
    type: ["string"],
    protected: true,
    fallback: () => "",
  },
  {
    name: "title",
    required: true,
    type: ["string"],
    fallback: () => "",
  },
  {
    name: "paper_abstract",
    required: true,
    type: ["string"],
    protected: true,
    fallback: (loc) => loc.default_abstract,
  },
  {
    name: "year",
    required: true,
    type: ["string"],
    validator: dateValidator,
    // we use whatever we have, it's better than not displaying anything
    sanitizer: (val) => val,
    fallback: (loc) => loc.default_year,
  },
  {
    name: "oa_state",
    type: ["number", "string"],
    required: true,
    validator: oaStateValidator,
    fallback: () => 2,
  },
  {
    name: "subject_orig",
    required: true,
    type: ["string"],
    validator: (val) => val !== "",
    fallback: (loc) => loc.no_keywords,
  },
  { name: "subject_cleaned", required: true, type: ["string"] },
  { name: "relevance", required: true, type: ["number"] },
  { name: "link", type: ["string"] },
  {
    name: "published_in",
    type: ["string"],
    fallback: (loc) => loc.default_published_in,
  },
  { name: "fulltext", type: ["string"] },
  { name: "language", type: ["string"] },
  { name: "subject", type: ["string"] },
  {
    name: "url",
    type: ["string"],
    fallback: (loc) => loc.default_url,
  },
  {
    name: "relation",
    type: ["string"],
    fallback: () => "",
  },
  {
    name: "resulttype",
    type: ["object"],
    validator: stringArrayValidator,
    sanitizer: resultTypeSanitizer,
    fallback: () => [],
  },
  {
    name: "comments",
    type: ["object"],
    validator: commentArrayValidator,
    sanitizer: commentsSanitizer,
    fallback: () => [],
  },
  { name: "readers", fallback: (loc) => loc.default_readers },
  { name: "tags", type: ["string"], fallback: () => "" },
  { name: "doi", type: ["string"] },
  {
    name: "x",
    type: ["string", "number"],
    required: true,
    fallback: (loc) => loc.default_x,
  },
  {
    name: "y",
    type: ["string", "number"],
    required: true,
    fallback: (loc) => loc.default_y,
  },
  { name: "area", required: true, fallback: (loc) => loc.default_area },
  {
    name: "area_uri",
    type: ["string", "number"],
    required: true,
    fallback: (l, paper) => paper.area,
  },
  { name: "cluster_labels", required: true },
  { name: "file_hash", type: ["string"], fallback: (loc) => loc.default_hash },
];

export default DEFAULT_SCHEME;

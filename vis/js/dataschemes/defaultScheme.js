import {
  dateValidator,
  oaStateValidator,
  stringArrayValidator,
} from "../utils/data";

// name; required?; type?; protected?; validator?; fallback?;
const DEFAULT_SCHEME = [
  {
    name: "id",
    required: true,
    type: ["string"],
    unique: true,
    fallback: (loc) => loc.default_id,
  },
  { name: "identifier", type: ["string"] },
  {
    name: "authors",
    required: true,
    type: ["string"],
    protected: true,
    fallback: (loc) => loc.default_author,
  },
  {
    name: "title",
    required: true,
    type: ["string"],
    fallback: (loc) => loc.no_title,
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
    fallback: (loc) => loc.default_year,
  },
  {
    name: "oa_state",
    type: ["number", "string"],
    required: true,
    validator: oaStateValidator,
  },
  {
    name: "subject_orig",
    required: true,
    type: ["string"],
    fallback: () => "",
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
    name: "resulttype",
    type: ["object"],
    validator: stringArrayValidator,
    fallback: () => [],
  },
  {
    name: "comments",
    type: ["object"],
    validator: stringArrayValidator,
    fallback: () => [],
  },
  { name: "readers", fallback: (loc) => loc.default_readers },
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
  { name: "file_hash", fallback: (loc) => loc.default_hash },
];

export default DEFAULT_SCHEME;

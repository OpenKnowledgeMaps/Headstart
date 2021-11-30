import $ from "jquery";

import {
  dateValidator,
  getAuthorsList,
  getInternalMetric,
  getOpenAccessLink,
  getOutlink,
  getVisibleMetric,
  isOpenAccess,
  oaStateValidator,
  parseCoordinate,
  stringArrayValidator,
} from "../utils/data";

// name; required?; type?; protected?; validator?; fallback?;
const PAPER_PROPS = [
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

class DataManager {
  constructor(config) {
    this.config = config;
    // outputs
    this.context = {};
    this.papers = [];
    this.streams = [];
    this.areas = [];
  }

  parseData(backendData) {
    this.__parseContext(backendData);

    this.__parsePapers(backendData);

    this.__parseAreas(backendData);
    this.__parseStreams(backendData);
  }

  __parseContext(backendData) {
    this.context = {};
    if (typeof backendData.context === "object") {
      this.context = backendData.context;
    }
    if (typeof this.context.params === "string") {
      this.context.params = JSON.parse(this.context.params);
    }
  }

  __parsePapers(backendData) {
    this.papers = this.__getPapersArray(backendData);

    this.__sanitizePapers();

    this.__processPapers();
  }

  // migrated from legacy code
  __getPapersArray(backendData) {
    if (this.config.show_context) {
      if (typeof backendData.data === "string") {
        return JSON.parse(backendData.data);
      }
      return backendData.data;
    }
    if (typeof backendData.data === "object") {
      return backendData.data;
    }

    return backendData;
  }

  __sanitizePapers() {
    this.__checkProperties();
    this.__addMissingProperties();
    this.__checkUniqueProperties();
  }

  __checkProperties() {
    const missingProps = new Map();
    const wrongTypes = new Set();
    const wrongData = new Set();

    this.papers.forEach((paper) => {
      PAPER_PROPS.forEach((prop) => {
        if (prop.required && typeof paper[prop.name] === "undefined") {
          if (!missingProps.has(prop.name)) {
            missingProps.set(prop.name, 0);
          }
          missingProps.set(prop.name, missingProps.get(prop.name) + 1);
        }

        if (typeof paper[prop.name] !== "undefined") {
          if (prop.type && !prop.type.includes(typeof paper[prop.name])) {
            wrongTypes.add(prop.name);
          }
          if (prop.validator && !prop.validator(paper[prop.name])) {
            wrongData.add(prop.name);
          }
        }
      });
    });

    this.__printMissingPropsWarning(missingProps, this.papers.length);
    this.__printWrongTypesWarning(wrongTypes);
    this.__printWrongDataWarning(wrongData);
  }

  __printMissingPropsWarning(missingProps, dataLength) {
    missingProps.forEach((value, key) => {
      console.warn(
        `Property '${key}' missing in ${
          value === dataLength ? "all" : value
        } papers.`
      );
    });
  }

  __printWrongTypesWarning(wrongTypes) {
    if (wrongTypes.size > 0) {
      console.warn(
        `Incorrect data types found in the following properties: `,
        wrongTypes
      );
    }
  }

  __printWrongDataWarning(wrongTypes) {
    if (wrongTypes.size > 0) {
      console.warn(
        `Malformed data found in the following properties: `,
        wrongTypes
      );
    }
  }

  __addMissingProperties() {
    const fallbackProps = PAPER_PROPS.filter((p) => !!p.fallback);
    const loc = this.config.localization[this.config.language];
    this.papers.forEach((paper) => {
      fallbackProps.forEach((prop) => {
        this.__setFallbackValue(paper, prop.name, prop.fallback(loc, paper));
      });

      this.config.scale_types.forEach((type) => {
        this.__setFallbackValue(paper, type, loc.default_readers);
      });
    });
  }

  __setFallbackValue(paper, property, fallback) {
    if (typeof paper[property] === "undefined" || paper[property] === null) {
      paper[property] = fallback;
    }
  }

  __checkUniqueProperties() {
    const uniqueProps = PAPER_PROPS.filter((p) => p.unique);
    const duplicateProps = new Set();
    uniqueProps.forEach((prop) => {
      const values = new Set();
      this.papers.forEach((paper) => {
        if (values.has(paper[prop.name])) {
          duplicateProps.add(prop.name);
        }
        values.add(paper[prop.name]);
      });
    });

    if (duplicateProps.size > 0) {
      console.warn(
        `Properties with duplicate values that should be unique found: `,
        duplicateProps
      );
    }
  }

  __processPapers() {
    const blockedCoords = {};
    this.papers.forEach((paper) => {
      paper.safe_id = this.__getSafeId(paper);
      this.__escapeStrings(paper);
      this.__parseAuthors(paper);
      this.__parseCoordinates(paper);
      while (blockedCoords[`${paper.x}:${paper.y}`]) {
        this.__adjustCoordinates(paper);
      }
      blockedCoords[`${paper.x}:${paper.y}`] = true;
      this.__parseAccess(paper);
      this.__parseLink(paper);
      this.__parseComments(paper);
      this.__countMetrics(paper);
    });
  }

  // migrated from legacy code
  __getSafeId(paper) {
    const id = paper.id.toString();

    return id.replace(/[^a-zA-Z0-9]/g, (s) => {
      const c = s.charCodeAt(0);
      if (c === 32) {
        return "-";
      }
      return "__" + ("000" + c.toString(16)).slice(-4);
    });
  }

  __parseAuthors(paper) {
    paper.authors_list = getAuthorsList(
      paper.authors,
      this.config.convert_author_names
    );

    paper.authors_string = paper.authors_list.join(", ");
  }

  // migrated from legacy code
  __escapeStrings(paper) {
    const protectedProps = new Set(
      PAPER_PROPS.filter((p) => p.protected).map((p) => p.name)
    );

    for (const field in paper) {
      if (typeof paper[field] === "string") {
        paper[field] = $("<textarea/>").html(paper[field]).val();
        if (!protectedProps.has(field)) {
          paper[field] = paper[field].replace(/</g, "&lt;");
          paper[field] = paper[field].replace(/>/g, "&gt;");
        }
      }
    }
  }

  __parseCoordinates(paper) {
    paper.x = parseCoordinate(paper.x, 8);
    paper.y = parseCoordinate(paper.y, 8);
  }

  __adjustCoordinates(paper) {
    paper.y = (parseFloat(paper.y) + Number(0.00000001)).toFixed(8);
  }

  __parseAccess(paper) {
    paper.oa = isOpenAccess(paper, this.config);
    paper.free_access = parseInt(paper.oa_state) === 3;
  }

  __parseLink(paper) {
    paper.oa_link = getOpenAccessLink(paper, this.config);
    paper.outlink = getOutlink(paper, this.config);
  }

  __parseComments(paper) {
    paper.comments_for_filtering = paper.comments
      .map((c) => `${c.comment} ${c.author}`)
      .join(" ");
  }

  __countMetrics(paper) {
    const config = this.config;

    paper.num_readers = 0;
    paper.internal_readers = 1;

    if (!config.content_based && !config.scale_by) {
      paper.num_readers = getVisibleMetric(paper, "readers");
      paper.internal_readers = getInternalMetric(paper, "readers") + 1;
    }
    if (config.scale_by) {
      paper.num_readers = getVisibleMetric(paper, config.scale_by);
      paper.internal_readers = getInternalMetric(paper, config.scale_by) + 1;
    }

    paper.readers = paper.num_readers;
    if (config.metric_list) {
      paper.tweets = getVisibleMetric(paper, "cited_by_tweeters_count");
      paper.citations = getVisibleMetric(paper, "citation_count");
      paper.readers = getVisibleMetric(paper, "readers.mendeley");
    }
  }

  __parseAreas(backendData) {
    // TODO
  }

  __parseStreams(backendData) {
    // TODO
  }
}

export default DataManager;

import $ from "jquery";

import {
  getAuthorsList,
  getInternalMetric,
  getOpenAccessLink,
  getOutlink,
  getVisibleMetric,
  isOpenAccess,
  parseCoordinate,
} from "../utils/data";

// attributes that aren't escaped
const PROTECTED_ATTRS = new Set(["paper_abstract", "authors"]);

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
    const loc = this.config.localization[this.config.language];
    this.papers.forEach((paper) => {
      this.__setFallbackValue(paper, "area", loc.default_area);
      this.__setFallbackValue(paper, "authors", loc.default_author);
      this.__setFallbackValue(paper, "file_hash", loc.default_hash);
      this.__setFallbackValue(paper, "id", loc.default_id);
      this.__setFallbackValue(paper, "paper_abstract", loc.default_abstract);
      this.__setFallbackValue(paper, "published_in", loc.default_published_in);
      this.__setFallbackValue(paper, "readers", loc.default_readers);
      this.__setFallbackValue(paper, "title", loc.no_title);
      this.__setFallbackValue(paper, "url", loc.default_url);
      this.__setFallbackValue(paper, "x", loc.default_x);
      this.__setFallbackValue(paper, "y", loc.default_y);
      this.__setFallbackValue(paper, "year", loc.default_year);
      this.__setFallbackValue(paper, "comments", []);
      this.__setFallbackValue(paper, "subject_orig", "");
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
    for (const field in paper) {
      if (typeof paper[field] === "string") {
        paper[field] = $("<textarea/>").html(paper[field]).val();
        if (!PROTECTED_ATTRS.has(field)) {
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

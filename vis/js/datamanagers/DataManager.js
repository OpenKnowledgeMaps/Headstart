import $ from "jquery";
import d3 from "d3";

import {
  getDiameterScale,
  getInitialCoordsScale,
  getCoordsScale,
  getRadiusScale,
} from "../utils/scale";
import {
  extractAuthors,
  getAuthorsList,
  getInternalMetric,
  getListLink,
  getOpenAccessLink,
  getOutlink,
  getVisibleMetric,
  isOpenAccess,
  parseCoordinate,
} from "../utils/data";
import { transformData } from "../utils/streamgraph";

import DEFAULT_SCHEME from "../dataschemes/defaultScheme";
import PaperSanitizer from "../utils/PaperSanitizer";

const GOLDEN_RATIO = 2.6;

class DataManager {
  config = {};
  paperProps = [];
  // outputs
  context = {};
  papers = [];
  scalingFactors = {};
  streams = [];
  areas = [];

  constructor(config, scheme = DEFAULT_SCHEME) {
    this.config = config;
    this.paperProps = scheme;
  }

  parseData(backendData, chartSize) {
    // initialize this.context
    this.__parseContext(backendData);
    // initialize this.papers
    this.__parsePapers(backendData);
    // initialize this.scalingFactors
    this.__computeScalingFactors(this.papers.length);

    if (!this.config.is_streamgraph) {
      // scale this.papers based on the chart size
      this.__scalePapers(chartSize);
      // initialize this.areas
      this.__parseAreas(backendData);
      // scale this.areas based on the chart size
      this.__scaleAreas(chartSize);
    } else {
      // initialize this.streams
      this.__parseStreams(backendData);
    }
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
    const paperSanitizer = new PaperSanitizer(this.config);

    paperSanitizer.checkRequiredProps(this.papers, this.paperProps);
    this.papers = paperSanitizer.sanitizeProps(this.papers, this.paperProps);
    paperSanitizer.checkUniqueProps(this.papers, this.paperProps);
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
      this.__parseTags(paper);
      this.__parseKeywords(paper);
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
    paper.authors_objects = extractAuthors(paper.authors);
    paper.authors_list = getAuthorsList(
      paper.authors,
      this.config.convert_author_names
    );

    paper.authors_string = paper.authors_list.join(", ");
  }

  // migrated from legacy code
  __escapeStrings(paper) {
    const protectedProps = new Set(
      this.paperProps.filter((p) => p.protected).map((p) => p.name)
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
    paper.list_link = getListLink(paper, this.config, this.context);
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

  __parseTags(paper) {
    paper.tags = paper.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => !!tag);
  }

  __parseKeywords(paper) {
    paper.keywords = paper.subject_orig;
  }

  __scalePapers(size) {
    const paperWidthFactor = this.config.paper_width_factor;
    const paperHeightFactor = this.config.paper_height_factor;

    const xs = this.papers.map((e) => e.x);
    const xScale = getInitialCoordsScale(d3.extent(xs), size);

    const ys = this.papers.map((e) => e.y);
    const yScale = getInitialCoordsScale(d3.extent(ys), size);

    const diameters = this.papers.map((e) => e.internal_readers);
    const dScale = getDiameterScale(d3.extent(diameters), size, {
      referenceSize: this.config.reference_size,
      minDiameterSize: this.config.min_diameter_size,
      maxDiameterSize: this.config.max_diameter_size,
      paperMinScale: this.scalingFactors.paperMinScale,
      paperMaxScale: this.scalingFactors.paperMaxScale,
    });

    this.papers.forEach((paper) => {
      paper.x = xScale(paper.x);
      paper.y = yScale(paper.y);
      paper.diameter = dScale(paper.internal_readers);
      paper.width =
        paperWidthFactor *
        Math.sqrt(Math.pow(paper.diameter, 2) / GOLDEN_RATIO);
      paper.height =
        paperHeightFactor *
        Math.sqrt(Math.pow(paper.diameter, 2) / GOLDEN_RATIO);

      // some fallback values
      paper.zoomedX = paper.x;
      paper.zoomedY = paper.y;
      paper.zoomedWidth = paper.width;
      paper.zoomedHeight = paper.height;
    });
  }

  __computeScalingFactors(numOfPapers) {
    const [paperFactor, bubbleFactor] = this.__getResizeFactors(numOfPapers);

    this.scalingFactors = {
      bubbleMinScale: this.config.bubble_min_scale * bubbleFactor,
      bubbleMaxScale: this.config.bubble_max_scale * bubbleFactor,
      paperMinScale: this.config.paper_min_scale * paperFactor,
      paperMaxScale: this.config.paper_max_scale * paperFactor,
    };
  }

  // coefficients taken from legacy code
  __getResizeFactors(numOfPapers) {
    if (!this.config.dynamic_sizing) {
      return [1, 1];
    }

    if (numOfPapers < 150) {
      return [1, 1];
    }
    if (numOfPapers < 200) {
      return [0.9, 1.1];
    }
    if (numOfPapers < 250) {
      return [0.8, 1.1];
    }
    if (numOfPapers < 300) {
      return [0.7, 1.1];
    }
    if (numOfPapers < 500) {
      return [0.7, 1.2];
    }

    return [0.6, 1.2];
  }

  __parseAreas() {
    const areas = {};

    this.papers.forEach((paper) => {
      const areaUri = paper.area_uri;
      if (!areas[areaUri]) {
        areas[areaUri] = {
          area_uri: areaUri,
          title: paper.area,
          papers: [],
        };
      }

      areas[areaUri].papers.push(paper);
    });

    this.areas = [];
    for (const areaUri in areas) {
      const papers = areas[areaUri].papers;

      const x =
        papers.map((e) => parseFloat(e.x)).reduce((a, b) => a + b, 0) /
        (1.0 * papers.length);
      const y =
        papers.map((e) => -parseFloat(e.y)).reduce((a, b) => a + b, 0) /
        (1.0 * papers.length);

      areas[areaUri].origX = x;
      areas[areaUri].origY = y;

      const readers = papers
        .map((e) => e.internal_readers)
        .reduce((a, b) => a + b, 0);
      areas[areaUri].num_readers = readers;
      areas[areaUri].origR = readers;

      this.areas.push(areas[areaUri]);
    }
  }

  __scaleAreas(size) {
    const scaleOptions = {
      minAreaSize: this.config.min_area_size,
      maxAreaSize: this.config.max_area_size,
      referenceSize: this.config.reference_size,
      bubbleMinScale: this.scalingFactors.bubbleMinScale,
      bubbleMaxScale: this.scalingFactors.bubbleMaxScale,
    };

    const xs = this.areas.map((e) => e.origX);
    const xScale = getCoordsScale(d3.extent(xs), size, scaleOptions);

    const ys = this.areas.map((e) => e.origY);
    const yScale = getCoordsScale(d3.extent(ys), size, scaleOptions);

    const rs = this.areas.map((e) => e.origR);
    const rScale = getRadiusScale(d3.extent(rs), size, scaleOptions);

    this.areas.forEach((area) => {
      area.x = xScale(area.origX);
      area.y = yScale(area.origY);
      area.r = rScale(area.origR);

      // some fallback values
      area.zoomedX = area.x;
      area.zoomedY = area.y;
      area.zoomedR = area.r;
    });
  }

  __parseStreams(backendData) {
    const parsedData = JSON.parse(backendData.streamgraph);
    const transformedData = transformData(parsedData);

    const nest = d3.nest().key((d) => d.key);

    const nestedEntries = nest.entries(transformedData);

    const stack = d3.layout
      .stack()
      .offset("silhouette")
      .values((d) => d.values)
      .x((d) => d.date)
      .y((d) => d.value);

    this.streams = stack(nestedEntries);

    this.streams.forEach((stream) => {
      const firstTransformedEntry = transformedData.find(
        (t) => t.key === stream.key
      );
      stream.docIds = firstTransformedEntry ? firstTransformedEntry.docIds : [];
    });
  }
}

export default DataManager;

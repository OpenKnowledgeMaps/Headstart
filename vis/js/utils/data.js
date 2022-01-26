import { stringCompare } from "./string";

/**
 * Filters the input data according to the provided settings.
 * @param {Array} data input array that contains papers
 * @param {Object} searchSettings 'value' = search string
 * @param {Object} filterSettings 'value' = filter mode, 'field' = what field
 * to match to 'value', 'area' = uri of the zoomed-in area, 'paper' = id of the
 * selected paper
 *
 * @returns {Array} filtered data array
 */
export const filterData = (data, searchSettings, filterSettings) => {
  if (filterSettings.paper) {
    data = data.filter((e) => e.safe_id === filterSettings.paper);
  }

  if (filterSettings.zoomed) {
    if (filterSettings.isStreamgraph) {
      if (filterSettings.docIds) {
        data = data.filter((paper) => filterSettings.docIds.includes(paper.id));
      }
    } else {
      data = data.filter(
        (e) => e.area_uri.toString() === filterSettings.area.toString()
      );
    }
  }

  let filterValue = filterSettings.value;
  let filterField = filterSettings.field;

  data = data.filter(getParamFilterFunction(filterValue, filterField));

  let searchWords = parseSearchText(searchSettings.value);
  if (searchWords.length > 0) {
    data = data.filter(getWordFilterFunction(searchWords));
  }

  return data;
};

/**
 * Returns the search text keywords.
 * @param {String} searchText plaintext
 *
 * @returns {Array} keywords array
 */
export const parseSearchText = (searchText) => {
  return searchText
    .split(" ")
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word !== "");
};

const getParamFilterFunction = (param, field) => {
  if (typeof field === "undefined" || field === null) {
    if (param === "open_access") {
      return (d) => d.oa;
    }

    if (param === "publication") {
      return (d) => d.resulttype.includes("publication");
    }

    if (param === "dataset") {
      return (d) => d.resulttype.includes("dataset");
    }

    return () => true;
  }

  if (param === "all") {
    return () => true;
  }

  return (d) => {
    if (Array.isArray(d[field])) {
      return d[field].includes(param);
    }

    return d[field] === param;
  };
};

const SEARCHED_PROPS = [
  "title",
  "authors_string",
  "published_in",
  "year",
  "subject_orig",
  "tags",
  "comments_for_filtering",
  "resulttype",
  "paper_abstract",
];

/**
 * Creates a paper filtering function from the search words.
 *
 * @param {Array} searchedKeywords array of search keywords (plaintext strings)
 *
 * @returns {Function} filtering function that returns true if paper contains all the searched keywords
 */
const getWordFilterFunction = (searchedKeywords) => {
  return (paper) => {
    const paperKeywords = SEARCHED_PROPS.map((prop) =>
      getPropertyOrEmptyString(paper, prop)
    );

    if (paper.oa) {
      paperKeywords.push("open access");
      paperKeywords.push("pdf");
    }
    if (paper.free_access) {
      paperKeywords.push("free access");
    }

    const paperString = paperKeywords.join(" ");

    return !searchedKeywords.some((keyword) => !paperString.includes(keyword));
  };
};

const getPropertyOrEmptyString = (object, property) => {
  if (Object.prototype.hasOwnProperty.call(object, property)) {
    return object[property].toString().toLowerCase().trim();
  }

  return "";
};

/**
 * Sorts the input data according to the provided settings.
 * @param {Array} data input array that contains papers
 * @param {Object} sortSettings 'value' = name of the sort param
 *
 * @returns {Array} sorted data array
 */
export const sortData = (data, sortSettings) => {
  return data.sort(getParamSortFunction(sortSettings.value));
};

const getParamSortFunction = (field) => {
  if (field === "year") {
    return (a, b) => stringCompare(a[field], b[field], "desc");
  }

  if (
    field === "relevance" ||
    field === "citations" ||
    field === "readers" ||
    field === "tweets"
  ) {
    return (a, b) => stringCompare(a[field], b[field], "desc");
  }

  return (a, b) => stringCompare(a[field], b[field], "asc");
};

/**
 * Synchronously checks whether the file with given url exists.
 *
 * Function taken from legacy list.js
 *
 * @param {String} url
 *
 * @returns {Boolean} true if the file exists
 */
export const isFileAvailable = (url) => {
  var http = new XMLHttpRequest();
  http.open("HEAD", url, false);
  http.send();

  return http.status !== 404;
};

/**
 * Returns the paper's preview link.
 * @param {Object} paper
 *
 * @returns {String} the preview link url
 */
export const getPaperPreviewLink = (paper) => {
  if (paper.oa && paper.link !== "") {
    return null;
  }

  return paper.outlink;
};

/**
 * Returns the paper's pdf click handler.
 * @param {Object} paper
 * @param {Function} handlePDFClick
 *
 * @returns {Function} function that opens the pdf preview
 */
export const getPaperPDFClickHandler = (paper, handlePDFClick) => {
  if (
    paper.oa === false ||
    paper.resulttype.includes("dataset") ||
    paper.link === ""
  ) {
    return null;
  }

  return () => handlePDFClick(paper);
};

/**
 * Returns correct link respecting the configs and link types.
 *
 * @param {object} paper paper object
 * @param {object} config
 * @param {object} context
 *
 * @returns {object} link entry {address: string, isDoi: bool}
 */
export const getListLink = (paper, config, context) => {
  if (context.service === "gsheets") {
    let address = paper.url;
    if (typeof address !== "string" || address === "") {
      address = "n/a";
    }
    return { address, isDoi: false };
  }

  if (config.url_outlink) {
    return { address: paper.outlink, isDoi: false };
  }

  if (config.doi_outlink) {
    if (paper.doi) {
      return { address: paper.doi, isDoi: true };
    }

    if (paper.link) {
      return { address: paper.link, isDoi: false };
    }

    // fallback for PubMed
    if (paper.url) {
      return { address: paper.url, isDoi: false };
    }
  }

  return {};
};

/**
 * Parses the paper's authors string into an object array.
 *
 * @param {string} authors semicolon-separated authors
 *
 * @returns list of authors names and surnames
 */
export const extractAuthors = (authors) => {
  if (typeof authors !== "string") {
    return [];
  }

  return authors
    .split(";")
    .filter((a) => !!a)
    .map((a) => {
      const namesList = a.trim().split(",");
      const lastName = namesList[0].trim();
      if (namesList.length < 2) {
        return { lastName };
      }

      const firstName = namesList[1].trim();

      return { firstName, lastName };
    });
};

/**
 * Parses the paper's authors string into a string array.
 *
 * @param {string} authors semicolon-separated authors
 *
 * @returns list of authors names and surnames
 */
export const getAuthorsList = (authors, firstNameFirst = true) => {
  const authorObjects = extractAuthors(authors);
  return authorObjects.map((ao) => {
    const { firstName, lastName } = ao;
    if (!firstName) {
      return lastName;
    }

    if (firstNameFirst) {
      return `${firstName} ${lastName}`;
    }

    return `${lastName} ${firstName}`;
  });
};

/**
 * Sanitizes paper coordinate.
 *
 * Function migrated from the old code (io.js).
 *
 * @param {string} coordinate x or y coordinate
 * @param {number} decimalDigits number of decimals
 *
 * @returns sanitized coordinate
 */
export const parseCoordinate = (coordinate, decimalDigits) => {
  if (isNaN(parseFloat(coordinate))) {
    return parseFloat(0).toFixed(decimalDigits);
  }

  const fixedCoordinate = parseFloat(coordinate).toFixed(decimalDigits);
  if (fixedCoordinate === "-" + parseFloat(0).toFixed(decimalDigits)) {
    return parseFloat(0).toFixed(decimalDigits);
  }

  return fixedCoordinate;
};

/**
 * Determines whether the paper is open access.
 *
 * Function migrated from the old code (io.js).
 *
 * @param {object} paper
 * @param {object} config
 *
 * @returns true/false
 */
export const isOpenAccess = (paper, config) => {
  if (config.service === "pubmed") {
    return typeof paper.pmcid !== "undefined" && paper.pmcid !== "";
  }

  return parseInt(paper.oa_state) === 1;
};

/**
 * Returns paper's open access link.
 *
 * Function migrated from the old code (io.js).
 *
 * @param {object} paper
 * @param {object} config
 *
 * @returns oa link
 */
export const getOpenAccessLink = (paper, config) => {
  if (config.service === "pubmed") {
    if (typeof paper.pmcid !== "undefined" && paper.pmcid !== "") {
      return (
        "http://www.ncbi.nlm.nih.gov/pmc/articles/" + paper.pmcid + "/pdf/"
      );
    }

    return "";
  }

  return paper.link;
};

/**
 * Returns paper's outlink.
 *
 * Function migrated from the old code (io.js) - yeah it's shitty.
 *
 * @param {object} paper
 * @param {object} config
 *
 * @returns outlink
 */
export const getOutlink = (paper, config) => {
  if (config.service === "base") {
    return paper.oa_link;
  }

  if (config.service === "openaire" && paper.resulttype.includes("dataset")) {
    return config.url_prefix_datasets + paper.url;
  }

  if (config.url_prefix !== null) {
    return config.url_prefix + paper.url;
  }

  if (typeof paper.url !== "undefined") {
    return paper.url;
  }

  return "";
};

/**
 * Returns displayable metric value.
 *
 * Function migrated from the old code (io.js).
 *
 * @param {object} paper
 * @param {string} metric paper property name
 *
 * @returns metric value
 */
export const getVisibleMetric = (paper, metric) => {
  if (Object.prototype.hasOwnProperty.call(paper, metric)) {
    if (paper[metric] === "N/A") {
      return "n/a";
    }

    return +paper[metric];
  }
};

/**
 * Returns internal metric value.
 *
 * Function migrated from the old code (io.js).
 *
 * @param {object} paper
 * @param {string} metric paper property name
 *
 * @returns metric value
 */
export const getInternalMetric = (paper, metric) => {
  if (!paper[metric] || paper[metric].toString().toLowerCase() === "n/a") {
    return 0;
  }

  return +paper[metric];
};

/**
 * Validator function for paper.year property.
 *
 * @param {string} date validated date string
 * @returns {boolean}
 */
export const dateValidator = (date) => {
  if (date.match(/^\d{3,4}$/)) {
    return true;
  }
  if (date.match(/^\d{3,4}-\d{2}$/)) {
    return true;
  }
  if (date.match(/^\d{3,4}-\d{2}-\d{2}$/)) {
    return true;
  }
  if (date.match(/^\d{3,4}-\d{2}-\d{2}\w?\s*[-:\d]*\w?$/)) {
    return true;
  }

  return false;
};

/**
 * Validator function for paper.oa_state property.
 * @param {string | number} oaState paper.oa_state property
 * @returns {boolean}
 */
export const oaStateValidator = (oaState) =>
  [0, 1, 2, 3].includes(parseInt(oaState));

/**
 * Validator for string array.
 *
 * @param {[string]} list string array
 * @returns {boolean}
 */
export const stringArrayValidator = (list) => {
  if (!Array.isArray(list)) {
    return false;
  }

  return !list.map((e) => typeof e === "string").some((e) => !e);
};

/**
 * Sanitization function for resulttype property.
 *
 * @param {any} value paper.resulttype
 * @returns {[string]}
 */
export const resultTypeSanitizer = (value) => {
  if (typeof value === "string") {
    return [value];
  }

  return undefined;
};

const commentValidator = (e) =>
  typeof e.comment === "string" && (!e.author || typeof e.author === "string");

/**
 * Validator for comments array.
 *
 * @param {[object]} list comments array
 * @returns {boolean}
 */
export const commentArrayValidator = (list) => {
  if (!Array.isArray(list)) {
    return false;
  }

  return !list.map(commentValidator).some((e) => !e);
};

/**
 * Sanitization function for comments property.
 *
 * @param {any} value paper.comments
 * @returns {[object]}
 */
export const commentsSanitizer = (value) => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(commentValidator);
};

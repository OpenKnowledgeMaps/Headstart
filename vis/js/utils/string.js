import d3 from "d3";

/**
 * Sets first letter of the string to uppercase.
 * @param {String} s string to be capitalized
 */
export const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Compares two strings.
 *
 * @param {String} a first string
 * @param {String} b second string
 * @param {String} sort_order 'asc' or 'desc'
 *
 * @returns -1/0/1
 */
export const stringCompare = (a, b, sort_order) => {
  if (typeof a === "undefined" || typeof b === "undefined") {
    return;
  }

  if (typeof a === "string" && typeof b === "string") {
    if (a === "" || a === null) return 1;
    if (b === "" || b === null) return -1;

    if (sort_order === "desc") {
      let c = a;
      a = b;
      b = c;
    }

    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a === b) return 0;

    return a < b ? -1 : 1;
  }

  if (
    (typeof a === "string" && typeof b === "number") ||
    (typeof a === "number" && typeof b === "string")
  ) {
    if (a === "N/A" || a === "n/a" || typeof a !== "number") return 1;
    if (b === "N/A" || b === "n/a" || typeof b !== "number") return -1;
    if (a === b) return 0;

    if (sort_order === "desc") {
      return d3.descending(a, b);
    }

    return d3.ascending(a, b);
  }

  if (typeof a == "number" && typeof b == "number") {
    if (sort_order === "desc") {
      return d3.descending(a, b);
    }

    return d3.ascending(a, b);
  }

  if (sort_order === "desc") {
    return d3.descending(a, b);
  }

  return d3.ascending(a, b);
};

/**
 * Shortens the input string to selected length.
 * @param {String} string input to shorten
 * @param {Number} length output length
 * @param {String} end the ending if the string was shortened
 *
 * @returns shortened string
 */
export const shorten = (string, length, end = "...") => {
  if (string.length <= length) {
    return string;
  }

  return string.substr(0, length) + end;
};

export const formatString = (string, params) => {
  Object.keys(params).forEach((param) => {
    string = string.replaceAll("${" + param + "}", params[param]);
  });

  return string;
};

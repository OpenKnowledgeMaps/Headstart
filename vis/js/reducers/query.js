const query = (state = { text: "", parsedTerms: [] }, action) => {
  if (action.canceled) {
    return state;
  }

  switch (action.type) {
    case "INITIALIZE":
      return {
        text:
          typeof action.contextObject.query !== "undefined"
            ? action.contextObject.query
            : null,
        parsedTerms: getQueryTerms(action.contextObject),
        highlightTerms: action.configObject.highlight_query_terms,
      };
    default:
      return state;
  }
};

/**
 * Parses query and returns all its terms.
 * @param {Object} context must have property 'query'
 *
 * Function copied from io.js
 *
 * Then cleaned up and fixed.
 *
 * @returns {Array} array of terms (string)
 */
const getQueryTerms = (context) => {
  if (typeof context.query !== "string") {
    return [];
  }

  const originalQuery = context.query;

  // Replace terms within square brackets, as they denote fields in PubMed
  const fullQuery = originalQuery.replace(/\[(.*?)\]/g, "");

  // Get all phrases and remove quotes from results
  const phraseRegex = /\"(.*?)\"/g;
  let phraseArray = fullQuery.match(phraseRegex);
  if (phraseArray === null) {
    phraseArray = [];
  }

  // Replace backslashed quotes??
  // TODO test this one, it seems to be redundant
  phraseArray = phraseArray.map((x) => x.replace(/\\"|\"/g, ""));

  // Remove phrases, and, or, +, -, (, ) from query string
  const queryWtPhrases = fullQuery.replace(phraseRegex, " ");
  const cleanQuery = queryWtPhrases
    .replace(/\band\b|\bor\b|\(|\)/g, "")
    .replace(/(^|\s)-|\+/g, " ");

  phraseArray = phraseArray.concat(
    cleanQuery.trim().replace(/\s+/g, " ").split(" ")
  );

  // Remove backslashes, colons and empty words
  phraseArray = phraseArray.map((x) => x.replace(/[\\\:]/g, "")).filter((x) => x !== "");

  phraseArray = [...new Set(phraseArray)];

  return phraseArray;
};

export default query;

// @ts-nocheck
const q_advanced = (state = { text: "", parsedTerms: [] }, action: any) => {
    if (action.canceled) {
      return state;
    }
  
    switch (action.type) {
      case "INITIALIZE":
        return {
          text: cleanQuery(action.contextObject.params.q_advanced),
          parsedTerms: getQueryTerms(action.contextObject),
          highlightTerms: false,
          useLookBehind: isLookBehindSupported(),
        };
      default:
        return state;
    }
  };

  const cleanQuery = (query) => {
    if (typeof query !== "string") {
      return null;
    }
  
    const cleanedQuery = query.replace(/\\(.?)/g, "$1");
  
    return cleanedQuery;
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
  
    const cleanedQuery = context.query
      // Remove terms within square brackets, as they denote fields in PubMed
      .replace(/\[(.*?)\]/g, "")
      // Replace different types of quotes
      .replace(/[“”„]/g, '"');
  
    // Get all phrases and remove quotes from results
    const phraseRegex = /"(.*?)"/g;
    let phraseArray = cleanedQuery.match(phraseRegex);
    if (phraseArray === null) {
      phraseArray = [];
    }
  
    // Replace backslashed quotes??
    phraseArray = phraseArray.map((x) => x.replace(/\\"|"/g, ""));
  
    // Remove phrases, and, or, +, -, (, ) from query string
    const queryWtPhrases = cleanedQuery
      .replace(phraseRegex, " ")
      .replace(/\band\b|\bor\b|\(|\)/g, "")
      .replace(/(^|\s)-|\+/g, " ");
  
    phraseArray = phraseArray.concat(
      queryWtPhrases.trim().split(/\s+/)
    );
  
    // Remove backslashes, colons and empty words
    phraseArray = phraseArray
      .map((x) => x.replace(/[\\:]/g, ""))
      .filter((x) => x !== "");
  
    phraseArray = [...new Set(phraseArray)];
  
    return phraseArray;
  };
  
  /**
   * Regex lookbehind feature detection (used in the query
   * highlight component).
   *
   * Inspired by
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
   */
  const isLookBehindSupported = () => {
    try {
      new RegExp("(?<=)");
      return true;
    } catch (err) {
      return false;
    }
  };
  
  export default q_advanced;
  
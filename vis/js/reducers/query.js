const query = (state = { text: "", parsedTerms: [] }, action) => {
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
 * @returns {Array} array of terms (string)
 */
const getQueryTerms = (context) => {
  if (!context.hasOwnProperty("query")) {
    return [];
  }

  let original_query = context.query;

  //Replace terms within square brackets, as they denote fields in PubMed
  let full_query = original_query.replace(/\[(.*?)\]/g, "");

  //Get all phrases and remove inverted commas from results
  let match_query = /\"(.*?)\"/g;
  let term_array = full_query.match(match_query);
  if (term_array !== null)
    term_array = term_array.map(function (x) {
      return x.replace(/\\"|\"/g, "");
    });
  else term_array = [];

  //Remove phrases, and, or, +, -, (, ) from query string
  let query_wt_phrases = full_query.replace(match_query, " ");
  let query_wt_rest = query_wt_phrases
    .replace(/\band\b|\bor\b|\(|\)/g, "")
    .replace(/(^|\s)-|\+/g, " ");

  term_array = term_array.concat(
    query_wt_rest.trim().replace(/\s+/g, " ").split(" ")
  );

  term_array = [...new Set(term_array)];

  return term_array;
};

export default query;

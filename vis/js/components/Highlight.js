import React from "react";
import { connect } from "react-redux";
import ExternalHighlighter from "react-highlight-words";

import { parseSearchText } from "../utils/data";

// TODO optimize:
//  1. parseSearchText in store
//  2. hyphenated search and query terms in store

const Highlight = ({
  searchTerms,
  queryTerms,
  // global value taken from config
  queryHighlightEnabled,
  // local value specified for the particular element
  queryHighlight = false,
  // if true, adds &shy; into the search words
  hyphenated = false,
  useLookBehind,
  children: text,
}) => {
  let autoEscape = true;
  let searchWords = searchTerms;
  if (hyphenated) {
    autoEscape = false;
    searchWords = searchTerms.map((term) => hyphenateStringSafely(term));
  }

  if (searchTerms.length > 0) {
    return (
      <ExternalHighlighter
        highlightClassName="highlighted"
        searchWords={searchWords}
        textToHighlight={text}
        autoEscape={autoEscape}
        highlightTag="span"
      />
    );
  }

  if (!queryHighlightEnabled || !queryHighlight) {
    if (typeof text !== "string") {
      return null;
    }
    return text;
  }

  let queryWords = queryTerms.map((term) => escapeRegExp(term));
  if (hyphenated) {
    queryWords = queryTerms.map((term) => hyphenateStringSafely(term));
  }

  queryWords = queryWords.map((term) => getQueryTermMatcher(term, useLookBehind));

  return (
    <ExternalHighlighter
      highlightClassName="query_term_highlight"
      searchWords={queryWords}
      textToHighlight={text}
      autoEscape={false}
      highlightTag="span"
    />
  );
};

const mapStateToProps = (state) => ({
  searchTerms: parseSearchText(state.list.searchValue),
  queryTerms: state.query.parsedTerms,
  queryHighlightEnabled: state.query.highlightTerms,
  useLookBehind: state.query.useLookBehind,
});

export default connect(mapStateToProps)(Highlight);

// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const hyphenateStringSafely = (string) => {
  return string
    .split("")
    .map((char) => escapeRegExp(char))
    .join("[\\u00AD]*");
};

/**
 * Returns a regex expression for the query term.
 * 
 * The query term must match the word in the text exactly. Supported boundaries
 * are whitespace, period, comma, question mark, exclamation mark, hyphen, 
 * slash and brackets.
 * 
 * The boundary must not be a soft hyphen (that's why we cannot simply use \b).
 * 
 * @param {string} term the term to be matched
 * @param {boolean} useLookBehind use ?<= if true, else use \b
 */
export const getQueryTermMatcher = (term, useLookBehind) => {
  // this should theoretically work but it does not: [^\w\u00AD]
  // this is used instead:
  const wordBreakers = "[-\\s.,:?!/()[\\]{}]";
  let lookBehind = `(?<=${wordBreakers}|^)`;
  if (!useLookBehind) {
    lookBehind = "\\b";
  }
  return new RegExp(`${lookBehind}(${term})(?=${wordBreakers}|$)`, "gi");
};

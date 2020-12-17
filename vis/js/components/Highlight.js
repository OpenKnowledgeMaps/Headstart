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
  children: text,
}) => {
  let autoEscape = true;
  let searchWords = searchTerms;
  let queryWords = queryTerms;
  if (hyphenated) {
    autoEscape = false;
    searchWords = searchTerms.map((term) =>
      term
        .split("")
        .map((char) => escapeRegExp(char))
        .join("[\\u00AD]*")
    );
    queryWords = queryTerms.map((term) =>
      term
        .split("")
        .map((char) => escapeRegExp(char))
        .join("[\\u00AD]*")
    );
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
    return text;
  }

  return (
    <ExternalHighlighter
      highlightClassName="query_term_highlight"
      searchWords={queryWords}
      textToHighlight={text}
      autoEscape={autoEscape}
      highlightTag="span"
    />
  );
};

const mapStateToProps = (state) => ({
  searchTerms: parseSearchText(state.list.searchValue),
  queryTerms: state.query.parsedTerms,
  queryHighlightEnabled: state.query.highlightTerms,
});

export default connect(mapStateToProps)(Highlight);

// https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

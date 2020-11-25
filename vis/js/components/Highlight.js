import React from "react";
import { connect } from "react-redux";
import ExternalHighlighter from "react-highlight-words";

import { parseSearchText } from "../utils/data";

const Highlight = ({
  searchTerms,
  queryTerms,
  // global value taken from config
  queryHighlightEnabled,
  // local value specified for the particular element
  queryHighlight = false,
  children: text,
}) => {
  if (searchTerms.length > 0) {
    return (
      <ExternalHighlighter
        highlightClassName="highlighted"
        searchWords={searchTerms}
        textToHighlight={text}
        autoEscape={true}
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
      searchWords={queryTerms}
      textToHighlight={text}
      autoEscape={true}
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

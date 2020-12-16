import React from "react";
import { connect } from "react-redux";

import "hypher";
import "lib/en.js";
import "lib/de.js";

import shave from "shave";
import { select } from "d3-selection";

import { parseSearchText } from "../utils/data";

/**
 * This component renders the area title and then applies some additional
 * effects on it:
 *  - hyphenation
 *  - text truncating (shave)
 *  - highlighting
 *
 * These three effect cannot be done together in a pure React way because of
 * some constraints on them. That's why we decided to use d3 and jQuery to
 * recreate them.
 */
class BubbleTitle extends React.Component {
  constructor(props) {
    super(props);

    this.hyphenate = this.hyphenate.bind(this);
    this.shorten = this.shorten.bind(this);
    this.highlight = this.highlight.bind(this);
    this.runAllFeatures = this.runAllFeatures.bind(this);

    this.titleRef = null;
  }

  componentDidMount() {
    this.runAllFeatures();
  }

  componentDidUpdate() {
    this.runAllFeatures();
  }

  render() {
    const { children: title } = this.props;

    return (
      <h2 style={{ fontSize: 14 }} ref={(el) => (this.titleRef = el)}>
        {title}
      </h2>
    );
  }

  runAllFeatures() {
    window.requestAnimationFrame(() => {
      this.hyphenate();
      this.shorten();
      this.highlight();
    });
  }

  hyphenate() {
    $(this.titleRef).hyphenate(this.props.hyphenationLang);
  }

  shorten() {
    const marginTop = this.titleRef
      ? parseInt(select(this.titleRef).style("margin-top"), 10)
      : 0;
    const marginBottom = this.titleRef
      ? parseInt(select(this.titleRef).style("margin-bottom"), 10)
      : 0;
    const maxHeight = this.props.height - marginTop - marginBottom;

    shave(this.titleRef, maxHeight);
  }

  highlight() {
    const { searchTerms } = this.props;
    const searchWords = searchTerms.map((term) =>
      term.split("").join("[\\u00AD]*")
    );

    $(this.titleRef).unmark();

    searchWords.forEach((word) => {
      const expr = new RegExp(word, "i");

      $(this.titleRef).markRegExp(expr, {
        element: "span",
        className: "highlighted",
      });
    });
  }
}

const mapStateToProps = (state) => ({
  searchTerms: parseSearchText(state.list.searchValue),
  hyphenationLang: state.hyphenationLang,
});

export default connect(mapStateToProps)(BubbleTitle);

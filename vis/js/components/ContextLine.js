import React from "react";
import { connect } from "react-redux";

import ContextLineTemplate from "../templates/ContextLine";
import Popover from "../templates/contextfeatures/Popover";
import localization from "../reducers/localization";
import Author from "../templates/contextfeatures/Author";

export const ContextLine = ({ hidden, contextLineParams, localization }) => {
  if (hidden) {
    return null;
  }

  return (
    <ContextLineTemplate
      articlesCount={contextLineParams.articlesCount}
      articlesCountLabel={localization.articles_label}
      modifier={renderModifier(contextLineParams, localization)}
      openAccessArticlesCount={contextLineParams.openAccessCount}
      author={renderAuthor(contextLineParams, localization)}
    />
  );
};

const mapStateToProps = (state) => ({
  hidden: state.zoom,
  contextLineParams: state.contextLine,
  localization: state.localization,
});

const renderModifier = ({ modifier, showModifierPopover }, localization) => {
  let label = "";

  if (modifier === "most-recent") {
    label = localization.most_recent_label;
  }

  if (modifier === "most-relevant") {
    label = localization.most_relevant_label;
  }

  if (showModifierPopover) {
    return <Popover label={label} text={localization.most_relevant_tooltip} />;
  }

  return (
    <span id="modifier" className="modifier">
      {label}
    </span>
  );
};

const renderAuthor = ({ showAuthor, author }, localization) => {
  if (!showAuthor) {
    return null;
  }

  return (
    <Author
      bioLabel={localization.bio_link}
      livingDates={author.livingDates}
      link={"https://d-nb.info/gnd/" + author.id}
    />
  );
};

export default connect(mapStateToProps)(ContextLine);

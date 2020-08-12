import React from "react";
import { connect } from "react-redux";

import ContextLineTemplate from "../templates/ContextLine";
import Popover from "../templates/contextfeatures/Popover";
import Author from "../templates/contextfeatures/Author";

import DocumentTypesSimple from "../templates/contextfeatures/DocumentTypesSimple";
import DocumentTypesPopover from "../templates/contextfeatures/DocumentTypesPopover";

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
      docTypes={renderDocTypes(contextLineParams, localization)}
      dataSource={contextLineParams.dataSource}
      dataSourceLabel={localization.source_label}
      timespan={contextLineParams.timespan}
      paperCount={contextLineParams.paperCount}
      paperCountLabel={localization.paper_count_label}
      datasetCount={contextLineParams.datasetCount}
      datasetCountLabel={localization.dataset_count_label}
      funder={contextLineParams.funder}
      projectRuntime={contextLineParams.projectRuntime}
      searchLang={contextLineParams.searchLanguage}
      timestamp={contextLineParams.timestamp}
      timestampLabel={localization.timestamp_label}
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

const renderDocTypes = ({documentTypes}, localization) => {
  if (!documentTypes || documentTypes.length === 0) {
    return null;
  }

  const text = documentTypes.join(", ");

  if (documentTypes.length === 1) {
    return <DocumentTypesSimple label={localization.documenttypes_label} text={text} />
  }

  return <DocumentTypesPopover label={localization.documenttypes_label} popoverLabel={localization.documenttypes_tooltip} text={text} />
};

export default connect(mapStateToProps)(ContextLine);
import React from "react";
import { connect } from "react-redux";

import ZoomedInHeadingTemplate from "../templates/ZoomedInHeading";
import ZoomedOutHeadingTemplate from "../templates/ZoomedOutHeading";

import {
  BasicTitle,
  ProjectTitle,
  CustomTitle,
  StandardTitle,
} from "../templates/headingtitles";

import { STREAMGRAPH_MODE } from "../reducers/chartType";

const Heading = ({
  localization,
  zoomed,
  query,
  bubbleTitle,
  headingParams,
  streamgraph,
}) => {
  if (zoomed) {
    let label = streamgraph ? localization.area_streamgraph : localization.area;

    return <ZoomedInHeadingTemplate label={label} title={bubbleTitle} />;
  }

  return (
    <ZoomedOutHeadingTemplate>
      {renderTitle(localization, query, headingParams)}
    </ZoomedOutHeadingTemplate>
  );
};

const mapStateToProps = (state) => ({
  localization: state.localization,
  zoomed: state.zoom,
  query: state.query.text,
  bubbleTitle: state.selectedBubble ? state.selectedBubble.title : null,
  headingParams: state.heading,
  streamgraph: state.chartType === STREAMGRAPH_MODE,
});

export default connect(mapStateToProps)(Heading);

// This should probably make its way to a more global config
const MAX_LENGTH_VIPER = 47;
const MAX_LENGTH_LINKEDCAT = 115;
const MAX_LENGTH_CUSTOM = 100;

/**
 * Renders the title for the correct setup.
 */
const renderTitle = (localization, query, headingParams) => {
  if (headingParams.presetTitle) {
    return <BasicTitle title={headingParams.presetTitle} />;
  }

  let label = getHeadingLabel(headingParams.titleLabelType, localization);

  if (headingParams.titleStyle) {
    if (headingParams.titleStyle === "viper") {
      return renderViperTitle(
        headingParams.title,
        headingParams.acronym,
        headingParams.projectId
      );
    }

    if (headingParams.titleStyle === "linkedcat") {
      return renderLinkedCatTitle(label, query);
    }

    if (
      headingParams.titleStyle === "custom" &&
      typeof headingParams.customTitle !== "undefined" &&
      headingParams.customTitle !== null
    ) {
      return renderCustomTitle(
        headingParams.customTitle,
        label,
        query,
        localization
      );
    }

    return <StandardTitle label={label} title={query} />;
  }

  return <BasicTitle title={localization.default_title} />;
};

const renderViperTitle = (title, acronym, projectId) => {
  let titleText = title;
  if (typeof acronym === "string" && acronym !== "") {
    titleText = acronym + " - " + title;
  }
  let shortTitleText = sliceText(titleText, MAX_LENGTH_VIPER);

  return (
    <ProjectTitle
      fullTitle={titleText}
      shortTitle={shortTitleText}
      projectId={projectId}
    />
  );
};

const renderLinkedCatTitle = (label, query) => {
  let shortTitle = sliceText(query, MAX_LENGTH_LINKEDCAT);
  return <StandardTitle label={label} title={query} shortTitle={shortTitle} />;
};

const renderCustomTitle = (title, label, query, localization) => {
  let shortTitle = sliceText(title, MAX_LENGTH_CUSTOM);
  // this is necessary, because the custom title is already escaped
  shortTitle = unescapeHTML(shortTitle);
  return (
    <CustomTitle
      label={label}
      title={shortTitle}
      query={query}
      explanation={localization.custom_title_explanation}
    />
  );
};

/**
 * Refactored helper function for shortening text that's too long.
 * @param {String} text
 * @param {Number} maxLength
 */
const sliceText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Refactored helper function for getting the heading label.
 */
export const getHeadingLabel = (labelType, localization) => {
  switch (labelType) {
    case "authorview-streamgraph":
      return localization.streamgraph_authors_label;
    case "authorview-knowledgemap":
      return localization.overview_authors_label;
    case "keywordview-streamgraph":
      return localization.streamgraph_label;
    case "keywordview-knowledgemap":
      return localization.overview_label;
    default:
      throw new Error(`Label of type '${labelType}' not supported.`);
  }
};

const unescapeHTML = (string) => {
  let entityMap = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#34;": '"',
    "&#39;": "'",
    "&#x2F;": "/",
    "&#x60;": "`",
    "&#x3D;": "=",
  };

  return String(string).replace(
    /(&amp;|&lt;|&gt;|&quot;|&#34;|&#39;|&#x2F;|&#x60;|&#x3D;)/g,
    function (s) {
      return entityMap[s];
    }
  );
};

import React from "react";
import { connect } from "react-redux";

import ZoomedInHeadingTemplate from "../templates/ZoomedInHeading";
import ZoomedOutHeadingTemplate from "../templates/ZoomedOutHeading";

import { changeFile } from "../actions/index";

import {
  BasicTitle,
  ViperTitle,
  LinkedCatTitle,
  CustomTitle,
  StandardTitle,
} from "../templates/headingtitles";

const Heading = ({
  localization,
  zoomed,
  query,
  bubbleTitle,
  headingParams,
  files,
  onFileChange,
  streamgraph,
}) => {
  // IMPORTANT: the show_infolink_areas functionality is not implemented here
  if (zoomed) {
    let label = streamgraph ? localization.area_streamgraph : localization.area;

    return <ZoomedInHeadingTemplate label={label} title={bubbleTitle} />;
  }

  return (
    <ZoomedOutHeadingTemplate
      introIcon={localization.intro_icon}
      introLabel={localization.intro_label}
      additionalFeatures={renderAdditionalFeatures(
        headingParams,
        files,
        onFileChange
      )}
    >
      {renderTitle(localization, query, headingParams)}
    </ZoomedOutHeadingTemplate>
  );
};

const mapStateToProps = (state) => ({
  localization: state.localization,
  zoomed: state.zoom,
  query: state.query,
  bubbleTitle: state.selectedBubble ? state.selectedBubble.title : null,
  headingParams: state.heading,
  files: state.files,
  streamgraph: state.chartType === "streamgraph",
});

const mapDispatchToProps = (dispatch) => ({
  onFileChange: (fileIndex) => dispatch(changeFile(fileIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Heading);

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

    let cleanQuery = query.replace(/\\(.?)/g, "$1");

    if (headingParams.titleStyle === "linkedcat") {
      return renderLinkedCatTitle(label, cleanQuery);
    }

    if (
      headingParams.titleStyle === "custom" &&
      typeof headingParams.customTitle !== "undefined" &&
      headingParams.customTitle !== null
    ) {
      return renderCustomTitle(
        headingParams.customTitle,
        label,
        cleanQuery,
        localization
      );
    }

    return <StandardTitle label={label} title={cleanQuery} />;
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
    <ViperTitle
      fullTitle={titleText}
      shortTitle={shortTitleText}
      projectId={projectId}
    />
  );
};

const renderLinkedCatTitle = (label, cleanQuery) => {
  let shortTitle = sliceText(cleanQuery, MAX_LENGTH_LINKEDCAT);
  return (
    <LinkedCatTitle
      label={label}
      fullTitle={cleanQuery}
      shortTitle={shortTitle}
    />
  );
};

const renderCustomTitle = (title, label, cleanQuery, localization) => {
  let shortTitle = sliceText(title, MAX_LENGTH_CUSTOM);
  // this is necessary, because the custom title is already escaped
  shortTitle = unescapeHTML(shortTitle);
  return (
    <CustomTitle
      label={label}
      title={shortTitle}
      query={cleanQuery}
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
  
  return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#34;|&#39;|&#x2F;|&#x60;|&#x3D;)/g, function (s) {
    return entityMap[s];
  });
};

const renderAdditionalFeatures = ({ showDropdown }, files, onFileChange) => {
  // IMPORTANT: the show_multiples functionality is not implemented here

  if (showDropdown && files.list.length > 0) {
    const handleChange = (e) => {
      console.warn("*** React component 'Heading' dropdown changed ***");
      onFileChange(parseInt(e.target.value));
    };

    return (
      <>
        {" "}
        Select dataset:{" "}
        <select id="datasets" value={files.current} onChange={handleChange}>
          {files.list.map((entry, index) => (
            <option key={entry.file} value={index}>
              {entry.title}
            </option>
          ))}
        </select>
      </>
    );
  }

  return null;
};

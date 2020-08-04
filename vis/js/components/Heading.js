import React from "react";
import { connect } from "react-redux";

import ZoomedInHeadingTemplate from "../templates/ZoomedInHeading";
import ZoomedOutHeadingTemplate from "../templates/ZoomedOutHeading";

import {
  BasicTitle,
  ViperTitle,
  LinkedCatTitle,
  CustomTitle,
  StandardTitle,
} from "../templates/headingtitles";

const Heading = ({
  config,
  zoomed,
  bubbleTitle,
  mainTitle,
  acronym,
  projectId,
  query,
}) => {
  // IMPORTANT: the show_infolink_areas functionality is not implemented here
  if (zoomed) {
    return (
      <ZoomedInHeadingTemplate
        label={config.localization[config.language].area}
        title={bubbleTitle}
      />
    );
  }

  return (
    <ZoomedOutHeadingTemplate
      introIcon={config.localization[config.language].intro_icon}
      introLabel={config.localization[config.language].intro_label}
      additionalFeatures={renderAdditionalFeatures(config)}
    >
      {renderTitle(config, mainTitle, acronym, projectId, query)}
    </ZoomedOutHeadingTemplate>
  );
};

const mapStateToProps = (state) => ({
  config: state.config,
  zoomed: state.zoom,
  bubbleTitle: state.selectedBubble ? state.selectedBubble.title : null,
  mainTitle: state.context ? state.context.params.title : null,
  acronym: state.context ? state.context.params.acronym : null,
  projectId: state.context ? state.context.params.project_id : null,
  query: state.context ? state.context.query : null,
});

export default connect(mapStateToProps)(Heading);

// This should probably make its way to a more global config
const MAX_LENGTH_VIPER = 47;
const MAX_LENGTH_LINKEDCAT = 115;
const MAX_LENGTH_CUSTOM = 100;

/**
 * Renders the title for the correct setup.
 */
const renderTitle = (config, title, acronym, projectId, query) => {
  if (config.title) {
    return <BasicTitle title={config.title} />;
  }

  let label = getHeadingLabel(config);

  if (config.create_title_from_context_style === "viper") {
    return renderViperTitle(title, acronym, projectId);
  }

  if (config.create_title_from_context) {
    let cleanQuery = escapeHTML(query.replace(/\\(.?)/g, "$1"));

    if (config.create_title_from_context_style === "linkedcat") {
      return renderLinkedCatTitle(label, cleanQuery);
    }

    if (
      config.create_title_from_context_style === "custom" &&
      typeof config.custom_title !== "undefined" &&
      config.custom_title !== null
    ) {
      return renderCustomTitle(config, label, cleanQuery);
    }

    return <StandardTitle label={label} title={cleanQuery} />;
  }

  return (
    <BasicTitle title={config.localization[config.language].default_title} />
  );
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

const renderCustomTitle = (config, label, cleanQuery) => {
  let shortTitle = sliceText(config.custom_title, MAX_LENGTH_CUSTOM);
  return (
    <CustomTitle
      label={label}
      title={shortTitle}
      query={cleanQuery}
      explanation={
        config.localization[config.language].custom_title_explanation
      }
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
const getHeadingLabel = (config) => {
  if (config.is_authorview && config.is_streamgraph) {
    return config.localization[config.language].streamgraph_authors_label;
  }

  if (config.is_authorview && !config.is_streamgraph) {
    return config.localization[config.language].overview_authors_label;
  }

  if (config.is_streamgraph) {
    return config.localization[config.language].streamgraph_label;
  }

  return config.localization[config.language].overview_label;
};

const escapeHTML = (string) => {
  let entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return String(string).replace(/[&<>"'`=/]/g, function (s) {
    return entityMap[s];
  });
};

const renderAdditionalFeatures = (config) => {
  // IMPORTANT: the show_multiples functionality is not implemented here

  if (config.show_dropdown) {
    // TODO
    /*
      $("#datasets").val(mediator.current_bubble.file);

      $("#datasets").change(function () {
          let selected_file_number = this.selectedIndex;
          if (selected_file_number !== mediator.current_file_number) {
              window.headstartInstance.tofile(selected_file_number);
          }
      });
      */

    return (
      <>
        {" "}
        Select dataset:{" "}
        <select id="datasets">
          {config.files.map((entry) => (
            <option key={entry.file} value={entry.file}>
              {entry.title}
            </option>
          ))}
        </select>
      </>
    );
  }

  return null;
};

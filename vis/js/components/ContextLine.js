import React from "react";
import { connect } from "react-redux";

import ContextLineTemplate from "../templates/ContextLine";
import HoverPopover from "./HoverPopover";
import Author from "../templates/contextfeatures/Author";

import DocumentTypesSimple from "../templates/contextfeatures/DocumentTypesSimple";
import DocumentTypesPopover from "../templates/contextfeatures/DocumentTypesPopover";
import NumArticles from "../templates/contextfeatures/NumArticles";
import DataSource from "../templates/contextfeatures/DataSource";
import Timespan from "../templates/contextfeatures/Timespan";
import PaperCount from "../templates/contextfeatures/PaperCount";
import DatasetCount from "../templates/contextfeatures/DatasetCount";
import Funder from "../templates/contextfeatures/Funder";
import ProjectRuntime from "../templates/contextfeatures/ProjectRuntime";
import SearchLang from "../templates/contextfeatures/SearchLang";
import Timestamp from "../templates/contextfeatures/Timestamp";

const defined = (param) => param !== undefined && param !== null;

/**
 * Component that creates the heading contextline.
 *
 * It has to be a class component because of the popovers (they use 'this').
 */
class ContextLine extends React.Component {
  render() {
    const { params, localization, hidden } = this.props;

    if (hidden) {
      return null;
    }

    return (
      // TODO this <p> can be moved into the template when whole MVP is refactored
      // then a different container for the popovers can be chosen
      <ContextLineTemplate>
        {params.showAuthor && (
          <Author
            bioLabel={localization.bio_link}
            livingDates={params.author.livingDates}
            link={"https://d-nb.info/gnd/" + params.author.id}
          />
        )}
        <NumArticles
          articlesCount={params.articlesCount}
          openAccessArticlesCount={params.openAccessCount}
          articlesCountLabel={localization.articles_label}
        >
          {this.renderModifier()}
        </NumArticles>
        {defined(params.dataSource) && (
          <DataSource
            value={params.dataSource}
            label={localization.source_label}
          />
        )}
        {defined(params.timespan) && <Timespan>{params.timespan}</Timespan>}
        {this.renderDocTypes()}
        {defined(params.paperCount) && (
          <PaperCount
            value={params.paperCount}
            label={localization.paper_count_label}
          />
        )}
        {defined(params.datasetCount) && (
          <DatasetCount
            value={params.datasetCount}
            label={localization.dataset_count_label}
          />
        )}
        {defined(params.funder) && <Funder>{params.funder}</Funder>}
        {defined(params.projectRuntime) && (
          <ProjectRuntime>{params.projectRuntime}</ProjectRuntime>
        )}
        {defined(params.searchLanguage) && (
          <SearchLang>{params.searchLanguage}</SearchLang>
        )}
        {defined(params.timestamp) && (
          <Timestamp
            value={params.timestamp}
            label={localization.timestamp_label}
          />
        )}
      </ContextLineTemplate>
    );
  }

  renderModifier() {
    const {
      params: { modifier, showModifierPopover },
      localization,
      popoverContainer,
    } = this.props;

    let label = "";

    if (modifier === "most-recent") {
      label = localization.most_recent_label;
    }

    if (modifier === "most-relevant") {
      label = localization.most_relevant_label;
    }

    if (showModifierPopover && label !== "") {
      return (
        <>
          <HoverPopover
            id="modifier-popover"
            container={popoverContainer}
            content={localization.most_relevant_tooltip}
          >
            <span id="modifier" className="modifier context_moreinfo">
              {label}
            </span>
          </HoverPopover>{" "}
        </>
      );
    }

    return (
      <>
        <span id="modifier" className="modifier">
          {label}
        </span>{" "}
      </>
    );
  }

  renderDocTypes() {
    const {
      params: { documentTypes },
      localization,
      popoverContainer,
    } = this.props;

    if (!documentTypes || documentTypes.length === 0) {
      return null;
    }

    const text = documentTypes.join(", ");

    if (documentTypes.length === 1) {
      return (
        <DocumentTypesSimple
          label={localization.documenttypes_label}
          text={text}
        />
      );
    }

    return (
      <>
        <span id="document_types" className="context_item">
          <HoverPopover
            id="doctypes-popover"
            container={popoverContainer}
            content={
              <>
                {localization.documenttypes_tooltip}
                <br />
                <br />
                {text}
              </>
            }
          >
            <DocumentTypesPopover label={localization.documenttypes_label} />
          </HoverPopover>
        </span>{" "}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  hidden: state.zoom || !state.contextLine.show,
  params: state.contextLine,
  localization: state.localization,
});

export default connect(mapStateToProps)(ContextLine);

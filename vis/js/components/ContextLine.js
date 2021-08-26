import React from "react";
import { connect } from "react-redux";

import ContextLineTemplate from "../templates/ContextLine";
import HoverPopover from "../templates/HoverPopover";
import Author from "../templates/contextfeatures/Author";
import DocumentTypes from "../templates/contextfeatures/DocumentTypes";
import NumArticles from "../templates/contextfeatures/NumArticles";
import DataSource from "../templates/contextfeatures/DataSource";
import Timespan from "../templates/contextfeatures/Timespan";
import PaperCount from "../templates/contextfeatures/PaperCount";
import DatasetCount from "../templates/contextfeatures/DatasetCount";
import Funder from "../templates/contextfeatures/Funder";
import ProjectRuntime from "../templates/contextfeatures/ProjectRuntime";
import LegacySearchLang from "../templates/contextfeatures/LegacySearchLang";
import SearchLang from "../templates/contextfeatures/SearchLang";
import Timestamp from "../templates/contextfeatures/Timestamp";
import MetadataQuality from "../templates/contextfeatures/MetadataQuality";
import Modifier from "../templates/contextfeatures/Modifier";

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
          <Modifier popoverContainer={this.props.popoverContainer} />
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
        {defined(params.legacySearchLanguage) && (
          <LegacySearchLang>{params.legacySearchLanguage}</LegacySearchLang>
        )}
        {defined(params.timestamp) && (
          <Timestamp
            value={params.timestamp}
            label={localization.timestamp_label}
          />
        )}
        {this.renderMetadataQuality()}
        {defined(params.searchLanguage) && (
          <SearchLang>{params.searchLanguage}</SearchLang>
        )}
      </ContextLineTemplate>
    );
  }

  // TODO refactor this function to a standalone template
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
            <DocumentTypes label={localization.documenttypes_label} />
          </HoverPopover>
        </span>{" "}
      </>
    );
  }

  // TODO refactor this function to a standalone template
  renderMetadataQuality() {
    const {
      params: { metadataQuality },
      localization,
      popoverContainer,
      service,
    } = this.props;

    if (
      !metadataQuality ||
      (metadataQuality !== "low" && metadataQuality !== "high")
    ) {
      return null;
    }

    return (
      <span className="context_item" id="metadata_quality">
        <HoverPopover
          id="metadata-quality-popover"
          container={popoverContainer}
          content={
            localization[metadataQuality + "_metadata_quality_desc_" + service]
          }
        >
          <MetadataQuality
            quality={metadataQuality}
            label={localization[[metadataQuality + "_metadata_quality"]]}
          />
        </HoverPopover>
      </span>
    );
  }
}

const mapStateToProps = (state) => ({
  hidden: state.zoom || !state.contextLine.show,
  params: state.contextLine,
  service: state.service,
  localization: state.localization,
});

export default connect(mapStateToProps)(ContextLine);

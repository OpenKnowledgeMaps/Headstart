import React from "react";
import { connect } from "react-redux";

import ContextLineTemplate from "../templates/ContextLine";
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
import Modifier from "../templates/contextfeatures/Modifier";
import MoreInfoLink from "../templates/contextfeatures/MoreInfoLink";
import MetadataQuality from "../templates/contextfeatures/MetadataQuality";
import ContextTimeFrame from "../templates/contextfeatures/ContextTimeFrame";
import DocumentLang from "../templates/contextfeatures/DocumentLang";
import ResearcherMetricsInfo from "../templates/contextfeatures/ResearcherMetricsInfo";
import { Employment } from "./Employment";
import ResearcherInfo from "../templates/contextfeatures/ResearcherInfo";

const defined = (param) => param !== undefined && param !== null;

/**
 * Component that creates the heading contextline.
 *
 * It has to be a class component because of the popovers (they use 'this').
 */
export const ContextLine = (props) => {
    const { author, params, localization, hidden, service } = props;
    const { popoverContainer, showLanguage } = props;

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
            author={author}
          />
        )}
        <NumArticles
          articlesCount={params.articlesCount}
          openAccessArticlesCount={params.openAccessCount}
          articlesCountLabel={localization.articles_label}
          service={service}
        >
          <Modifier popoverContainer={popoverContainer} />
        </NumArticles>
        <Employment author={author} />
        {defined(params.dataSource) && (
          <DataSource
            label={localization.source_label}
            source={params.dataSource}
            contentProvider={params.contentProvider}
            popoverContainer={props.popoverContainer}
          />
        )}
        {defined(params.timespan) && (
          <Timespan>
            <ContextTimeFrame
              popoverContainer={popoverContainer}
              timespan={params.timespan}
            />
          </Timespan>
        )}
        <DocumentTypes
          documentTypes={params.documentTypes}
          popoverContainer={popoverContainer}
        />
        {/* was an issue to left "All Languages" as default value in the context if no lang_id in parameters */}
        <DocumentLang
          value={params.documentLang}
          popoverContainer={popoverContainer}
        />
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
        <MetadataQuality
          quality={params.metadataQuality}
          service={service}
          popoverContainer={popoverContainer}
        />
        {showLanguage && defined(params.searchLanguage)  && (
          <SearchLang>{params.searchLanguage}</SearchLang>
        )}
        <ResearcherInfo />
        <ResearcherMetricsInfo />
        <MoreInfoLink />
      </ContextLineTemplate>
    );
}

const mapStateToProps = (state) => ({
  showLanguage: state.config.showLanguage,
  hidden: state.zoom || !state.contextLine.show,
  params: {
    ...state.contextLine,
    timespan: state.timespan,
  },
  service: state.service,
  localization: state.localization,
  author: state.author,
});

export default connect(mapStateToProps)(ContextLine);

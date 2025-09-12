import React, { ReactNode } from "react";
import { connect } from "react-redux";
import { isDefined } from "../utils/isDefined";
import { ContextLineTemplate } from "../templates/ContextLine";
import { Author } from "../templates/contextfeatures/Author";
import DocumentTypes from "../templates/contextfeatures/DocumentTypes";
import { NumArticles } from "../templates/contextfeatures/NumArticles";
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
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import { Author as AuthorType } from "../types/models/author";
import { Localization } from "../i18n/localization";

interface ContextLineProps {
  author: AuthorType;
  params: {
    showLanguage: boolean;
    show_h_index: boolean;
    show: boolean;
    articlesCount: number;
    modifier: string;
    modifierLimit: number;
    openAccessCount: number;
    showDataSource: boolean;
    showAuthor: boolean;
    author: {
      id?: string;
      livingDates?: string;
      imageLink?: string;
    };
    documentTypes: string[];
    dataSource: string;
    paperCount: null | number;
    datasetCount: null | string;
    funder: null | string;
    projectRuntime: null | string;
    legacySearchLanguage: null | string;
    searchLanguage: null | string;
    timestamp: null | string;
    metadataQuality: "high" | "low";
    documentLang: string[];
    excludeDateFilters: null | string[];
    service: string;
    timespan: string;
    contentProvider?: string;
    isStreamgraph: false;
  };
  dispatch: any;
  hidden: boolean;
  isResearcherDetailsEnabled?: boolean;
  isResearcherMetricsEnabled?: boolean;
  localization: Localization;
  popoverContainer: ReactNode;
  service: "base" | "pubmed";
  showDataSource: boolean;
  showLanguage: boolean;
}

/**
 * Component that creates the heading contextline.
 *
 * It has to be a class component because of the popovers (they use 'this').
 */
export const ContextLine = (props: ContextLineProps) => {
  const { popoverContainer, showLanguage } = props;
  const {
    author,
    params,
    localization,
    hidden,
    service,
    showDataSource,
    isResearcherDetailsEnabled,
    isResearcherMetricsEnabled,
  } = props;

  if (hidden) {
    return null;
  }

  return (
    <ContextLineTemplate>
      {params.showAuthor && (
        <Author
          bioLabel={localization.bio_link}
          livingDates={params.author.livingDates}
        />
      )}
      <NumArticles
        articlesCount={params.articlesCount}
        openAccessArticlesCount={params.openAccessCount}
        articlesCountLabel={localization.articles_label}
        service={service}
        modifierLimit={params.modifierLimit}
        isStreamgraph={params.isStreamgraph}
      >
        <Modifier popoverContainer={popoverContainer} />
      </NumArticles>
      <Employment author={author} popoverContainer={popoverContainer} />
      {showDataSource && isDefined(params.dataSource) && (
        <DataSource
          label={localization.source_label}
          source={params.dataSource}
          contentProvider={params.contentProvider}
          popoverContainer={props.popoverContainer}
        />
      )}
      {isDefined(params.timespan) && (
        <Timespan>
          <ContextTimeFrame
            popoverContainer={popoverContainer}
            time={params.timespan}
          />
        </Timespan>
      )}
      {isDefined(params.documentTypes) && (
        <DocumentTypes
          documentTypes={params.documentTypes}
          popoverContainer={popoverContainer}
        />
      )}
      {/* was an issue to left "All Languages" as default value in the context if no lang_id in parameters */}
      {showLanguage && (
        <DocumentLang
          value={params.documentLang}
          popoverContainer={popoverContainer}
        />
      )}
      {isDefined(params.paperCount) && (
        <PaperCount
          value={params.paperCount}
          label={localization.paper_count_label}
        />
      )}
      {isDefined(params.datasetCount) && (
        <DatasetCount
          value={params.datasetCount}
          label={localization.dataset_count_label}
        />
      )}
      {isDefined(params.funder) && <Funder>{params.funder}</Funder>}
      {isDefined(params.projectRuntime) && (
        <ProjectRuntime>{params.projectRuntime}</ProjectRuntime>
      )}
      {isDefined(params.legacySearchLanguage) && (
        <LegacySearchLang>{params.legacySearchLanguage}</LegacySearchLang>
      )}
      {isDefined(params.timestamp) && <Timestamp>{params.timestamp}</Timestamp>}
      <MetadataQuality
        quality={params.metadataQuality}
        service={service}
        popoverContainer={popoverContainer}
      />
      {isDefined(params.searchLanguage) && (
        <SearchLang languageCode={params.searchLanguage} />
      )}
      {isResearcherDetailsEnabled && <ResearcherInfo />}
      {isResearcherMetricsEnabled && <ResearcherMetricsInfo />}
      <MoreInfoLink />
    </ContextLineTemplate>
  );
};

const mapStateToProps = (state: any) => ({
  isResearcherDetailsEnabled: state.contextLine.isResearcherDetailsEnabled,
  isResearcherMetricsEnabled: state.contextLine.isResearcherMetricsEnabled,
  showLanguage: state.contextLine.showLanguage,
  showDataSource: state.contextLine.showDataSource,
  hidden: state.zoom || !state.contextLine.show,
  params: {
    ...state.contextLine,
    timespan: state.timespan,
    isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  },
  service: state.service,
  localization: state.localization,
  author: state.author,
});

export default connect(mapStateToProps)(ContextLine);

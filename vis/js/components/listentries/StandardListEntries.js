import React from "react";
import { connect } from "react-redux";

import StandardListEntry from "../../templates/listentry/StandardListEntry";
import EntriesWrapper from "./EntriesWrapper";

import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import { STREAMGRAPH_MODE } from "../../reducers/chartType";

import {
  getPaperPreviewLink,
  getPaperPDFClickHandler,
  getPaperKeywords,
  getPaperTextLink,
  getPaperComments,
  getPaperTags,
} from "../../utils/data";
import { shorten } from "../../utils/string";

const StandardListEntries = ({
  displayedData,
  abstractSize,
  linkType,
  showDocumentType,
  showMetrics,
  isContentBased,
  baseUnit,
  showPreviewImage,
  localization,
  showKeywords,
  isStreamgraph,
  showBacklink,
  isInStreamBacklink,
  disableClicks,
  handleZoomIn,
  handleSelectPaper,
  handleDeselectPaper,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  handleBacklinkClick,
}) => {
  const handleTitleClick = (paper) => {
    if (disableClicks) {
      return;
    }
    handleSelectPaper(paper);
    if (!isStreamgraph) {
      handleZoomIn(paper);
    }
  };

  const handleAreaClick = (paper) => {
    if (disableClicks) {
      return;
    }
    handleDeselectPaper();
    handleZoomIn(paper, "list-area");
  };

  return (
    <EntriesWrapper>
      {displayedData.map((entry) => (
        <StandardListEntry
          key={entry.safe_id}
          id={entry.safe_id}
          access={{
            isOpenAccess: !!entry.oa,
            isFreeAccess: !!entry.free_access,
            isDataset: entry.resulttype === "dataset",
          }}
          tags={getPaperTags(entry)}
          title={entry.title ? entry.title : localization.default_paper_title}
          preview={{
            link: getPaperPreviewLink(entry),
            onClickPDF: getPaperPDFClickHandler(entry, handlePDFClick),
            showPreviewImage,
          }}
          details={{
            authors: entry.authors_string
              ? entry.authors_string
              : localization.default_authors,
            source: entry.published_in,
            year: entry.year,
          }}
          link={getPaperTextLink(entry, linkType)}
          documentType={showDocumentType ? entry.resulttype : null}
          abstract={
            abstractSize
              ? shorten(entry.paper_abstract, abstractSize)
              : entry.paper_abstract
          }
          comments={getPaperComments(entry)}
          keywords={showKeywords ? getPaperKeywords(entry, localization) : null}
          metrics={
            showMetrics
              ? {
                  tweets: entry.cited_by_tweeters_count,
                  readers: entry["readers.mendeley"],
                  citations: entry.citation_count,
                  baseUnit: !isContentBased ? baseUnit : null,
                }
              : null
          }
          area={
            !isStreamgraph
              ? {
                  text: entry.area,
                  onMouseOver: () => handleAreaMouseover(entry),
                  onMouseOut: () => handleAreaMouseout(),
                }
              : null
          }
          citations={
            !isContentBased && !!baseUnit && !showMetrics
              ? entry.num_readers
              : null
          }
          baseUnit={baseUnit}
          handleTitleClick={() => handleTitleClick(entry)}
          handleAreaClick={() => handleAreaClick(entry)}
          backlink={{
            show: showBacklink,
            isInStream: isInStreamBacklink,
            onClick: () => handleBacklinkClick(),
          }}
        />
      ))}
    </EntriesWrapper>
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  linkType: state.list.linkType,
  showDocumentType: state.list.showDocumentType,
  showMetrics: state.list.showMetrics,
  isContentBased: state.list.isContentBased,
  baseUnit: state.list.baseUnit,
  showPreviewImage: !!state.selectedPaper,
  localization: state.localization,
  showKeywords:
    state.list.showKeywords &&
    (!!state.selectedPaper || !state.list.hideUnselectedKeywords),
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
  disableClicks: state.list.disableClicks,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(StandardListEntries);

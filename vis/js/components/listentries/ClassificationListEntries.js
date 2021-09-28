import React from "react";
import { connect } from "react-redux";

import ClassificationListEntry from "../../templates/listentry/ClassificationListEntry";
import EntriesWrapper from "./EntriesWrapper";

import {
  getPaperPreviewLink,
  getPaperPDFClickHandler,
  getPaperKeywords,
  getPaperClassification,
  getPaperTextLink,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import { shorten } from "../../utils/string";

import { STREAMGRAPH_MODE } from "../../reducers/chartType";

const ClassificationListEntries = ({
  displayedData,
  abstractSize,
  linkType,
  isStreamgraph,
  localization,
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
    handleZoomIn(paper);
  };

  return (
    <EntriesWrapper>
      {displayedData.map((entry) => (
        <ClassificationListEntry
          key={entry.safe_id}
          id={entry.safe_id}
          access={{
            isOpenAccess: !!entry.oa,
            isFreeAccess: !!entry.free_access,
            isDataset: entry.resulttype === "dataset",
          }}
          title={entry.title ? entry.title : localization.default_paper_title}
          preview={{
            link: getPaperPreviewLink(entry),
            onClickPDF: getPaperPDFClickHandler(entry, handlePDFClick),
          }}
          details={{
            authors: entry.authors_string
              ? entry.authors_string
              : localization.default_authors,
            source: entry.published_in,
            year: entry.year,
          }}
          link={getPaperTextLink(entry, linkType)}
          classification={getPaperClassification(entry, localization)}
          abstract={
            abstractSize
              ? shorten(entry.paper_abstract, abstractSize)
              : entry.paper_abstract
          }
          keywords={getPaperKeywords(entry, localization)}
          area={
            isStreamgraph
              ? null
              : {
                  text: entry.area,
                  onMouseOver: () => handleAreaMouseover(entry),
                  onMouseOut: () => handleAreaMouseout(),
                }
          }
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
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  localization: state.localization,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
  disableClicks: state.list.disableClicks,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ClassificationListEntries);

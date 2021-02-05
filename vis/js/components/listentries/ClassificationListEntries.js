import React from "react";
import { connect } from "react-redux";

import ClassificationListEntry from "../../templates/listentry/ClassificationListEntry";

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
  height,
  handleZoomIn,
  handleSelectPaper,
  handleDeselectPaper,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  handleBacklinkClick,
}) => {
  const handleTitleClick = (paper) => {
    handleSelectPaper(paper);
    if (!isStreamgraph) {
      handleZoomIn(paper);
    }
  }

  const handleAreaClick = (paper) => {
    handleDeselectPaper();
    handleZoomIn(paper, "list-area");
  };

  return (
    <div
      className="col-xs-12"
      id="papers_list"
      style={{ display: "block", height: !!height ? height : undefined }}
    >
      {displayedData.map((entry) => (
        <ClassificationListEntry
          key={entry.safe_id}
          id={entry.safe_id}
          access={{
            isOpenAccess: !!entry.oa,
            isFreeAccess: !!entry.free_access,
            isDataset: entry.resulttype === "dataset",
          }}
          title={entry.title}
          preview={{
            link: getPaperPreviewLink(entry),
            onClickPDF: getPaperPDFClickHandler(entry, handlePDFClick),
          }}
          details={{
            authors: entry.authors_string,
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
    </div>
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  linkType: state.list.linkType,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  localization: state.localization,
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
  height: state.list.height,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ClassificationListEntries);

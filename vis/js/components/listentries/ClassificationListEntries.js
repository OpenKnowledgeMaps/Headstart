import React from "react";
import { connect } from "react-redux";

import ClassificationListEntry from "../../templates/listentry/ClassificationListEntry";

import {
  getPaperPreviewImage,
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
  showPreviewImage,
  showRealPreviewImage,
  localization,
  showKeywords,
  showBacklink,
  isInStreamBacklink,
  handleZoomIn,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  handleTitleClick,
  handleBacklinkClick,
}) => {
  return (
    <>
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
            showPreviewImage,
            previewImage: showRealPreviewImage
              ? getPaperPreviewImage(entry)
              : null,
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
          keywords={showKeywords ? getPaperKeywords(entry, localization) : null}
          area={
            isStreamgraph
              ? null
              : {
                  text: entry.area,
                  onMouseOver: () => handleAreaMouseover(entry),
                  onMouseOut: () => handleAreaMouseout(),
                }
          }
          handleZoomIn={() => handleZoomIn(entry)}
          handleTitleClick={() => handleTitleClick(entry)}
          backlink={{
            show: showBacklink,
            isInStream: isInStreamBacklink,
            onClick: () => handleBacklinkClick(),
          }}
        />
      ))}
    </>
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  linkType: state.list.linkType,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
  showPreviewImage: !!state.selectedPaper,
  showRealPreviewImage: state.list.showRealPreviewImage,
  localization: state.localization,
  showKeywords:
    state.list.showKeywords &&
    (!!state.selectedPaper || !state.list.hideUnselectedKeywords),
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(ClassificationListEntries);

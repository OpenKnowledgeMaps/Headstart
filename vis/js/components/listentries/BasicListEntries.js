import React from "react";
import { connect } from "react-redux";

import BasicListEntryTemplate from "../../templates/listentry/BasicListEntry";
import EntriesWrapper from "./EntriesWrapper";

import {
  getPaperPreviewImage,
  getPaperPreviewLink,
  getPaperPDFClickHandler,
} from "../../utils/data";
import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";
import { shorten } from "../../utils/string";

const BasicListEntries = ({
  displayedData,
  handleZoomIn,
  handleSelectPaper,
  handleDeselectPaper,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  abstractSize,
  baseUnit,
  showPreviewImage,
  showRealPreviewImage,
  disableClicks,
}) => {
  const handleTitleClick = (paper) => {
    if (disableClicks) {
      return;
    }
    handleSelectPaper(paper);
    handleZoomIn(paper);
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
        <BasicListEntryTemplate
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
          abstract={
            abstractSize
              ? shorten(entry.paper_abstract, abstractSize)
              : entry.paper_abstract
          }
          area={{
            text: entry.area,
            onMouseOver: () => handleAreaMouseover(entry),
            onMouseOut: () => handleAreaMouseout(),
          }}
          readers={entry.num_readers}
          baseUnit={baseUnit}
          handleTitleClick={() => handleTitleClick(entry)}
          handleAreaClick={() => handleAreaClick(entry)}
        />
      ))}
    </EntriesWrapper>
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  baseUnit: state.list.baseUnit,
  showPreviewImage: !!state.selectedPaper,
  showRealPreviewImage: state.list.showRealPreviewImage,
  disableClicks: state.list.disableClicks,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(BasicListEntries);

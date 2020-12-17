import React from "react";
import { connect } from "react-redux";

import BasicListEntryTemplate from "../../templates/listentry/BasicListEntry";

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
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  abstractSize,
  baseUnit,
  showPreviewImage,
  showRealPreviewImage,
  height,
}) => {
  const handleTitleClick = (paper) => {
    handleSelectPaper(paper);
    handleZoomIn(paper);
  }

  return (
    <div
      className="col-xs-12"
      id="papers_list"
      style={{ display: "block", height: !!height ? height : undefined }}
    >
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
          handleZoomIn={() => handleZoomIn(entry, "list-area")}
          readers={entry.num_readers}
          baseUnit={baseUnit}
          handleTitleClick={() => handleTitleClick(entry)}
        />
      ))}
    </div>
  );
};

const mapStateToProps = (state) => ({
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  baseUnit: state.list.baseUnit,
  showPreviewImage: !!state.selectedPaper,
  showRealPreviewImage: state.list.showRealPreviewImage,
  height: state.list.height,
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(BasicListEntries);

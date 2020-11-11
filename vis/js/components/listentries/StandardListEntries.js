import React from "react";
import { connect } from "react-redux";

import StandardListEntry from "../../templates/listentry/StandardListEntry";

import { mapDispatchToListEntriesProps } from "../../utils/eventhandlers";

import {
  getPaperPreviewImage,
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
  showRealPreviewImage,
  localization,
  showKeywords,
  handleZoomIn,
  handlePDFClick,
  handleAreaMouseover,
  handleAreaMouseout,
  handleTitleClick,
}) => {
  return (
    <>
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
          documentType={showDocumentType ? entry.resulttype : null}
          abstract={
            abstractSize
              ? // probably just a temporary solution (highlight in shortened text)
                shorten(entry.paper_abstract, abstractSize)
              : entry.paper_abstract
          }
          comments={getPaperComments(entry)}
          keywords={showKeywords ? getPaperKeywords(entry, localization) : null}
          metrics={
            showMetrics
              ? {
                  tweets: entry.cited_by_tweeters_count,
                  readers: entry["readers.mendeley"],
                  citations: citation_count,
                  baseUnit: !isContentBased ? baseUnit : null,
                }
              : null
          }
          area={{
            text: entry.area,
            onMouseOver: () => handleAreaMouseover(entry),
            onMouseOut: () => handleAreaMouseout(),
          }}
          handleZoomIn={() => handleZoomIn(entry)}
          citations={
            !isContentBased && !!baseUnit && !showMetrics
              ? entry.num_readers
              : null
          }
          baseUnit={baseUnit}
          handleTitleClick={() => handleTitleClick(entry)}
        />
      ))}
    </>
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
  showRealPreviewImage: state.list.showRealPreviewImage,
  localization: state.localization,
  showKeywords:
    state.list.showKeywords &&
    (!!state.selectedPaper || !state.list.hideUnselectedKeywords),
});

export default connect(
  mapStateToProps,
  mapDispatchToListEntriesProps
)(StandardListEntries);

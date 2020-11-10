import React from "react";
import { connect } from "react-redux";

import BasicListEntry from "../templates/listentry/BasicListEntry";
import ClassificationListEntry from "../templates/listentry/ClassificationListEntry";
import StandardListEntry from "../templates/listentry/StandardListEntry";
import {
  zoomIn,
  hoverArea,
  showPreview,
  selectPaper,
  deselectPaperBacklink,
} from "../actions";

import { filterData, sortData } from "../utils/data";
import { shorten } from "../utils/string";

import { STREAMGRAPH_MODE } from "../reducers/chartType";

import LocalizationProvider from "./LocalizationProvider";

const ListEntries = ({
  show,
  data,
  handleZoomIn,
  handlePDFClick,
  searchSettings,
  filterSettings,
  sortSettings,
  handleAreaMouseover,
  handleAreaMouseout,
  abstractSize,
  service,
  linkType,
  isStreamgraph,
  showDocumentType,
  showMetrics,
  isContentBased,
  baseUnit,
  showPreviewImage,
  showRealPreviewImage,
  localization,
  handleTitleClick,
  showKeywords,
  showBacklink,
  isInStreamBacklink,
  handleBacklinkClick,
}) => {
  if (!show) {
    return null;
  }

  let displayedData = filterData(data, searchSettings, filterSettings);
  displayedData = sortData(displayedData, sortSettings);

  // TODO refactor this into multiple components

  if (service === null || typeof service === "undefined") {
    return (
      // TODO move the HTML element here
      <LocalizationProvider localization={localization}>
        {displayedData.map((entry) => (
          <BasicListEntry
            key={entry.safe_id}
            id={entry.safe_id}
            access={{
              isOpenAccess: !!entry.oa,
              isFreeAccess: !!entry.free_access,
              isDataset: entry.resulttype === "dataset",
            }}
            title={entry.title}
            preview={{
              link: getPreviewLinkFromEntry(entry),
              onClickPDF: getPDFClickHandlerFromEntry(entry, handlePDFClick),
              showPreviewImage,
              previewImage: showRealPreviewImage
                ? getImagePreviewUrl(entry)
                : null,
            }}
            details={{
              authors: entry.authors_string,
              source: entry.published_in,
              year: entry.year,
            }}
            abstract={
              abstractSize
                ? // probably just a temporary solution (highlight in shortened text)
                  shorten(entry.paper_abstract, abstractSize)
                : entry.paper_abstract
            }
            area={{
              text: entry.area,
              onMouseOver: () => handleAreaMouseover(entry),
              onMouseOut: () => handleAreaMouseout(),
            }}
            handleZoomIn={() => handleZoomIn(entry)}
            readers={entry.num_readers}
            baseUnit={baseUnit}
            handleTitleClick={() => handleTitleClick(entry)}
          />
        ))}
      </LocalizationProvider>
    );
  }

  if (service.startsWith("linkedcat")) {
    return (
      // TODO move the HTML element here
      <LocalizationProvider localization={localization}>
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
              link: getPreviewLinkFromEntry(entry),
              onClickPDF: getPDFClickHandlerFromEntry(entry, handlePDFClick),
              showPreviewImage,
              previewImage: showRealPreviewImage
                ? getImagePreviewUrl(entry)
                : null,
            }}
            details={{
              authors: entry.authors_string,
              source: entry.published_in,
              year: entry.year,
            }}
            link={getTextLinkFromEntry(entry, linkType)}
            classification={getClassificationFromEntry(entry, localization)}
            abstract={
              abstractSize
                ? // probably just a temporary solution (highlight in shortened text)
                  shorten(entry.paper_abstract, abstractSize)
                : entry.paper_abstract
            }
            keywords={
              showKeywords ? getKeywordsFromEntry(entry, localization) : null
            }
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
      </LocalizationProvider>
    );
  }

  return (
    // TODO move the HTML element here
    <LocalizationProvider localization={localization}>
      {displayedData.map((entry) => (
        <StandardListEntry
          key={entry.safe_id}
          id={entry.safe_id}
          access={{
            isOpenAccess: !!entry.oa,
            isFreeAccess: !!entry.free_access,
            isDataset: entry.resulttype === "dataset",
          }}
          tags={getTagsFromEntry(entry)}
          title={entry.title}
          preview={{
            link: getPreviewLinkFromEntry(entry),
            onClickPDF: getPDFClickHandlerFromEntry(entry, handlePDFClick),
            showPreviewImage,
            previewImage: showRealPreviewImage
              ? getImagePreviewUrl(entry)
              : null,
          }}
          details={{
            authors: entry.authors_string,
            source: entry.published_in,
            year: entry.year,
          }}
          link={getTextLinkFromEntry(entry, linkType)}
          documentType={showDocumentType ? entry.resulttype : null}
          abstract={
            abstractSize
              ? // probably just a temporary solution (highlight in shortened text)
                shorten(entry.paper_abstract, abstractSize)
              : entry.paper_abstract
          }
          comments={getCommentsFromEntry(entry)}
          keywords={
            showKeywords ? getKeywordsFromEntry(entry, localization) : null
          }
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
    </LocalizationProvider>
  );
};

const getImagePreviewUrl = (d) => {
  return "paper_preview/" + d.id + "/page_1.png";
};

const getCommentsFromEntry = (d) => {
  let comments = d.comments;
  if (!comments || comments.length === 0) {
    return null;
  }

  return comments;
};

const getTagsFromEntry = (d) => {
  if (!d.tags) {
    return null;
  }

  let tags = d.tags.split(/, |,/g).filter((tag) => !!tag);
  if (tags.length > 0) {
    return tags;
  }

  return null;
};

const getKeywordsFromEntry = (d, localization) => {
  if (!d.hasOwnProperty("subject_orig") || d.subject_orig === "") {
    return localization.no_keywords;
  }

  return d.subject_orig;
};

const getClassificationFromEntry = (d, localization) => {
  if (!d.hasOwnProperty("bkl_caption") || d.bkl_caption === "") {
    return localization.no_keywords;
  }

  return d.bkl_caption;
};

const getTextLinkFromEntry = (d, linkType) => {
  if (linkType === "url") {
    return { address: d.outlink, isDoi: false };
  }

  if (linkType === "doi") {
    if (typeof d.doi === "undefined" || d.doi === null || d.doi === "") {
      return { address: d.link, isDoi: false };
    }

    return { address: d.doi, isDoi: true };
  }

  return {};
};

const getPreviewLinkFromEntry = (d) => {
  if (d.oa && d.link !== "") {
    return null;
  }

  return d.outlink;
};

const getPDFClickHandlerFromEntry = (d, handlePDFClick) => {
  if (d.oa === false || d.resulttype == "dataset" || d.link === "") {
    return null;
  }

  return () => handlePDFClick(d);
};

const mapStateToProps = (state) => ({
  data: state.data,
  show: state.list.show,
  searchSettings: {
    value: state.list.searchValue,
  },
  filterSettings: {
    value: state.list.filterValue,
    field: state.list.filterField,
    zoomed: state.zoom,
    area: state.selectedBubble ? state.selectedBubble.uri : null,
    paper: state.selectedPaper ? state.selectedPaper.safeId : null,
    isStreamgraph: state.chartType === STREAMGRAPH_MODE,
    title: state.selectedBubble ? state.selectedBubble.title : null,
  },
  sortSettings: {
    value: state.list.sortValue,
  },
  abstractSize: state.selectedPaper ? null : state.list.abstractSize,
  service: state.service,
  linkType: state.list.linkType,
  isStreamgraph: state.chartType === STREAMGRAPH_MODE,
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
  showBacklink: state.chartType === STREAMGRAPH_MODE && !!state.selectedPaper,
  isInStreamBacklink: !!state.selectedBubble,
});

const mapDispatchToProps = (dispatch) => ({
  handleZoomIn: (paper) => {
    // TODO remove warn
    console.warn(
      "*** Zoom in event triggered from React element 'List entry' ***"
    );
    dispatch(zoomIn({ title: paper.area, uri: paper.area_uri }, "list-area"));
  },
  handlePDFClick: (paper) => {
    // TODO remove warn
    console.warn(
      "*** PDF preview open event triggered from React element 'List entry' ***"
    );
    dispatch(showPreview(paper));
  },
  handleAreaMouseover: (paper) => {
    // TODO remove warn
    console.warn(
      "*** Area mouseover event triggered from React element 'List entry' ***"
    );
    dispatch(hoverArea(paper));
  },
  handleAreaMouseout: () => {
    // TODO remove warn
    console.warn(
      "*** Area mouseout event triggered from React element 'List entry' ***"
    );
    dispatch(hoverArea(null));
  },
  handleTitleClick: (paper) => {
    // TODO remove warn
    console.warn(
      "*** Title click event triggered from React element 'List entry' ***"
    );
    dispatch(selectPaper(paper));
  },
  handleBacklinkClick: () => {
    // TODO remove warn
    console.warn(
      "*** Backlink click event triggered from React element 'List entry' ***"
    );
    dispatch(deselectPaperBacklink());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ListEntries);

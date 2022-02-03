import {
  zoomIn,
  zoomOut,
  highlightArea,
  showPreview,
  selectPaper,
  deselectPaper,
  stopAnimation,
  hoverBubble,
  hoverPaper,
  showCitePaper,
} from "../actions";

/**
 * Returns mapDispatchToProps function used in *ListEntries.js components.
 * @param {Function} dispatch
 */
export const mapDispatchToListEntriesProps = (dispatch) => ({
  handleZoomIn: (paper) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(dispatch)
      )
    ),
  handlePDFClick: (paper) => dispatch(showPreview(paper)),
  handleAreaMouseover: (paper) => dispatch(highlightArea(paper)),
  handleAreaMouseout: () => dispatch(highlightArea(null)),
  handleSelectPaper: (paper) => dispatch(selectPaper(paper)),
  handleSelectPaperWithZoom: (paper) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(dispatch),
        false,
        false,
        paper
      )
    ),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleBacklinkClick: () => dispatch(deselectPaper()),
  handleCiteClick: (paper) => dispatch(showCitePaper(paper)),
});

/**
 * Returns mapDispatchToProps function used in KnowledgeMap component.
 * @param {Function} dispatch
 */
export const mapDispatchToMapEntriesProps = (dispatch) => ({
  handleZoomIn: (area, alreadyZoomed = false) =>
    dispatch(
      zoomIn(
        { title: area.title, uri: area.area_uri },
        createAnimationCallback(dispatch),
        alreadyZoomed
      )
    ),
  handleZoomOut: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleSelectPaper: (paper) => dispatch(selectPaper(paper)),
  changeBubbleOrder: (uri) => dispatch(hoverBubble(uri)),
  changePaperOrder: (safeId, enlargeFactor) =>
    dispatch(hoverPaper(safeId, enlargeFactor)),
});

/**
 * Returns a callback function for the zoom transition finish.
 * @param {Function} dispatch
 */
export const createAnimationCallback = (dispatch) => {
  return () => {
    dispatch(stopAnimation());
    // TODO some other things
  };
};

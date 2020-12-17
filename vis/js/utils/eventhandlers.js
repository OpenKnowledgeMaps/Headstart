import {
  zoomIn,
  zoomOut,
  highlightArea,
  showPreview,
  selectPaper,
  deselectPaper,
  deselectPaperBacklink,
  stopAnimation,
  hoverBubble,
  hoverPaper,
} from "../actions";

/**
 * Returns mapDispatchToProps function used in *ListEntries.js components.
 * @param {Function} dispatch
 */
export const mapDispatchToListEntriesProps = (dispatch) => ({
  // TODO remove the source after refactoring
  handleZoomIn: (paper, source = null) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        source,
        createAnimationCallback(dispatch)
      )
    ),
  handlePDFClick: (paper) => dispatch(showPreview(paper)),
  handleAreaMouseover: (paper) => dispatch(highlightArea(paper)),
  handleAreaMouseout: () => dispatch(highlightArea(null)),
  handleSelectPaper: (paper) => dispatch(selectPaper(paper)),
  handleBacklinkClick: () => dispatch(deselectPaperBacklink()),
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
        null,
        createAnimationCallback(dispatch),
        alreadyZoomed
      )
    ),
  handleZoomOut: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleSelectPaper: (paper) => dispatch(selectPaper(paper)),
  changeBubbleOrder: (uri) => dispatch(hoverBubble(uri)),
  changePaperOrder: (safeId, enlargeFactor) => dispatch(hoverPaper(safeId, enlargeFactor)),
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

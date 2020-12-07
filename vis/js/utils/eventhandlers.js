import {
  zoomIn,
  zoomOut,
  hoverArea,
  showPreview,
  selectPaper,
  deselectPaper,
  deselectPaperBacklink,
  stopAnimation,
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
        "list-area",
        createAnimationCallback(dispatch)
      )
    ),
  handlePDFClick: (paper) => dispatch(showPreview(paper)),
  handleAreaMouseover: (paper) => dispatch(hoverArea(paper)),
  handleAreaMouseout: () => dispatch(hoverArea(null)),
  handleTitleClick: (paper) => {
    dispatch(selectPaper(paper));
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        "list-area",
        createAnimationCallback(dispatch)
      )
    );
  },
  handleBacklinkClick: () => dispatch(deselectPaperBacklink()),
});

/**
 * Returns mapDispatchToProps function used in KnowledgeMap component.
 * @param {Function} dispatch
 */
export const mapDispatchToMapEntriesProps = (dispatch) => ({
  handleZoomIn: (area) =>
    dispatch(
      zoomIn(
        { title: area.title, uri: area.area_uri },
        null,
        createAnimationCallback(dispatch)
      )
    ),
  handleZoomOut: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleSelectPaper: (paper) => dispatch(selectPaper(paper)),
  // TODO
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

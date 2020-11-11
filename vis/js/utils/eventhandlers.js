import {
  zoomIn,
  hoverArea,
  showPreview,
  selectPaper,
  deselectPaperBacklink,
} from "../actions";

/**
 * Returns mapDispatchToProps function used in *ListEntries.js components.
 * @param {Function} dispatch
 */
export const mapDispatchToListEntriesProps = (dispatch) => ({
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

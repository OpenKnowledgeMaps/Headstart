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
  handleZoomIn: (paper) =>
    dispatch(zoomIn({ title: paper.area, uri: paper.area_uri }, "list-area")),
  handlePDFClick: (paper) => dispatch(showPreview(paper)),
  handleAreaMouseover: (paper) => dispatch(hoverArea(paper)),
  handleAreaMouseout: () => dispatch(hoverArea(null)),
  handleTitleClick: (paper) => dispatch(selectPaper(paper)),
  handleBacklinkClick: () => dispatch(deselectPaperBacklink()),
});

import {
  zoomIn,
  zoomOut,
  hoverArea,
  showPreview,
  selectPaper,
  deselectPaper,
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
  handleTitleClick: (paper) => {
    dispatch(selectPaper(paper));
    dispatch(zoomIn({ title: paper.area, uri: paper.area_uri }, "list-area"));
  },
  handleBacklinkClick: () => dispatch(deselectPaperBacklink()),
});

/**
 * Returns mapDispatchToProps function used in KnowledgeMap component.
 * @param {Function} dispatch
 */
export const mapDispatchToMapEntriesProps = (dispatch) => ({
  handleZoomIn: (area) =>
    dispatch(zoomIn({ title: area.title, uri: area.area_uri })),
  handleZoomOut: () => dispatch(zoomOut()),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  // TODO
});

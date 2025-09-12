import { Paper } from "../types";
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
  showExportPaper,
} from "../actions";

/**
 * Returns mapDispatchToProps function used in *ListEntries.js components.
 * @param {Function} dispatch
 */
export const mapDispatchToListEntriesProps = (dispatch: any) => ({
  handleZoomIn: (paper: Record<string, string>) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(dispatch)
      )
    ),
  handlePDFClick: (paper: Paper) => dispatch(showPreview(paper)),
  handleAreaMouseover: (paper: Paper) => dispatch(highlightArea(paper)),
  handleAreaMouseout: () => dispatch(highlightArea(null)),
  handleSelectPaper: (paper: Paper) => dispatch(selectPaper(paper)),
  handleSelectPaperWithZoom: (paper: Paper) =>
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
  handleCiteClick: (paper: Paper) => dispatch(showCitePaper(paper)),
  handleExportClick: (paper: Paper) => dispatch(showExportPaper(paper)),
});

/**
 * Returns mapDispatchToProps function used in KnowledgeMap component.
 * @param {Function} dispatch
 */
export const mapDispatchToMapEntriesProps = (dispatch: any) => ({
  handleZoomIn: (area: Record<string, string>, alreadyZoomed = false) =>
    dispatch(
      zoomIn(
        { title: area.title, uri: area.area_uri },
        createAnimationCallback(dispatch),
        alreadyZoomed
      )
    ),
  handleZoomOut: () => dispatch(zoomOut(createAnimationCallback(dispatch))),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleSelectPaper: (paper: Paper) => dispatch(selectPaper(paper)),
  changeBubbleOrder: (uri: string) => dispatch(hoverBubble(uri)),
  changePaperOrder: (safeId: string, enlargeFactor: string) =>
    dispatch(hoverPaper(safeId, enlargeFactor)),
});

/**
 * Returns a callback function for the zoom transition finish.
 * @param {Function} dispatch
 */
export const createAnimationCallback = (dispatch: any) => {
  return () => {
    dispatch(stopAnimation());
    // TODO some other things
  };
};

import {
  deselectPaper,
  highlightArea,
  hoverBubble,
  hoverItem,
  hoverPaper,
  selectPaper,
  showCitePaper,
  showExportPaper,
  showPreview,
  stopAnimation,
  zoomIn,
  zoomOut,
} from "../actions";
import { AllPossiblePapersType, Paper } from "../types";

/**
 * Returns mapDispatchToProps function used in *ListEntries.js components.
 * @param {Function} dispatch
 */
export const mapDispatchToListEntriesProps = (dispatch: any) => ({
  handleZoomIn: (paper: AllPossiblePapersType) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(dispatch),
      ),
    ),
  handlePDFClick: (paper: AllPossiblePapersType) =>
    dispatch(showPreview(paper)),
  handleAreaMouseover: (paper: AllPossiblePapersType) =>
    dispatch(highlightArea(paper)),
  handleAreaMouseout: () => dispatch(highlightArea(null)),
  handleSelectPaper: (paper: AllPossiblePapersType) =>
    dispatch(selectPaper(paper)),
  handleSelectPaperWithZoom: (paper: AllPossiblePapersType) =>
    dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(dispatch),
        false,
        false,
        paper,
      ),
    ),
  handleDeselectPaper: () => dispatch(deselectPaper()),
  handleBackLinkClick: () => dispatch(deselectPaper()),
  handleCiteClick: (paper: AllPossiblePapersType) =>
    dispatch(showCitePaper(paper)),
  handleExportClick: (paper: AllPossiblePapersType) =>
    dispatch(showExportPaper(paper)),
  handleMouseEnterOnTitle: (id: string | null) => dispatch(hoverItem(id)),
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
        alreadyZoomed,
      ),
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

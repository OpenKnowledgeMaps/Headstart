import { Paper } from "../@types/paper";
import { Config } from "../default-config";

/**
 * All actions in this array are not delayed when the map is animated.
 *
 * add all actions that don't change anything in the map to here
 */
export const ALLOWED_IN_ANIMATION = ["STOP_ANIMATION"];

/**
 * All actions in this array are canceled without queuing when the map
 * is animated.
 *
 * add all actions that are triggered after clicking to here
 */
export const NOT_QUEUED_IN_ANIMATION = [
  "ZOOM_IN",
  "ZOOM_OUT",
  "SELECT_PAPER",
  "DESELECT_PAPER",
  "SEARCH",
  "FILTER",
  "SORT",
];

export const zoomIn = (
  selectedAreaData: any,
  callback: any,
  alreadyZoomed = false,
  isFromBackButton = false,
  selectedPaperData: Paper | null = null
) => ({
  type: "ZOOM_IN",
  selectedAreaData,
  callback,
  alreadyZoomed,
  isFromBackButton,
  selectedPaperData,
});

export const zoomOut = (callback: (() => void) | null, isFromBackButton = false) => ({
  type: "ZOOM_OUT",
  callback,
  isFromBackButton,
});

/**
 * Action for initializing the data that aren't known in advance.
 * @param {Object} configObject the default_config.json + data_config.json
 * @param {Object} contextObject the app context
 * @param {Array}  papers the papers data array
 * @param {Array}  areas the areas data array
 * @param {Array}  streams the streams data array
 */
export const initializeStore = (
  configObject: Config,
  contextObject: any,
  papers: any[],
  areas: any[],
  streams: any[],
  chartSize: number,
  streamWidth: number,
  streamHeight: number,
  listHeight: number,
  scalingFactors: any,
  author: any
) => ({
  type: "INITIALIZE",
  configObject,
  contextObject,
  papers,
  areas,
  streams,
  chartSize,
  streamWidth,
  streamHeight,
  listHeight,
  scalingFactors,
  author
});

export const toggleList = () => ({ type: "TOGGLE_LIST" });

export const showList = () => ({ type: "SHOW_LIST" });

export const search = (text: string) => ({ type: "SEARCH", text });

export const filter = (id: string) => ({ type: "FILTER", id });

export const sort = (id: string) => ({ type: "SORT", id });

export const selectPaper = (paper: any, isFromBackButton = false) => ({
  type: "SELECT_PAPER",
  safeId: paper.safe_id,
  paper,
  isFromBackButton,
});

export const deselectPaper = (isFromBackButton = false) => ({
  type: "DESELECT_PAPER",
  isFromBackButton,
});

export const highlightArea = (paper: any) => ({
  type: "HIGHLIGHT_AREA",
  uri: paper ? paper.area_uri : null,
});

export const showPreview = (paper: any) => ({ type: "SHOW_PREVIEW", paper });
export const hidePreview = () => ({ type: "HIDE_PREVIEW" });

export const showCitePaper = (paper: any) => ({ type: "SHOW_CITE_PAPER", paper });
export const hideCitePaper = () => ({ type: "HIDE_CITE_PAPER" });

export const showExportPaper = (paper: any) => ({ type: "SHOW_EXPORT_PAPER", paper });
export const hideExportPaper = () => ({ type: "HIDE_EXPORT_PAPER" });

export const updateDimensions = (chart: any, list: any) => ({
type: "RESIZE",
  listHeight: list.height,
  chartSize: chart.size,
  streamWidth: chart.width,
  streamHeight: chart.height < chart.width ? chart.height : chart.width,
});

export const applyForceAreas = (areasArray: any, chartSize: any) => ({
  type: "APPLY_FORCE_AREAS",
  areasArray,
  chartSize,
});

export const applyForcePapers = (dataArray: any, chartSize: number) => ({
  type: "APPLY_FORCE_PAPERS",
  dataArray,
  chartSize,
});

export const stopAnimation = () => ({ type: "STOP_ANIMATION" });

export const hoverBubble = (uri: string) => ({ type: "HOVER_BUBBLE", uri });

export const hoverPaper = (safeId: string, enlargeFactor: any) => ({
  type: "HOVER_PAPER",
  safeId,
  enlargeFactor,
});

export const openEmbedModal = () => ({ type: "OPEN_EMBED_MODAL" });
export const closeEmbedModal = () => ({ type: "CLOSE_EMBED_MODAL" });

export const openViperEditModal = () => ({ type: "OPEN_VIPER_EDIT_MODAL" });
export const closeViperEditModal = () => ({ type: "CLOSE_VIPER_EDIT_MODAL" });

export const openInfoModal = () => ({ type: "OPEN_INFO_MODAL" });
export const closeInfoModal = () => ({ type: "CLOSE_INFO_MODAL" });

export const openResearcherModal = () => ({ type: "OPEN_RESEARCHER_MODAL" });
export const closeResearcherModal = () => ({ type: "CLOSE_RESEARCHER_MODAL" });

export const openResearcherMetricsModal = () => ({ type: "OPEN_RESEARCHER_METRICS_MODAL" });
export const closeResearcherMetricsModal = () => ({ type: "CLOSE_RESEARCHER_METRICS_MODAL" });

export const scaleMap = (value: any, baseUnit: string, contentBased: boolean, sort: string) => ({
  type: "SCALE",
  value,
  baseUnit,
  contentBased,
  sort,
});

export const openCitationModal = () => ({ type: "OPEN_CITATION_MODAL" });
export const closeCitationModal = () => ({ type: "CLOSE_CITATION_MODAL" });

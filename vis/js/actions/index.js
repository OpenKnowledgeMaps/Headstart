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
  selectedAreaData,
  callback,
  alreadyZoomed = false,
  isFromBackButton = false,
  selectedPaperData = null
) => ({
  type: "ZOOM_IN",
  selectedAreaData,
  callback,
  alreadyZoomed,
  isFromBackButton,
  selectedPaperData,
});

export const zoomOut = (callback, isFromBackButton = false) => ({
  type: "ZOOM_OUT",
  callback,
  isFromBackButton,
});

/**
 * Action for initializing the data that are known from the very beginning.
 * @param {Object} configObject the default_config.json + data_config.json
 */
export const preinitializeStore = (configObject) => ({
  type: "PREINITIALIZE",
  configObject,
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
  configObject,
  contextObject,
  papers,
  areas,
  streams,
  chartSize,
  streamWidth,
  streamHeight,
  listHeight,
  scalingFactors
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
});

export const toggleList = () => ({ type: "TOGGLE_LIST" });

export const showList = () => ({ type: "SHOW_LIST" });

export const search = (text) => ({ type: "SEARCH", text });

export const filter = (id) => ({ type: "FILTER", id });

export const sort = (id) => ({ type: "SORT", id });

export const selectPaper = (paper, isFromBackButton = false) => ({
  type: "SELECT_PAPER",
  safeId: paper.safe_id,
  paper,
  isFromBackButton,
});

export const deselectPaper = () => ({ type: "DESELECT_PAPER" });

export const highlightArea = (paper) => ({
  type: "HIGHLIGHT_AREA",
  uri: paper ? paper.area_uri : null,
});

export const showPreview = (paper) => ({ type: "SHOW_PREVIEW", paper });
export const hidePreview = () => ({ type: "HIDE_PREVIEW" });

export const showCitePaper = (paper) => ({ type: "SHOW_CITE_PAPER", paper });
export const hideCitePaper = () => ({ type: "HIDE_CITE_PAPER" });

export const updateDimensions = (chart, list) => ({
  type: "RESIZE",
  listHeight: list.height,
  chartSize: chart.size,
  streamWidth: chart.width,
  streamHeight: chart.height < chart.width ? chart.height : chart.width,
});

export const applyForceAreas = (areasArray, chartSize) => ({
  type: "APPLY_FORCE_AREAS",
  areasArray,
  chartSize,
});

export const applyForcePapers = (dataArray, chartSize) => ({
  type: "APPLY_FORCE_PAPERS",
  dataArray,
  chartSize,
});

export const stopAnimation = () => ({ type: "STOP_ANIMATION" });

export const hoverBubble = (uri) => ({ type: "HOVER_BUBBLE", uri });

export const hoverPaper = (safeId, enlargeFactor) => ({
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

export const scaleMap = (value, baseUnit, contentBased, sort) => ({
  type: "SCALE",
  value,
  baseUnit,
  contentBased,
  sort,
});

export const openCitationModal = () => ({ type: "OPEN_CITATION_MODAL" });
export const closeCitationModal = () => ({ type: "CLOSE_CITATION_MODAL" });

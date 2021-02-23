/**
 * All actions in this array are not delayed when the map is animated.
 *
 * add all actions that don't change anything in the map to here
 */
export const ALLOWED_IN_ANIMATION = [
  "SHOW_PREVIEW",
  "HIDE_PREVIEW",
  "STOP_ANIMATION",
];

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
  "DESELECT_PAPER_BACKLINK",
  "FILE_CLICKED",
  "SEARCH",
  "FILTER",
  "SORT",
];

export const zoomIn = (
  selectedAreaData,
  source = null,
  callback,
  alreadyZoomed = false
) => ({
  type: "ZOOM_IN",
  selectedAreaData,
  source,
  callback,
  alreadyZoomed,
});

export const zoomOut = (callback) => ({
  type: "ZOOM_OUT",
  callback,
});

/**
 * Action for initializing the data that aren't known in advance.
 * @param {Object} configObject the default_config.json + data_config.json
 * @param {Object} contextObject the app context
 * @param {Array}  dataArray the papers data
 */
export const initializeStore = (
  configObject,
  contextObject,
  dataArray,
  streamData,
  chartSize,
  streamWidth,
  streamHeight
) => ({
  type: "INITIALIZE",
  configObject,
  contextObject,
  dataArray,
  streamData,
  chartSize,
  streamWidth,
  streamHeight,
});

/**
 * Action for changing the local file.
 * @param {Number} fileIndex
 */
export const changeFile = (fileIndex) => ({ type: "FILE_CLICKED", fileIndex });

export const toggleList = () => ({ type: "TOGGLE_LIST" });

export const showList = () => ({ type: "SHOW_LIST" });

export const search = (text) => ({ type: "SEARCH", text });

export const filter = (id) => ({ type: "FILTER", id });

export const sort = (id) => ({ type: "SORT", id });

export const selectPaper = (paper) => ({
  type: "SELECT_PAPER",
  safeId: paper.safe_id,
  paper,
});

export const deselectPaper = () => ({ type: "DESELECT_PAPER" });

export const highlightArea = (paper) => ({
  type: "HIGHLIGHT_AREA",
  uri: paper ? paper.area_uri : null,
});

export const showPreview = (paper) => ({ type: "SHOW_PREVIEW", paper });

export const hidePreview = () => ({ type: "HIDE_PREVIEW" });

export const deselectPaperBacklink = () => ({
  type: "DESELECT_PAPER_BACKLINK",
});

export const updateDimensions = (chart, list) => ({
  type: "RESIZE",
  listHeight: list.height,
  chartSize: chart.size,
  streamWidth: chart.width,
  streamHeight: chart.height,
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

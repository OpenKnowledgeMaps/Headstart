/**
 * All actions in this array are not delayed when the map is animated.
 *
 * add all actions that don't change anything in the map to here
 */
export const ALLOWED_IN_ANIMATION = [
  "TOGGLE_LIST",
  "SHOW_LIST",
  "SHOW_PREVIEW",
  "HIDE_PREVIEW",
  "STOP_ANIMATION",
];

export const zoomIn = (
  selectedAreaData,
  source = null,
  callback,
  alreadyZoomed = false
) => ({
  type: "ZOOM_IN",
  selectedAreaData,
  // TODO remove this when whole app is refactored
  not_from_mediator: true,
  source,
  callback,
  alreadyZoomed,
});

export const zoomInFromMediator = (selectedAreaData) => ({
  type: "ZOOM_IN",
  selectedAreaData,
});

export const zoomOutFromMediator = () => ({
  type: "ZOOM_OUT",
});

export const zoomOut = (callback) => ({
  type: "ZOOM_OUT",
  // TODO remove this when whole app is refactored
  not_from_mediator: true,
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
  chartSize
) => ({
  type: "INITIALIZE",
  configObject,
  contextObject,
  dataArray,
  chartSize,
});

/**
 * Action for changing the local file.
 * @param {Number} fileIndex
 */
export const changeFile = (fileIndex) => ({
  type: "FILE_CLICKED",
  fileIndex,
});

export const toggleList = () => ({
  type: "TOGGLE_LIST",
});

export const showList = () => ({
  type: "SHOW_LIST",
});

export const search = (text) => ({
  type: "SEARCH",
  text,
});

export const filter = (id) => ({
  type: "FILTER",
  id,
});

export const sort = (id) => ({
  type: "SORT",
  id,
});

export const selectPaper = (paper) => ({
  type: "SELECT_PAPER",
  safeId: paper.safe_id,
  paper,
  not_from_mediator: true,
});

export const selectPaperFromMediator = (safeId) => ({
  type: "SELECT_PAPER",
  safeId,
});

export const deselectPaper = () => ({
  type: "DESELECT_PAPER",
});

export const highlightArea = (paper) => ({
  type: "HIGHLIGHT_AREA",
  uri: paper ? paper.area_uri : null,
  // TODO won't be needed after map refactoring
  paper,
});

export const showPreview = (paper) => ({
  type: "SHOW_PREVIEW",
  paper,
});

export const hidePreview = () => ({
  type: "HIDE_PREVIEW",
});

export const deselectPaperBacklink = () => ({
  type: "DESELECT_PAPER_BACKLINK",
});

export const setListHeight = (listHeight) => ({
  type: "RESIZE",
  listHeight,
});

export const updateDimensions = (chart, list) => ({
  type: "RESIZE",
  listHeight: list.height,
  chartSize: chart.size,
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

export const stopAnimation = () => ({
  type: "STOP_ANIMATION",
});

export const hoverBubble = (uri) => ({
  type: "HOVER_BUBBLE",
  uri,
});

export const hoverPaper = (safeId, enlargeFactor) => ({
  type: "HOVER_PAPER",
  safeId,
  enlargeFactor,
});

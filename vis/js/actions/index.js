/**
 * This is where all actions are stored.
 */

export const zoomInFromMediator = (selectedAreaData) => ({
  type: "ZOOM_IN",
  selectedAreaData,
});

export const zoomOutFromMediator = () => ({
  type: "ZOOM_OUT",
});

export const zoomOut = (callback) => {
  return { type: "ZOOM_OUT", not_from_mediator: true };
};

/**
 * Action for initializing the data that aren't known in advance.
 * @param {Object} configObject the default_config.json + data_config.json
 * @param {Object} contextObject the app context
 */
export const initializeStore = (configObject, contextObject) => ({
  type: "INITIALIZE",
  configObject,
  contextObject,
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

// TODO refactor when possible to a non-setter action (or no action at all)
export const setItemsCount = (count) => ({
  type: "SET_ITEMS_COUNT",
  count,
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

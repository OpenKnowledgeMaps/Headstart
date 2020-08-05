/**
 * This is where all actions are stored.
 */

export const zoomInFromMediator = () => ({
  type: "ZOOM_IN"
});

export const zoomOutFromMediator = () => ({
  type: "ZOOM_OUT"
});

export const zoomOut = (callback) => {
  return {type: "ZOOM_OUT", not_from_mediator: true};
};

export const setKnowledgeMap = () => ({
  type: "SET_KNOWLEDGE_MAP"
});

export const setStreamgraph = () => ({
  type: "SET_STREAMGRAPH"
});

/**
 * Action for initializing the data that aren't known in advance.
 * @param {Object} configObject the default_config.json + data_config.json
 * @param {Object} contextObject the app context
 */
export const initializeStore = (configObject, contextObject) => ({
  type: "INITIALIZE",
  configObject,
  contextObject
});

/**
 * Action for changing the local file.
 * @param {Number} fileIndex 
 */
export const changeFile = (fileIndex) => ({
  type: "FILE_CLICKED",
  fileIndex
});

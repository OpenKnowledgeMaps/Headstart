import { deselectPaper, selectPaper, zoomIn, zoomOut } from "../actions";
import DataManager from "../dataprocessing/managers/DataManager";
import { STREAMGRAPH_MODE } from "../reducers/chartType";
import { Config } from "../types";
import { createAnimationCallback } from "./eventhandlers";

/**
 * Function for when the browser back button is clicked.
 *
 * This function is the reason zoom-in and zoom-out actions are also queued
 * in the queue middleware.
 *
 * For a better user experience, it should be debounced.
 */
const handleZoomSelectQuery = (
  dataManager: DataManager,
  store: any,
  config: Config,
) => {
  const isStreamgraph = config.visualization_type === STREAMGRAPH_MODE;
  const params = new URLSearchParams(window.location.search);

  if (params.has("area") && params.has("paper")) {
    selectPaperWithZoom(dataManager, store, params, config);
    return;
  }

  if (params.has("area")) {
    deselectAndZoomIn(dataManager, store, params, config);
    return;
  }

  if (isStreamgraph && params.has("paper")) {
    selectPaperWithoutZoom(dataManager, store, params);
    return;
  }

  deselectAndZoomOut(store, config);
};

export default handleZoomSelectQuery;

const zoomKnowledgeMap = (
  dataManager: DataManager,
  store: any,
  areaID: string,
  paper?: any,
) => {
  const area = dataManager.areas.find((a) => a.area_uri == areaID);

  if (!area) {
    return;
  }

  store.dispatch(
    zoomIn(
      { title: area.title, uri: area.area_uri },
      createAnimationCallback(store.dispatch),
      store.getState().zoom,
      true,
      paper,
    ),
  );
};

const zoomStreamgraph = (
  dataManager: DataManager,
  store: any,
  streamID: string,
  paper?: any,
) => {
  const stream = dataManager.streams.find((s: any) => s.key == streamID) as any;

  if (!stream) {
    return;
  }

  store.dispatch(
    zoomIn(
      { title: stream.key, color: stream.color, docIds: stream.docIds },
      null,
      store.getState().zoom,
      true,
      paper,
    ),
  );
};

const selectPaperWithZoom = (
  dataManager: DataManager,
  store: any,
  params: any,
  config: Config,
) => {
  const isStreamgraph = config.visualization_type === STREAMGRAPH_MODE;
  const paper = dataManager.papers.find(
    (p) => p.safe_id === params.get("paper"),
  );

  if (!paper) {
    return;
  }

  // possible optimization: only selecting a paper if the area is the same

  const areaID = params.get("area");

  if (isStreamgraph) {
    return zoomStreamgraph(dataManager, store, areaID, paper);
  }

  zoomKnowledgeMap(dataManager, store, areaID, paper);
};

const selectPaperWithoutZoom = (
  dataManager: DataManager,
  store: any,
  params: any,
) => {
  const paper = dataManager.papers.find(
    (p) => p.safe_id === params.get("paper"),
  );

  if (!paper) {
    return;
  }

  store.dispatch(selectPaper(paper, true));
};

const deselectAndZoomIn = (
  dataManager: DataManager,
  store: any,
  params: any,
  config: Config,
) => {
  const isStreamgraph = config.visualization_type === STREAMGRAPH_MODE;
  const areaID = params.get("area");

  // possible optimization: only deselecting a paper if the area is the same
  // if (store.getState().selectedPaper) {
  //   store.dispatch(deselectPaper());
  // }

  if (isStreamgraph) {
    return zoomStreamgraph(dataManager, store, areaID);
  }

  zoomKnowledgeMap(dataManager, store, areaID);
};

const deselectAndZoomOut = (store: any, config: Config) => {
  const isStreamgraph = config.visualization_type === STREAMGRAPH_MODE;
  const { zoom, selectedPaper } = store.getState();

  if (zoom) {
    store.dispatch(
      zoomOut(
        isStreamgraph ? null : createAnimationCallback(store.dispatch),
        true,
      ),
    );

    return;
  }

  if (selectedPaper) {
    store.dispatch(deselectPaper(true));
  }
};

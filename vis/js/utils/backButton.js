import { deselectPaper, selectPaper, zoomIn, zoomOut } from "../actions";
import { createAnimationCallback } from "./eventhandlers";

/**
 * Function for when the browser back button is clicked.
 *
 * This function is the reason zoom-in and zoom-out actions are also queued
 * in the queue middleware.
 *
 * For a better user experience, it should be debounced.
 */
const handleZoomSelectQuery = (dataManager, store, config) => {
  const params = new URLSearchParams(window.location.search);

  if (params.has("area") && params.has("paper")) {
    selectPaperWithZoom(dataManager, store, params, config);
    return;
  }

  if (params.has("area")) {
    deselectAndZoomIn(dataManager, store, params, config);
    return;
  }

  if (config.is_streamgraph && params.has("paper")) {
    selectPaperWithoutZoom(dataManager, store, params);
    return;
  }

  deselectAndZoomOut(store, config);
};

export default handleZoomSelectQuery;

const zoomKnowledgeMap = (dataManager, store, areaID, paper) => {
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
      paper
    )
  );
};

const zoomStreamgraph = (dataManager, store, streamID, paper) => {
  const stream = dataManager.streams.find((s) => s.key == streamID);

  if (!stream) {
    return;
  }

  store.dispatch(
    zoomIn(
      { title: stream.key, color: stream.color, docIds: stream.docIds },
      null,
      store.getState().zoom,
      true,
      paper
    )
  );
};

const selectPaperWithZoom = (dataManager, store, params, config) => {
  const paper = dataManager.papers.find(
    (p) => p.safe_id === params.get("paper")
  );

  if (!paper) {
    return;
  }

  // possible optimization: only selecting a paper if the area is the same

  const areaID = params.get("area");

  if (config.is_streamgraph) {
    return zoomStreamgraph(dataManager, store, areaID, paper);
  }

  zoomKnowledgeMap(dataManager, store, areaID, paper);
};

const selectPaperWithoutZoom = (dataManager, store, params) => {
  const paper = dataManager.papers.find(
    (p) => p.safe_id === params.get("paper")
  );

  if (!paper) {
    return;
  }

  store.dispatch(selectPaper(paper, true));
};

const deselectAndZoomIn = (dataManager, store, params, config) => {
  const areaID = params.get("area");

  // possible optimization: only deselecting a paper if the area is the same
  // if (store.getState().selectedPaper) {
  //   store.dispatch(deselectPaper());
  // }

  if (config.is_streamgraph) {
    return zoomStreamgraph(dataManager, store, areaID);
  }

  zoomKnowledgeMap(dataManager, store, areaID);
};

const deselectAndZoomOut = (store, config) => {
  const { zoom, selectedPaper } = store.getState();

  if (zoom) {
    store.dispatch(
      zoomOut(
        config.is_streamgraph ? null : createAnimationCallback(store.dispatch),
        true
      )
    );

    return;
  }

  if (selectedPaper) {
    store.dispatch(deselectPaper(true));
  }
};

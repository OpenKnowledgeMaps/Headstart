import { zoomIn, zoomOut } from "../actions";

import { createAnimationCallback } from "./eventhandlers";

/**
 * Function for when the browser back button is clicked.
 *
 * This function is the reason zoom-in and zoom-out actions are also queued
 * in the queue middleware.
 *
 * For a better user experience, it should be debounced.
 */
const onBackButtonClick = (dataManager, store, config) => {
  const queryParams = new URLSearchParams(window.location.search);

  if (!queryParams.has("area")) {
    if (config.is_streamgraph && queryParams.has("paper")) {
      removeQueryParams("paper");
    }
    store.dispatch(zoomOut(createAnimationCallback(store.dispatch), true));

    return;
  }

  // this can be optimized: if the area is the same as before, simply
  // deselect the paper or select a different one

  if (queryParams.has("area") && !queryParams.has("paper")) {
    zoomUrlArea(dataManager, store, config);

    return;
  }

  if (queryParams.has("paper")) {
    selectUrlPaper(dataManager, store, config);
  }
};

export default onBackButtonClick;

/**
 * Selects the paper that's specified in the query params.
 */
export const selectUrlPaper = (dataManager, store, config) => {
  if (config.is_streamgraph) {
    // paper cannot be selected in streamgraph
    removeQueryParams("area", "paper");
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (!params.has("paper")) {
    return;
  }

  const zoomedPaper = params.get("paper");

  const paper = dataManager.papers.find((p) => p.safe_id === zoomedPaper);

  if (!paper) {
    return;
  }

  store.dispatch(
    zoomIn(
      { title: paper.area, uri: paper.area_uri },
      createAnimationCallback(store.dispatch),
      store.getState().zoom,
      true,
      paper
    )
  );
};

/**
 * Zooms into an area that's specified in the query params.
 *
 * IMPORTANT: expects to be bound with the HeadstartRunner's this.
 */
export const zoomUrlArea = (dataManager, store, config) => {
  const params = new URLSearchParams(window.location.search);

  if (!params.has("area")) {
    return;
  }

  const zoomedArea = params.get("area");

  if (config.is_streamgraph) {
    // this is a workaround that simply zooms out
    // TODO implement a proper solution for streamgraph
    removeQueryParams("area");
    store.dispatch(zoomOut(createAnimationCallback(store.dispatch), true));
    return;
  }

  const area = dataManager.papers.find((a) => a.area_uri == zoomedArea);

  if (!area) {
    return;
  }

  store.dispatch(
    zoomIn(
      { title: area.area, uri: area.area_uri },
      createAnimationCallback(store.dispatch),
      store.getState().zoom,
      true
    )
  );
};

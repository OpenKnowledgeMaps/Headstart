import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import $ from "jquery";

import rootReducer from "./reducers";
import {
  ALLOWED_IN_ANIMATION,
  NOT_QUEUED_IN_ANIMATION,
  initializeStore,
  updateDimensions,
  applyForceAreas,
  applyForcePapers,
  preinitializeStore,
  zoomIn,
  zoomOut,
} from "./actions";

import { STREAMGRAPH_MODE } from "./reducers/chartType";

import { applyForce } from "./utils/force";
import logAction from "./utils/actionLogger";

import { getChartSize, getListSize } from "./utils/dimensions";
import Headstart from "./components/Headstart";
import { createAnimationCallback } from "./utils/eventhandlers";
import { removeQueryParams, handleUrlAction } from "./utils/url";
import debounce from "./utils/debounce";
import { handleTitleAction } from "./utils/title";
import DataManager from "./datamanagers/DataManager";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(config, rescaleCallback) {
    this.config = config;
    this.dataManager = new DataManager(config);

    this.originalTitle = "";
    this.actionQueue = [];

    const middleware = applyMiddleware(
      createActionQueueMiddleware(this),
      createScrollMiddleware(),
      createRepeatedInitializeMiddleware(this),
      createChartTypeMiddleware(),
      createRescaleMiddleware(rescaleCallback),
      createRecordActionMiddleware(),
      createQueryParameterMiddleware(),
      createPageTitleMiddleware(this)
    );

    this.store = createStore(rootReducer, middleware);
  }

  renderFrontend() {
    this.originalTitle = document.title;

    this.store.dispatch(preinitializeStore(this.config));

    ReactDOM.render(
      <Provider store={this.store}>
        <Headstart />
      </Provider>,
      document.getElementById("app-container")
    );

    window.addEventListener(
      "popstate",
      debounce(this.onBackButtonClick.bind(this), 300)
    );
  }

  initStore(backendData) {
    const config = this.config;
    const { size, width, height } = getChartSize(config);

    this.dataManager.parseData(backendData, size);

    const context = this.dataManager.context;

    const list = getListSize(config, context, size);

    this.store.dispatch(
      initializeStore(
        config,
        context,
        this.dataManager.papers,
        this.dataManager.areas,
        this.dataManager.streams,
        size,
        width,
        height,
        list.height,
        this.dataManager.scalingFactors
      )
    );

    if (!this.config.is_streamgraph) {
      this.applyForceLayout();
    }

    // enable this for ability to share link to a zoomed bubble / paper
    // if (queryParams.has("paper")) {
    //   this.selectUrlPaper();
    // } else {
    //   this.zoomUrlArea();
    // }
    // remove the following lines if the previous line is uncommented
    const queryParams = new URLSearchParams(window.location.search);
    const paramsToRemove = [];
    if (queryParams.has("area")) {
      paramsToRemove.push("area");
    }
    if (queryParams.has("paper")) {
      paramsToRemove.push("paper");
    }
    if (paramsToRemove.length > 0) {
      removeQueryParams(...paramsToRemove);
    }
  }

  /**
   * Function for when the browser back button is clicked.
   *
   * This function is the reason zoom-in and zoom-out actions are also queued
   * in the queue middleware.
   *
   * For a better user experience, it should be debounced.
   */
  onBackButtonClick() {
    const queryParams = new URLSearchParams(window.location.search);

    if (!queryParams.has("area")) {
      if (this.config.is_streamgraph && queryParams.has("paper")) {
        removeQueryParams("paper");
      }
      this.store.dispatch(
        zoomOut(createAnimationCallback(this.store.dispatch), true)
      );

      return;
    }

    // this can be optimized: if the area is the same as before, simply
    // deselect the paper or select a different one

    if (queryParams.has("area") && !queryParams.has("paper")) {
      this.zoomUrlArea();

      return;
    }

    if (queryParams.has("paper")) {
      this.selectUrlPaper();
    }
  }

  /**
   * Selects the paper that's specified in the query params.
   */
  selectUrlPaper() {
    if (this.config.is_streamgraph) {
      // paper cannot be selected in streamgraph
      removeQueryParams("area", "paper");
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (!params.has("paper")) {
      return;
    }

    const zoomedPaper = params.get("paper");

    const paper = this.dataManager.papers.find(
      (p) => p.safe_id === zoomedPaper
    );

    if (!paper) {
      return;
    }

    this.store.dispatch(
      zoomIn(
        { title: paper.area, uri: paper.area_uri },
        createAnimationCallback(this.store.dispatch),
        this.store.getState().zoom,
        true,
        paper
      )
    );
  }

  /**
   * Zooms into an area that's specified in the query params.
   */
  zoomUrlArea() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has("area")) {
      return;
    }

    const zoomedArea = params.get("area");

    if (this.config.is_streamgraph) {
      // the instant zoom in doesn't work for streamgraph, because the data is not processed here yet (this.streamData)
      // proper data processing refactoring is necessary
      // this is a workaround that simply zooms out
      removeQueryParams("area");
      this.store.dispatch(
        zoomOut(createAnimationCallback(this.store.dispatch), true)
      );
      return;
    }

    const area = this.dataManager.papers.find((a) => a.area_uri == zoomedArea);

    if (!area) {
      return;
    }

    this.store.dispatch(
      zoomIn(
        { title: area.area, uri: area.area_uri },
        createAnimationCallback(this.store.dispatch),
        this.store.getState().zoom,
        true
      )
    );
  }

  // triggered on window resize
  updateDimensions() {
    const chart = getChartSize(this.config, this.dataManager.context);
    const list = getListSize(this.config, this.dataManager.context, chart.size);
    this.store.dispatch(updateDimensions(chart, list));
  }

  // used after each INITIALIZE
  applyForceLayout() {
    const state = this.store.getState();
    applyForce(
      state.areas.list,
      state.data.list,
      state.chart.width,
      (newAreas) =>
        this.store.dispatch(applyForceAreas(newAreas, state.chart.height)),
      (newPapers) =>
        this.store.dispatch(applyForcePapers(newPapers, state.chart.height)),
      {
        areasAlpha: this.getAreasForceAlpha(this.dataManager.papers.length),
        isForceAreas: this.config.is_force_areas,
        papersAlpha: this.getPapersForceAlpha(this.dataManager.papers.length),
        isForcePapers: this.config.is_force_papers,
      }
    );
  }

  /**
   * Returns alpha value needed for the force layout.
   *
   * The alpha values are adopted from the legacy code.
   *
   * @param {number} numOfPapers how many papers are in the vis
   *
   * @returns paper force layout alpha value
   */
  getPapersForceAlpha(numOfPapers) {
    if (!this.config.is_force_papers || !this.config.dynamic_force_papers) {
      return this.config.papers_force_alpha;
    }
    if (numOfPapers < 150) {
      return this.config.papers_force_alpha;
    }
    if (numOfPapers < 200) {
      return 0.2;
    }
    if (numOfPapers < 350) {
      return 0.3;
    }
    if (numOfPapers < 500) {
      return 0.4;
    }

    return 0.6;
  }

  /**
   * Returns alpha value needed for the force layout.
   *
   * The alpha values are adopted from the legacy code.
   *
   * @param {number} numOfPapers how many papers are in the vis
   *
   * @returns area force layout alpha value
   */
  getAreasForceAlpha(numOfPapers) {
    if (!this.config.is_force_area || !this.config.dynamic_force_area) {
      return this.config.area_force_alpha;
    }

    if (numOfPapers < 200) {
      return this.config.area_force_alpha;
    }

    return 0.02;
  }
}

/**
 * Creates an action-queuing middleware.
 *
 * When the chart is animated, most actions must not be triggered. This middleware
 * cancels them and saves them in a queue. They are fired again after the animation
 * finishes.
 *
 * It cancels all actions but those in ALLOWED_IN_ANIMATION. Those actions are then
 * queued (except those in NOT_QUEUED_IN_ANIMATION).
 *
 * @param {Object} intermediate the intermediate instance (this)
 */
function createActionQueueMiddleware(intermediate) {
  return ({ getState }) => {
    return (next) => (action) => {
      const actionQueue = intermediate.actionQueue;
      const dispatch = intermediate.store.dispatch;

      if (getState().animation !== null) {
        if (!ALLOWED_IN_ANIMATION.includes(action.type)) {
          if (
            !NOT_QUEUED_IN_ANIMATION.includes(action.type) ||
            action.isFromBackButton
          ) {
            actionQueue.push({ ...action });
          }
          action.canceled = true;
          return next(action);
        }
      }

      const returnValue = next(action);

      if (action.type === "STOP_ANIMATION") {
        while (actionQueue.length > 0) {
          const queuedAction = actionQueue.shift();
          if (!NOT_QUEUED_IN_ANIMATION.includes(queuedAction.type)) {
            dispatch(queuedAction);
          } else {
            requestAnimationFrame(() => {
              dispatch(queuedAction);
            });
          }
        }
      }

      return returnValue;
    };
  };
}

/**
 * Creates a middleware that scrolls to a previously selected paper
 * after a zoom out.
 */
function createScrollMiddleware() {
  return ({ getState }) => {
    return (next) => (action) => {
      const selectedPaper = getState().selectedPaper;
      const returnValue = next(action);
      if (action.type === "ZOOM_OUT") {
        if (selectedPaper !== null) {
          scrollList(selectedPaper.safeId);
        } else {
          scrollList();
        }
      }

      if (action.type === "ZOOM_IN") {
        scrollList();
      }

      return returnValue;
    };
  };
}

/**
 * Scrolls the list on the next animation frame.
 *
 * @param {String} safeId if specified, scrolls to that paper
 */
function scrollList(safeId) {
  requestAnimationFrame(() => {
    let scrollTop = 0;
    if (safeId) {
      scrollTop = $("#" + safeId).offset().top - $("#papers_list").offset().top;
    }
    $("#papers_list").animate({ scrollTop }, 0);
  });
}

/**
 * Creates a middleware that reapplies the force layout after
 * each additional initialization.
 *
 * Used in Viper rescaling
 *
 * @param {Object} intermediate the intermediate instance (this)
 */
function createRepeatedInitializeMiddleware(intermediate) {
  return ({ getState }) => {
    return (next) => (action) => {
      const data = getState().data.list;
      const returnValue = next(action);
      if (action.type === "INITIALIZE" && data.length > 0) {
        intermediate.applyForceLayout();
      }

      return returnValue;
    };
  };
}

/**
 * Creates a middleware that adds a boolean 'isStreamgraph' to each action.
 */
function createChartTypeMiddleware() {
  return ({ getState }) => {
    return (next) => (action) => {
      action.isStreamgraph = getState().chartType === STREAMGRAPH_MODE;
      return next(action);
    };
  };
}

/**
 * Creates a middleware that calls the rescaling function on the 'SCALE' action.
 *
 * @param {Function} rescaleCallback function that rescales the map
 */
function createRescaleMiddleware(rescaleCallback) {
  return () => {
    return (next) => (action) => {
      if (action.type === "SCALE") {
        rescaleCallback(
          action.value,
          action.baseUnit,
          action.contentBased,
          action.sort
        );
      }
      return next(action);
    };
  };
}

function createRecordActionMiddleware() {
  return function ({ getState }) {
    return (next) => (action) => {
      if (!action.canceled) {
        const state = getState();
        logAction(action, state);
      }
      return next(action);
    };
  };
}

function createQueryParameterMiddleware() {
  return function () {
    return (next) => (action) => {
      if (!action.canceled && !action.isFromBackButton) {
        handleUrlAction(action);
      }

      return next(action);
    };
  };
}

function createPageTitleMiddleware(itm) {
  return function ({ getState }) {
    return (next) => (action) => {
      if (!action.canceled && !action.isFromBackButton) {
        const state = getState();
        handleTitleAction(action, itm.originalTitle, state);
      }

      return next(action);
    };
  };
}

export default Intermediate;

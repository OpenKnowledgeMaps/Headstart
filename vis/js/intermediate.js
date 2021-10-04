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
import { sanitizeInputData } from "./utils/data";
import { createAnimationCallback } from "./utils/eventhandlers";
import { addQueryParam, removeQueryParam } from "./utils/url";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(rescaleCallback, recordActionCallback) {
    this.actionQueue = [];

    this.recordActionCallback = recordActionCallback;
    this.recordActionParams = {};

    const middleware = applyMiddleware(
      createFileChangeMiddleware(),
      createActionQueueMiddleware(this),
      createScrollMiddleware(),
      createRepeatedInitializeMiddleware(this),
      createChartTypeMiddleware(),
      createRescaleMiddleware(rescaleCallback),
      createRecordActionMiddleware(
        this.recordAction.bind(this),
        this.recordActionParams
      ),
      createZoomParameterMiddleware()
    );

    this.store = createStore(rootReducer, middleware);
  }

  renderFrontend(config) {
    this.config = config;

    this.store.dispatch(preinitializeStore(config));

    ReactDOM.render(
      <Provider store={this.store}>
        <Headstart />
      </Provider>,
      document.getElementById("app-container")
    );

    window.addEventListener("popstate", this.onBackButtonClick.bind(this));
  }

  initStore(config, context, mapData, streamData) {
    const { size, width, height } = getChartSize(config, context);
    const list = getListSize(config, context, size);

    Object.assign(this.recordActionParams, {
      title: config.title,
      user: config.user_id,
      localization: config.localization[config.language],
      mouseoverEvaluation: config.enable_mouseover_evaluation,
      scaleLabel: config.scale_label,
    });

    this.config = config;
    this.sanitizedMapData = sanitizeInputData(mapData);
    this.streamData = streamData;

    this.store.dispatch(
      initializeStore(
        config,
        context,
        this.sanitizedMapData,
        this.streamData,
        size,
        width,
        height,
        list.height
      )
    );

    if (!config.is_streamgraph) {
      this.forceLayoutParams = {
        areasAlpha: config.area_force_alpha,
        isForceAreas: config.is_force_areas,
        papersAlpha: config.papers_force_alpha,
        isForcePapers: config.is_force_papers,
      };

      this.applyForceLayout();
    }

    this.zoomToUrlArea();
  }

  onBackButtonClick() {
    // this almost works: the only problem is that fast back button clicking
    // ends up on a wrong bubble (because of canceled animations)
    //const queryParams = new URLSearchParams(window.location.search);
    //if (queryParams.has("area")) {
    //  return this.zoomToUrlArea();
    //}

    this.store.dispatch(zoomOut(createAnimationCallback(this.store.dispatch), true));
  }

  /**
   * After startup, if there's a query param 'area' in the url, zoom in to it immediately.
   */
  zoomToUrlArea() {
    const params = new URLSearchParams(window.location.search);

    if (!params.has("area")) {
      return;
    }

    const zoomedArea = params.get("area");

    if (this.config.is_streamgraph) {
      // the instant zoom in doesn't work for streamgraph, because the data is not processed here yet (this.streamData)
      return removeQueryParam("area");
    }

    const area = this.sanitizedMapData.find((a) => a.area_uri == zoomedArea);

    if (!area) {
      return;
    }

    this.store.dispatch(
      zoomIn(
        { title: area.title, uri: area.area_uri },
        createAnimationCallback(this.store.dispatch),
        this.store.getState().zoom,
        true
      )
    );
  }

  // triggered on window resize
  updateDimensions(config, context) {
    const chart = getChartSize(config, context);
    const list = getListSize(config, context, chart.size);
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
      this.forceLayoutParams
    );
  }

  /**
   * Log an action using the mediator's function.
   *
   * @param {string} id usually some title, e.g. paper.title / default is the config.title
   * @param {string} category some static key, such as "List"
   * @param {string} action some static key, such as "show"
   * @param {string} type some static key, such as "open_embed_modal"
   * @param {object} timestamp optional object / default is null
   * @param {string} additionalParams optional string / default is null
   * @param {object} postData optional object / default is null
   */
  recordAction(
    id,
    category,
    action,
    type,
    timestamp = null,
    additionalParams = null,
    postData = null
  ) {
    this.recordActionCallback(
      id,
      category,
      action,
      this.recordActionParams.user,
      type,
      timestamp,
      additionalParams,
      postData
    );
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
          if (!NOT_QUEUED_IN_ANIMATION.includes(action.type)) {
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
          dispatch(queuedAction);
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

function createFileChangeMiddleware() {
  return function ({ getState }) {
    return (next) => (action) => {
      if (action.type === "FILE_CLICKED") {
        if (getState().files.current !== action.fileIndex) {
          window.headstartInstance.tofile(action.fileIndex);
        }
      }
      return next(action);
    };
  };
}

function createRecordActionMiddleware(callback, params) {
  return function ({ getState }) {
    return (next) => (action) => {
      const state = getState();
      logAction(action, state, callback, params);
      return next(action);
    };
  };
}

function createZoomParameterMiddleware() {
  return function () {
    return (next) => (action) => {
      if (
        action.type === "ZOOM_IN" &&
        !action.canceled &&
        action.selectedAreaData &&
        !action.noHistory
      ) {
        addQueryParam(
          "area",
          action.selectedAreaData.uri
            ? action.selectedAreaData.uri
            : action.selectedAreaData.title
        );
      }
      if (action.type === "ZOOM_OUT" && !action.canceled && !action.isBackButton) {
        removeQueryParam("area");
      }
      return next(action);
    };
  };
}

export default Intermediate;

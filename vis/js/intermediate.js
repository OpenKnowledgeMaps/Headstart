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
} from "./actions";

import { STREAMGRAPH_MODE } from "./reducers/chartType";

import { applyForce } from "./utils/force";
import logAction from "./utils/actionLogger";

import { getChartSize, getListSize } from "./utils/dimensions";
import Headstart from "./components/Headstart";
import { sanitizeInputData } from "./utils/data";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(rescaleCallback) {
    this.actionQueue = [];

    const middleware = applyMiddleware(
      createFileChangeMiddleware(),
      createActionQueueMiddleware(this),
      createScrollMiddleware(),
      createRepeatedInitializeMiddleware(this),
      createChartTypeMiddleware(),
      createRescaleMiddleware(rescaleCallback),
      createRecordActionMiddleware()
    );

    this.store = createStore(rootReducer, middleware);
  }

  renderFrontend(config) {
    this.store.dispatch(preinitializeStore(config));

    ReactDOM.render(
      <Provider store={this.store}>
        <Headstart />
      </Provider>,
      document.getElementById("app-container")
    );
  }

  initStore(config, context, mapData, streamData) {
    const { size, width, height } = getChartSize(config, context);
    const list = getListSize(config, context, size);

    const sanitizedMapData = sanitizeInputData(mapData);

    this.store.dispatch(
      initializeStore(
        config,
        context,
        sanitizedMapData,
        streamData,
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

function createRecordActionMiddleware() {
  return function ({ getState }) {
    return (next) => (action) => {
      const state = getState();
      logAction(action, state);
      return next(action);
    };
  };
}

export default Intermediate;

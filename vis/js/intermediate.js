"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import {
  ALLOWED_IN_ANIMATION,
  NOT_QUEUED_IN_ANIMATION,
  zoomInFromMediator,
  zoomOutFromMediator,
  initializeStore,
  deselectPaper,
  updateDimensions,
  applyForceAreas,
  applyForcePapers,
} from "./actions";

import { STREAMGRAPH_MODE } from "./reducers/chartType";

import SubdisciplineTitle from "./templates/SubdisciplineTitle";
import AuthorImage from "./components/AuthorImage";
import List from "./components/List";
import KnowledgeMap from "./components/KnowledgeMap";
import ModalButtons from "./components/ModalButtons";
import Modals from "./components/Modals";
import Toolbar from "./components/Toolbar";

import { applyForce } from "./utils/force";
import CreatedBy from "./templates/CreatedBy";
import logAction from "./utils/actionLogger";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(
    modern_frontend_enabled,
    streamgraphZoomOutCallback,
    entryBacklinkClickCallback,
    rescaleCallback,
    recordActionCallback
  ) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.actionQueue = [];

    this.recordActionCallback = recordActionCallback;
    this.recordActionParams = {};

    const middleware = applyMiddleware(
      createZoomOutMiddleware(streamgraphZoomOutCallback),
      createFileChangeMiddleware(),
      createEntryBacklinkClickMiddleware(entryBacklinkClickCallback),
      createActionQueueMiddleware(this),
      createScrollMiddleware(),
      createRepeatedInitializeMiddleware(this),
      createChartTypeMiddleware(),
      createRescaleMiddleware(rescaleCallback),
      createRecordActionMiddleware(
        this.recordAction.bind(this),
        this.recordActionParams
      )
    );

    this.store = createStore(rootReducer, middleware);
  }

  init(config, context, data, size) {
    Object.assign(this.recordActionParams, {
      title: config.title,
      user: config.user_id,
      localization: config.localization[config.language],
      mouseoverEvaluation: config.enable_mouseover_evaluation,
      scaleLabel: config.scale_label,
    });

    this.store.dispatch(initializeStore(config, context, data, size));

    // TODO replace the config.is_authorview with store variable
    // after components are wrapped
    ReactDOM.render(
      <Provider store={this.store}>
        {config.is_authorview && <AuthorImage />}
        <SubdisciplineTitle />
      </Provider>,
      document.getElementById("mvp_container")
    );
  }

  /**
   * List cannot be rendered with the initial components (heading etc.),
   * so it has its own separate function.
   */
  renderList() {
    ReactDOM.render(
      <Provider store={this.store}>
        <List />
      </Provider>,
      document.getElementById("list-col")
    );
  }

  renderKnowledgeMap(config) {
    ReactDOM.render(
      <Provider store={this.store}>
        <KnowledgeMap />
      </Provider>,
      document.getElementById("headstart-chart")
    );

    this.forceLayoutParams = {
      areasAlpha: config.area_force_alpha,
      isForceAreas: config.is_force_areas,
      papersAlpha: config.papers_force_alpha,
      isForcePapers: config.is_force_papers,
    };

    this.applyForceLayout();
  }

  renderPeripherals() {
    ReactDOM.render(
      <Provider store={this.store}>
        <ModalButtons />
        <Modals />
      </Provider>,
      document.getElementById("modals")
    );

    ReactDOM.render(
      <Provider store={this.store}>
        <Toolbar />
      </Provider>,
      document.getElementById("toolbar")
    );

    ReactDOM.render(
      <Provider store={this.store}>
        <CreatedBy />
      </Provider>,
      document.getElementById("created_by")
    );
  }

  // used in streamgraph
  zoomIn(selectedAreaData) {
    this.store.dispatch(zoomInFromMediator(selectedAreaData));
  }

  // used in streamgraph
  zoomOut() {
    this.store.dispatch(zoomOutFromMediator());
  }

  // used in streamgraph
  deselectPaper() {
    this.store.dispatch(deselectPaper());
  }

  // used after start and then on window resize
  updateDimensions(chart, list) {
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

function createEntryBacklinkClickMiddleware(entryBacklinkClickCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "DESELECT_PAPER_BACKLINK") {
        entryBacklinkClickCallback();
      }
      return next(action);
    };
  };
}

function createZoomOutMiddleware(streamgraphZoomOutCallback) {
  return function ({ getState }) {
    return (next) => (action) => {
      if (action.type == "ZOOM_OUT" && action.not_from_mediator) {
        if (getState().chartType === STREAMGRAPH_MODE) {
          streamgraphZoomOutCallback();
        }
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

function createFileChangeMiddleware() {
  return function ({ getState }) {
    return (next) => (action) => {
      if (action.type == "FILE_CLICKED") {
        if (getState().files.current !== action.fileIndex) {
          window.headstartInstance.tofile(action.fileIndex);
        }
      }
      const returnValue = next(action);
      returnValue;
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

export default Intermediate;

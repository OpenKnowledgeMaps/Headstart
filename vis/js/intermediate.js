"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import {
  ALLOWED_IN_ANIMATION,
  zoomInFromMediator,
  zoomOutFromMediator,
  initializeStore,
  showList,
  selectPaperFromMediator,
  deselectPaper,
  setListHeight,
  updateDimensions,
  applyForceAreas,
  applyForcePapers,
} from "./actions";

import { STREAMGRAPH_MODE } from "./reducers/chartType";

import SubdisciplineTitle from "./templates/SubdisciplineTitle";
import AuthorImage from "./components/AuthorImage";
import List from "./components/List";
import KnowledgeMap from "./components/KnowledgeMap";

import { applyForce } from "./utils/force";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(
    modern_frontend_enabled,
    knowledgeMapZoomOutCallback,
    streamgraphZoomOutCallback,
    listToggleCallback,
    searchCallback,
    filterCallback,
    areaClickCallback,
    areaMouseoverCallback,
    areaMouseoutCallback,
    previewPopoverCallback,
    titleClickCallback,
    entryBacklinkClickCallback
  ) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.actionQueue = [];

    let middleware = undefined;
    if (modern_frontend_enabled) {
      middleware = applyMiddleware(
        createZoomOutMiddleware(
          knowledgeMapZoomOutCallback,
          streamgraphZoomOutCallback
        ),
        createFileChangeMiddleware(),
        createPreviewPopoverMiddleware(previewPopoverCallback),
        createEntryBacklinkClickMiddleware(entryBacklinkClickCallback),
        createActionQueueMiddleware(this),
        createScrollMiddleware(),
        createRepeatedInitializeMiddleware(this),
        createChartTypeMiddleware()
      );
    } else {
      middleware = applyMiddleware(
        createZoomOutMiddleware(
          knowledgeMapZoomOutCallback,
          streamgraphZoomOutCallback
        ),
        createFileChangeMiddleware(),
        createListToggleMiddleware(listToggleCallback),
        createSearchMiddleware(searchCallback),
        createFilterMiddleware(filterCallback),
        createAreaClickMiddleware(areaClickCallback),
        createAreaMouseoverMiddleware(areaMouseoverCallback),
        createAreaMouseoutMiddleware(areaMouseoutCallback),
        createPreviewPopoverMiddleware(previewPopoverCallback),
        createTitleClickMiddleware(titleClickCallback),
        createEntryBacklinkClickMiddleware(entryBacklinkClickCallback)
      );
    }

    this.store = createStore(rootReducer, middleware);
  }

  init(config, context, data, size) {
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

  zoomIn(selectedAreaData) {
    this.store.dispatch(zoomInFromMediator(selectedAreaData));
  }

  zoomOut() {
    this.store.dispatch(zoomOutFromMediator());
  }

  showList() {
    this.store.dispatch(showList());
  }

  selectPaper(safeId) {
    this.store.dispatch(selectPaperFromMediator(safeId));
  }

  deselectPaper() {
    this.store.dispatch(deselectPaper());
  }

  setListHeight(newHeight) {
    this.store.dispatch(setListHeight(newHeight));
  }

  updateDimensions(chart, list) {
    this.store.dispatch(updateDimensions(chart, list));
  }

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
 * It queues all actions but those in ALLOWED_IN_ANIMATION.
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
          actionQueue.push({ ...action });
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
      if (action.type === "ZOOM_OUT" && selectedPaper !== null) {
        setTimeout(() => {
          $("#papers_list").animate(
            {
              scrollTop:
                $("#" + selectedPaper.safeId).offset().top -
                $("#papers_list").offset().top,
            },
            0
          );
        }, 80);
      }

      return returnValue;
    };
  };
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

function createChartTypeMiddleware() {
  return ({ getState }) => {
    return (next) => (action) => {
      action.isStreamgraph = getState().chartType === STREAMGRAPH_MODE;
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

function createTitleClickMiddleware(titleClickCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "SELECT_PAPER" && action.not_from_mediator) {
        titleClickCallback(action.paper);
      }
      return next(action);
    };
  };
}

function createSearchMiddleware(searchCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "SEARCH") {
        searchCallback(action.text);
      }
      return next(action);
    };
  };
}

function createFilterMiddleware(filterCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "FILTER") {
        filterCallback(action.id);
      }
      return next(action);
    };
  };
}

function createListToggleMiddleware(listToggleCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "TOGGLE_LIST") {
        listToggleCallback();
      }
      return next(action);
    };
  };
}

function createZoomOutMiddleware(
  knowledgeMapZoomOutCallback,
  streamgraphZoomOutCallback
) {
  return function ({ getState }) {
    const self = this;
    return (next) => (action) => {
      if (action.type == "ZOOM_OUT" && action.not_from_mediator) {
        if (getState().chartType === STREAMGRAPH_MODE) {
          streamgraphZoomOutCallback();
        } else {
          //knowledgeMapZoomOutCallback();
        }
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

function createFileChangeMiddleware() {
  return function ({ getState }) {
    const self = this;
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

function createAreaClickMiddleware(areaClickCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "ZOOM_IN" && action.source === "list-area") {
        let d = Object.assign({}, action.selectedAreaData);
        d.area_uri = d.uri;
        d.area = d.title;
        areaClickCallback(d);
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

function createAreaMouseoverMiddleware(areaMouseoverCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "HIGHLIGHT_AREA" && action.paper !== null) {
        areaMouseoverCallback(action.paper);
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

function createAreaMouseoutMiddleware(areaMouseoutCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "HIGHLIGHT_AREA" && action.paper === null) {
        areaMouseoutCallback({});
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

function createPreviewPopoverMiddleware(previewPopoverCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "SHOW_PREVIEW") {
        previewPopoverCallback(action.paper);
      }
      const returnValue = next(action);
      returnValue;
    };
  };
}

export default Intermediate;

"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import {
  zoomInFromMediator,
  zoomOutFromMediator,
  initializeStore,
  setItemsCount,
  showList,
} from "./actions";

import { STREAMGRAPH_MODE } from "./reducers/chartType";

import SubdisciplineTitle from "./templates/SubdisciplineTitle";
import AuthorImage from "./components/AuthorImage";
import ListToggle from "./components/ListToggle";
import FilterSort from "./components/FilterSort";

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
    sortCallback,
    filterCallback
  ) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.store = createStore(
      rootReducer,
      applyMiddleware(
        createZoomOutMiddleware(
          knowledgeMapZoomOutCallback,
          streamgraphZoomOutCallback
        ),
        createFileChangeMiddleware(),
        createListToggleMiddleware(listToggleCallback),
        createSearchMiddleware(searchCallback),
        createSortMiddleware(sortCallback),
        createFilterMiddleware(filterCallback)
      )
    );
  }

  init(config, context) {
    this.store.dispatch(initializeStore(config, context));

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
    if (this.modern_frontend_enabled) {
      console.warn(
        "*** FRONTEND FLAG ENABLED - new React elements rendered ***"
      );

      ReactDOM.render(
        <Provider store={this.store}>
          <ListToggle />
        </Provider>,
        document.getElementById("show_hide_button")
      );

      ReactDOM.render(
        <Provider store={this.store}>
          <FilterSort />
        </Provider>,
        document.getElementById("explorer_options")
      );
    }
  }

  zoomIn(selectedAreaData) {
    this.store.dispatch(zoomInFromMediator(selectedAreaData));
  }

  zoomOut() {
    this.store.dispatch(zoomOutFromMediator());
  }

  changeItemsCount(count) {
    // TODO refactor when possible to a non-setter action (or no action at all)
    this.store.dispatch(setItemsCount(count));
  }

  showList() {
    this.store.dispatch(showList());
  }
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

function createSortMiddleware(sortCallback) {
  return function () {
    return (next) => (action) => {
      if (action.type == "SORT") {
        sortCallback(action.id);
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
          knowledgeMapZoomOutCallback();
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

export default Intermediate;

"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import {
  zoomInFromMediator,
  zoomOutFromMediator,
  setKnowledgeMap,
  setStreamgraph,
  initializeStore,
} from "./actions";

import SubdisciplineTitle from "./components/SubdisciplineTitle";

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
    streamgraphZoomOutCallback
  ) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.store = createStore(
      rootReducer,
      applyMiddleware(
        createZoomOutMiddleware(
          knowledgeMapZoomOutCallback,
          streamgraphZoomOutCallback
        ),
        createFileChangeMiddleware()
      )
    );
  }

  init(config, context) {
    this.store.dispatch(initializeStore(config, context));

    if (this.modern_frontend_enabled) {
      console.warn(
        "*** MODERN FRONTEND ENABLED - some React elements rendered ***"
      );
      ReactDOM.render(
        <Provider store={this.store}>
          <SubdisciplineTitle />
        </Provider>,
        document.getElementById("subdiscipline_title")
      );
    }
  }

  zoomIn(selectedAreaData) {
    this.store.dispatch(zoomInFromMediator(selectedAreaData));
  }

  zoomOut() {
    this.store.dispatch(zoomOutFromMediator());
  }

  setKnowledgeMap() {
    this.store.dispatch(setKnowledgeMap());
  }

  setStreamgraph() {
    this.store.dispatch(setStreamgraph());
  }
}

function createZoomOutMiddleware(
  knowledgeMapZoomOutCallback,
  streamgraphZoomOutCallback
) {
  return function ({ getState }) {
    const self = this;
    return (next) => (action) => {
      if (action.type == "ZOOM_OUT" && action.not_from_mediator) {
        if (getState().chartType === "streamgraph") {
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

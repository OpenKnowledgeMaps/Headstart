"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import { zoomInFromMediator, zoomOutFromMediator, setKnowledgeMap, setStreamgraph } from "./actions";

import Backlink from "./components/Backlink";

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
    this.store = createStore(rootReducer, applyMiddleware(createZoomOutMiddleware(
      knowledgeMapZoomOutCallback,
      streamgraphZoomOutCallback
      )));
  }

  init() {
    if (this.modern_frontend_enabled) {
      console.warn("*** MODERN FRONTEND ENABLED - some React elements rendered ***");
      ReactDOM.render(
        <Provider store={this.store}><Backlink /></Provider>,
        document.getElementById("backlink_container")
      );
    }
  }

  zoomIn() {
    this.store.dispatch(zoomInFromMediator())
  }

  zoomOut() {
    this.store.dispatch(zoomOutFromMediator())
  }

  setKnowledgeMap() {
    this.store.dispatch(setKnowledgeMap())
  }

  setStreamgraph() {
    this.store.dispatch(setStreamgraph())
  }
}

function createZoomOutMiddleware(knowledgeMapZoomOutCallback, streamgraphZoomOutCallback) {
  return function ({getState}) {
    const self = this;
    return next => action => {
      if(action.type == "ZOOM_OUT" && action.not_from_mediator ) {
        if (getState().chartType === 'streamgraph') {
          streamgraphZoomOutCallback()
        } else {
          knowledgeMapZoomOutCallback()
        }
      }
      const returnValue = next(action)
      returnValue
    }
  }
}

export default Intermediate;

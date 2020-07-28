"use strict";

import ReactDOM from "react-dom";
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import { zoomInFromMediator, zoomOutFromMediator, setNormalChart, setStreamgraph } from "./actions";

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
    normalZoomOutCallback,
    streamgraphZoomOutCallback
    ) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.store = createStore(rootReducer, applyMiddleware(createZoomOutMiddleware(
      normalZoomOutCallback,
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

  setNormalChart() {
    this.store.dispatch(setNormalChart())
  }

  setStreamgraph() {
    this.store.dispatch(setStreamgraph())
  }
}

function createZoomOutMiddleware(normalZoomOutCallback, streamgraphZoomOutCallback) {
  return function ({getState}) {
    const self = this;
    return next => action => {
      if(action.type == "ZOOM_OUT" && action.not_from_mediator ) {
        if (getState().chartType === 'streamgraph') {
          streamgraphZoomOutCallback()
        } else {
          normalZoomOutCallback()
        }
      }
      const returnValue = next(action)
      returnValue
    }
  }
}

export default Intermediate;

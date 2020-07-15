"use strict";

import ReactDOM from "react-dom";
import React from "react";

import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import { showBacklink, hideBacklink } from "./actions";

import Backlink from "./components/Backlink";

/**
 * Class to sit between the "old" mediator and the
 * "new" modern frontend.
 *
 * This class should ideally only talk to the mediator and redux
 */
class Intermediate {
  constructor(modern_frontend_enabled) {
    this.modern_frontend_enabled = modern_frontend_enabled;
    this.store = createStore(rootReducer);
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

  showBacklink(onClick) {
    this.store.dispatch(showBacklink(onClick));
  }

  hideBacklink() {
    this.store.dispatch(hideBacklink());
  }
}

export default Intermediate;

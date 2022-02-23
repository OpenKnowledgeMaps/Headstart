import ReactDOM from "react-dom";
import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";

import rootReducer, { getInitialState } from "./reducers";
import {
  initializeStore,
  updateDimensions,
  applyForceAreas,
  applyForcePapers,
} from "./actions";

import applyHeadstartMiddleware from "./middleware";

import { applyForce } from "./utils/force";

import { getChartSize, getListSize } from "./utils/dimensions";
import Headstart from "./components/Headstart";
import { removeQueryParams } from "./utils/url";
import debounce from "./utils/debounce";
import DataManager from "./dataprocessing/managers/DataManager";
import FetcherFactory from "./dataprocessing/fetchers/FetcherFactory";
import onBackButtonClick from "./utils/backButton";

import Bowser from "bowser";

class HeadstartRunner {
  constructor(config) {
    this.config = config;
    this.dataManager = new DataManager(config);

    this.originalTitle = document.title;
    this.actionQueue = [];

    const initialState = getInitialState(this.config);
    const middleware = applyHeadstartMiddleware(this);
    this.store = createStore(rootReducer, initialState, middleware);

    this.hsContainer = document.getElementById(this.config.tag);
    this.hsContainer.classList.add("headstart");

    this.backendData = [];
  }

  async run() {
    this.checkBrowserVersion();
    this.renderReact();
    this.addBackButtonListener();
    this.backendData = await this.fetchData();
    this.dispatchDataEvent(this.backendData);
    this.initStore(this.backendData);
    this.applyQueryParams();
    this.addWindowResizeListener();
  }

  checkBrowserVersion() {
    const browser = Bowser.getParser(window.navigator.userAgent);
    // TODO use proper browser filtering https://www.npmjs.com/package/bowser#filtering-browsers
    if (
      !["chrome", "firefox", "safari"].includes(browser.getBrowserName(true))
    ) {
      alert(
        "You are using an unsupported browser. " +
          "This visualization was successfully tested " +
          "with the latest versions of Chrome, Firefox and Safari."
      );
    }
  }

  renderReact() {
    ReactDOM.render(
      <Provider store={this.store}>
        <Headstart />
      </Provider>,
      this.hsContainer
    );
  }

  addBackButtonListener() {
    const handleBackButtonClick = () => {
      onBackButtonClick(this.dataManager, this.store, this.config);
    };

    window.addEventListener("popstate", debounce(handleBackButtonClick, 300));
  }

  async fetchData() {
    const config = this.config;

    const dataFetcher = FetcherFactory.getInstance(config.mode, {
      serverUrl: config.server_url,
      files: config.files,
      isStreamgraph: config.is_streamgraph,
    });

    return await dataFetcher.getData();
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
  }

  applyQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    // enable this for ability to share link to a zoomed bubble / paper
    // if (queryParams.has("paper")) {
    //   selectUrlPaper(this.dataManager, this.store, this.config);
    // } else {
    //   zoomUrlArea(this.dataManager, this.store, this.config);
    // }
    // remove the following lines if the previous line is uncommented
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

  addWindowResizeListener() {
    window.addEventListener("resize", () => {
      const chart = getChartSize(this.config, this.dataManager.context);
      const list = getListSize(
        this.config,
        this.dataManager.context,
        chart.size
      );
      this.store.dispatch(updateDimensions(chart, list));
    });
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
      this.config
    );
  }

  /**
   * Dispatches a custom event that the data has been loaded for reuse outside of Headstart.
   * @param {Object} data the raw data
   */
  dispatchDataEvent(data) {
    const elem = document.getElementById(this.config.tag);
    const event = new CustomEvent("headstart.data.loaded", {
      detail: { data },
    });
    elem.dispatchEvent(event);
  }

  rescaleMap(scaleBy, baseUnit, isContentBased, initialSort) {
    this.config.scale_by = scaleBy;
    this.config.base_unit = baseUnit;
    this.config.content_based = isContentBased;
    this.config.initial_sort = initialSort;
    // TODO this might cause a bug (or there might be more params that require setting to false)
    // bug description: map different after rescaling to the same metric
    this.config.dynamic_sizing = false;

    this.initStore(this.backendData);
  }
}

export default HeadstartRunner;

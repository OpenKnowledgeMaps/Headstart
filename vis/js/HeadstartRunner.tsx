// @ts-nocheck
import Bowser from "bowser";
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";

import {
  applyForceAreas,
  applyForcePapers,
  initializeStore,
  updateDimensions,
} from "./actions";
import Headstart from "./components/Headstart";
import FetcherFactory from "./dataprocessing/fetchers/FetcherFactory";
import DataManager from "./dataprocessing/managers/DataManager";
import applyHeadstartMiddleware from "./middleware";
import rootReducer, { getInitialState } from "./reducers";
import { STREAMGRAPH_MODE } from "./reducers/chartType";
import { Config } from "./types/config";
import handleZoomSelectQuery from "./utils/backButton";
import debounce from "./utils/debounce";
import { getChartSize, getListSize } from "./utils/dimensions";
import { applyForce } from "./utils/force";
import { removeQueryParams } from "./utils/url";

class HeadstartRunner {
  public config: Config;
  public dataManager: DataManager;
  public originalTitle: string;
  public actionQueue: any[];
  public store: any;

  public hsContainer: HTMLElement | null;
  public backendData: any[];

  constructor(config: Config) {
    this.config = config;
    this.dataManager = new DataManager(config);

    this.originalTitle = document.title;
    this.actionQueue = [];

    const initialState = getInitialState(this.config);
    const middleware = applyHeadstartMiddleware(this);
    this.store = createStore(rootReducer, initialState, middleware);

    this.hsContainer = document.getElementById(this.config.tag);
    this.hsContainer?.classList.add("headstart");

    this.backendData = [];
  }

  async run() {
    this.checkIsSupportedBrowser();
    this.renderReact();
    this.addBackButtonListener();
    this.backendData = await this.fetchData();
    this.dispatchDataEvent(this.backendData);
    this.initStore(this.backendData);
    this.applyQueryParams();
    this.addWindowResizeListener();
  }

  private checkIsSupportedBrowser() {
    const SUPPORTED = [
      "Chrome",
      "Firefox",
      "Safari",
      "Microsoft Edge",
      "Opera",
    ] as const;

    const browser = Bowser.getParser(window.navigator.userAgent);
    const browserName = browser.getBrowserName(true);

    const isSupportedBrowser = SUPPORTED.map((browserName) =>
      browserName.toLowerCase(),
    ).includes(browserName);

    if (!isSupportedBrowser || !browserName) {
      alert(
        "You are using an unsupported browser. " +
          "This visualization was successfully tested " +
          "with the latest versions of " +
          "Chrome, Firefox, Safari, Edge and Opera. " +
          "We strongly recommend using one of these browsers.",
      );
    }
  }

  renderReact() {
    const rootNode: Root = createRoot(this.hsContainer);
    rootNode.render(
      <Provider store={this.store}>
        <Headstart />
      </Provider>,
    );
  }

  addBackButtonListener() {
    const handleBackButtonClick = () => {
      handleZoomSelectQuery(this.dataManager, this.store, this.config);
    };

    window.addEventListener("popstate", debounce(handleBackButtonClick, 300));
  }

  async fetchData() {
    const config = this.config;

    const dataFetcher = FetcherFactory.getInstance(config.mode, {
      serverUrl: config.server_url,
      files: config.files,
      isStreamgraph: config.visualization_type === STREAMGRAPH_MODE,
    });

    return await dataFetcher.getData();
  }

  initStore(backendData: any) {
    const config = this.config;

    const { size, width, height } = getChartSize(config);

    this.dataManager.parseData(backendData, size);

    const context = this.dataManager.context;

    const list = getListSize(config, size);

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
        this.dataManager.scalingFactors,
        this.dataManager.author,
      ),
    );

    const { visualization_type: visualizationType } = this.config;
    const isNotStreamgraph = visualizationType !== STREAMGRAPH_MODE;

    if (isNotStreamgraph) {
      this.applyForceLayout();
    }
  }

  applyQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    // enable this for ability to share link to a zoomed bubble / paper
    // handleZoomSelectQuery(this.dataManager, this.store, this.config);
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
      const chart = getChartSize(this.config);
      const list = getListSize(this.config, chart.size);
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
      (newAreas: any) =>
        this.store.dispatch(applyForceAreas(newAreas, state.chart.height)),
      (newPapers: any) =>
        this.store.dispatch(applyForcePapers(newPapers, state.chart.height)),
      this.config,
    );
  }

  /**
   * Dispatches a custom event that the data has been loaded for reuse outside of Headstart.
   * @param {Object} data the raw data
   */
  dispatchDataEvent(data: any) {
    const elem = document.getElementById(this.config.tag);
    const event = new CustomEvent("headstart.data.loaded", {
      detail: { data },
    });
    elem?.dispatchEvent(event);
  }

  rescaleMap(
    scaleBy: string,
    baseUnit: string,
    isContentBased: boolean,
    initialSort: string,
  ) {
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

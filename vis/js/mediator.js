import Mediator from 'mediator-js';
import $ from "jquery";
import d3 from "d3";

import config from 'config';
import Intermediate from './intermediate';
import FetcherFactory from './dataprocessing/fetchers/FetcherFactory';

// TODO use an npm package instead
import { BrowserDetect } from "exports-loader?exports=BrowserDetect!../lib/browser_detect.js";

var MyMediator = function() {
    // mediator
    this.mediator = new Mediator();
    this.intermediate_layer = new Intermediate(config, this.rescale_map);
    this.init();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
    },

    publish: function() {
        this.mediator.publish(...arguments);
    },

    init_start_visualization: async function() {
        const dataFetcher = FetcherFactory.getInstance(config.mode, {
            serverUrl: config.server_url,
            files: config.files,
            isStreamgraph: config.is_streamgraph,
          });
        const backendData = await dataFetcher.getData();

        mediator.dispatch_data_event(backendData);

        mediator.intermediate_layer.initStore(backendData);
        
        d3.select(window).on("resize", () => {
            mediator.dimensions_update();
        });
    },

    buildHeadstartHTML: function() {
        // Build Headstart skeleton
        this.viz = $("#" + config.tag);
        this.viz.addClass("headstart");
        this.viz.append('<div id="app-container"></div>');

        mediator.intermediate_layer.renderFrontend();

        mediator.checkBrowserVersions();
    },

    checkBrowserVersions: function() {
        var browser = BrowserDetect.browser;
        if (!(browser === "Firefox" || browser === "Safari" || browser === "Chrome")) {
                var alert_message = 'You are using an unsupported browser. ' +
                                    'This visualization was successfully tested ' +
                                    'with the latest versions of Firefox, Chrome, Safari, ' +
                                    'Opera and Edge.';
                alert(alert_message);
        }
      },

    dimensions_update: function() {
        mediator.intermediate_layer.updateDimensions();
    },

    rescale_map: function(scale_by, base_unit, content_based, initial_sort) {
        config.scale_by = scale_by;
        config.base_unit = base_unit;
        config.content_based = content_based;
        config.initial_sort = initial_sort;
        // TODO this might cause a bug (or there might be more params that require setting to false)
        // bug description: map different after rescaling to the same metric
        config.dynamic_sizing = false;

        // TODO this can be optimized (omit another download)
        mediator.init_start_visualization();
    },

    dispatch_data_event: function(csv) {
        // Dispatch an event that the data has been loaded for reuse outside of Headstart
        const elem = document.getElementById(config.tag);
        var event = new CustomEvent('headstart.data.loaded', {detail: {data: csv}});
        elem.dispatchEvent(event);
    },
};

export const mediator = new MyMediator();

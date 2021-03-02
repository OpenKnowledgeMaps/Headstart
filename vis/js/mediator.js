import Mediator from 'mediator-js';
import config from 'config';
import { io } from 'io';
import Intermediate from './intermediate';
import { getChartSize, getListSize } from "./utils/dimensions";

// needed for draggable modals (it can be refactored with react-bootstrap though)
import "../lib/jquery-ui.min.js";

const headstartTemplate = require("templates/headstart.handlebars");

class ModuleManager {
    constructor() {
        this.modules = {};
    }

    registerModule(module, name) {
        this.modules[name] = module;
    }

    call(name, methodName, args) {
        if(this.modules[name]){
            if(config.debug) console.log(`calling ${name} method ${methodName}`);
            const func = this.modules[name][methodName];
            func.apply(this.modules[name], args);
        }
    }
}

var MyMediator = function() {
    // mediator
    this.fileData = [];
    this.mediator = new Mediator();
    this.manager = new ModuleManager();
    this.modern_frontend_enabled = config.modern_frontend_enabled
    this.modern_frontend_intermediate = new Intermediate(
        this.modern_frontend_enabled,
        this.rescale_map,
        this.record_action,
    );
    this.init();
    this.init_state();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.modules = { io: io };
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
        this.mediator.subscribe("start", this.register_bubbles);
        this.mediator.subscribe("start", this.init_modules);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("register_bubbles", this.register_bubbles);

        // async calls
        this.mediator.subscribe("get_data_from_files", this.io_async_get_data);
        this.mediator.subscribe("get_server_files", this.io_get_server_files);

        // bubbles events
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
    },

    init_state: function() {
        MyMediator.prototype.current_file_number = 0;
        MyMediator.prototype.current_stream = null;
        MyMediator.prototype.modern_frontend = false;
    },

    init_modules: function() {
        mediator.manager.registerModule(io, 'io');
    },

    init_modern_frontend_intermediate: function() {
        const { size, width, height } = getChartSize(config, io.context);
        mediator.modern_frontend_intermediate.init(config, io.context, io.data, mediator.streamgraph_data, size, width, height);
    },

    render_modern_frontend_heading: function() {
        mediator.modern_frontend_intermediate.renderHeading(config);
    },

    render_modern_frontend_list: function() {
        mediator.modern_frontend_intermediate.renderList();
    },

    render_modern_frontend_knowledge_map: function() {
        mediator.modern_frontend_intermediate.renderKnowledgeMap(config);
    },

    render_modern_frontend_peripherals: function() {
        mediator.modern_frontend_intermediate.renderPeripherals();
    },

    render_modern_frontend_streamgraph: function() {
        mediator.modern_frontend_intermediate.renderStreamgraph();
    },

    render_modern_frontend_modals_only: function(selector) {
        mediator.modern_frontend_intermediate.renderModalsOnly(selector);
    },

    // current_bubble needed in the headstart.js and io.js
    register_bubbles: function() {
        mediator.bubbles = [];
        $.each(config.files, (index, elem) => {
            const bubble = {};
            if (bubble.id === 0) {
                bubble.id = mediator.bubbles.length + 1; // start id with 1
            }
            bubble.file = elem.file;
            bubble.title = elem.title;
            mediator.bubbles.push(bubble);
        });
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
    },

    publish: function() {
        this.mediator.publish(...arguments);
    },

    io_async_get_data: function (url, input_format, callback) {
        // WORKAROUND, if I try to add headstart earlier it doesn't work
        // TODO find reason
        mediator.modules.headstart = window.headstartInstance;
        mediator.manager.call('io', 'async_get_data', [url, input_format, callback]);
    },

    io_get_server_files: function(callback) {
        mediator.manager.call('io', 'get_server_files', [callback]);
    },

    init_ontofile: function (file) {
        mediator.current_file_number = file;
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
        mediator.current_file = config.files[mediator.current_file_number];
        mediator.external_vis_url = config.external_vis_url + "?vis_id=" + config.files[mediator.current_file_number].file
    },

    init_start_visualization: function(highlight_data, csv) {
        $("#map-loading-screen").hide();
        
        let data = function () {
            if (config.show_context) {
                if(typeof csv.data === "string") {
                    return JSON.parse(csv.data);
                } else {
                    return csv.data;
                }
            } else {
                if(typeof csv.data === "object") {
                    return csv.data;
                } else {
                    return csv;
                }
            }
        }();
        
        //Dispatch an event that the data has been loaded for reuse outside of Headstart
        let elem = document.getElementById(config.tag);
        var event = new CustomEvent('headstart.data.loaded', {detail: {data: csv}});
        elem.dispatchEvent(event);
        
        let context = (typeof csv.context !== 'object')?({}):(csv.context);
        mediator.streamgraph_data = (config.is_streamgraph)?(csv.streamgraph):{};
        
        mediator.manager.registerModule(window.headstartInstance, 'headstart');

        mediator.manager.call('io', 'initializeMissingData', [data]);
        mediator.manager.call('io', 'prepareData', [highlight_data, data, context]);
        mediator.manager.call('io', 'setContext', [context, data.length]);
        mediator.manager.call('io', 'setInfo', [context]);

        if (config.is_force_papers && config.dynamic_force_papers) 
            mediator.manager.call('headstart', 'dynamicForcePapers', [data.length]);
        if (config.is_force_area && config.dynamic_force_area) 
            mediator.manager.call('headstart', 'dynamicForceAreas', [data.length]);
        if (config.dynamic_sizing) 
            mediator.manager.call('headstart', 'dynamicSizing', [data.length]);

        mediator.init_modern_frontend_intermediate();

        // TODO delete this call (redundant) and probably some other calls too
        mediator.manager.call('io', 'prepareAreas', []);
        
        mediator.bubbles_update_data_and_areas(mediator.current_bubble);

        // TODO call this just once (chart size must be known before the map is rendered)
        mediator.dimensions_update();

        if (config.render_map) {
            mediator.render_modern_frontend_heading();

            if (config.is_streamgraph) {
                mediator.render_modern_frontend_streamgraph();
            } else {
                mediator.render_modern_frontend_knowledge_map();
            }

            mediator.render_modern_frontend_peripherals();
        } else {
            $(".vis-col").remove();
            $(".list-col").css("width", "100%");
            $("body").append('<div id="makeshift-modals"></div>')
            mediator.render_modern_frontend_modals_only("#makeshift-modals");
        }

        if (config.render_list) {
            mediator.render_modern_frontend_list();
        }
        
        mediator.dimensions_update();
        d3.select(window).on("resize", () => {
            mediator.dimensions_update();
        });
    },

    buildHeadstartHTML: function() {
        // Build Headstart skeleton
        this.viz = $("#" + config.tag);
        this.viz.addClass("headstart");
        this.viz.append(headstartTemplate());
        
        if(config.show_loading_screen) {
            $("#map-loading-screen").show();
            $("#loading-text").text(config.localization[config.language].loading);
        }
    },

    // loads data used in headstart.js
    bubbles_update_data_and_areas: function(bubbles) {
        bubbles.data = io.data;
        bubbles.areas = io.areas;
        bubbles.areas_array = io.areas_array;
    },

    record_action: function(id, category, action, user, type, timestamp, additional_params, post_data) {
        window.headstartInstance.recordAction(id, category, action, user, type, timestamp, additional_params, post_data);
    },

    dimensions_update: function() {
        const chart = getChartSize(config, io.context);
        const list = getListSize(config, io.context, chart.size);
        mediator.modern_frontend_intermediate.updateDimensions(chart, list);
        if(!config.is_streamgraph) {
            d3.select("#headstart-chart")
                .style("width", chart.size + "px");
        }
    },

    rescale_map: function(scale_by, base_unit, content_based, initial_sort) {
        config.scale_by = scale_by;
        config.base_unit = base_unit;
        config.content_based = content_based;
        config.initial_sort = initial_sort;
        // TODO this might cause a bug (or there might be more params that require setting to false)
        // bug description: map different after rescaling to the same metric
        config.dynamic_sizing = false;

        window.headstartInstance.tofile(mediator.current_file_number);
    }
};

export const mediator = new MyMediator();

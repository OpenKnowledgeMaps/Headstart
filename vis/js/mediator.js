import Mediator from 'mediator-js';
import $ from "jquery";
import d3 from "d3";

import config from 'config';
import { io } from 'io';
import Intermediate from './intermediate';

// needed for draggable modals (it can be refactored with react-bootstrap though)
import "../lib/jquery-ui.min.js";

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
    this.intermediate_layer = new Intermediate(this.rescale_map, this.record_action);
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
    },

    init_modules: function() {
        mediator.manager.registerModule(io, 'io');
    },

    render_frontend: function() {
        mediator.intermediate_layer.renderFrontend(config);
    },

    init_store: function() {
        mediator.intermediate_layer.initStore(config, io.context, io.data, mediator.streamgraph_data);
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

    init_start_visualization: function(csv) {
        const data = mediator.parse_data(csv);
        
        mediator.dispatch_data_event(csv);
        
        let context = (typeof csv.context !== 'object')?({}):(csv.context);
        mediator.streamgraph_data = (config.is_streamgraph)?(csv.streamgraph):{};

        mediator.manager.call('io', 'initializeMissingData', [data]);
        mediator.manager.call('io', 'prepareData', [data, context]);
        mediator.manager.call('io', 'setContext', [context, data.length]);
        mediator.manager.call('io', 'setInfo', [context]);

        if (config.is_force_papers && config.dynamic_force_papers) {
            config.papers_force_alpha = mediator.get_papers_force_alpha(data.length);
        }

        if (config.is_force_area && config.dynamic_force_area) {
            config.area_force_alpha = mediator.get_areas_force_alpha(data.length);
        }

        if (config.dynamic_sizing) {
            mediator.set_dynamic_sizing(data.length);
        }

        mediator.init_store();
        
        d3.select(window).on("resize", () => {
            mediator.dimensions_update();
        });
    },

    buildHeadstartHTML: function() {
        // Build Headstart skeleton
        this.viz = $("#" + config.tag);
        this.viz.addClass("headstart");
        this.viz.append('<div id="app-container"></div>');

        mediator.render_frontend();
    },

    record_action: function(id, category, action, user, type, timestamp, additional_params, post_data) {
        window.headstartInstance.recordAction(id, category, action, user, type, timestamp, additional_params, post_data);
    },

    dimensions_update: function() {
        mediator.intermediate_layer.updateDimensions(config, io.context);
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
    },

    parse_data: function(csv) {
        if (config.show_context) {
            if (typeof csv.data === "string") {
                return JSON.parse(csv.data);
            }
            return csv.data;
        }
        if (typeof csv.data === "object") {
            return csv.data;
        }
        return csv;
    },

    dispatch_data_event: function(csv) {
        // Dispatch an event that the data has been loaded for reuse outside of Headstart
        const elem = document.getElementById(config.tag);
        var event = new CustomEvent('headstart.data.loaded', {detail: {data: csv}});
        elem.dispatchEvent(event);
    },

    get_papers_force_alpha: function(num_items) {
        if (num_items >= 150 && num_items < 200) {
            return 0.2;
        }
        if (num_items >= 200 && num_items < 350) {
            return 0.3;
        }
        if (num_items >= 350 && num_items < 500) {
            return 0.4;
        }
        if (num_items >= 500) {
            return 0.6;
        }

        return config.papers_force_alpha;
    },

    get_areas_force_alpha: function(num_items) {
        if (num_items >= 200) {
            return 0.02;
        }

        return config.area_force_alpha;
    },

    set_dynamic_sizing: function(num_items) {
        if (num_items >= 150 && num_items < 200) {
            mediator.adjust_sizes(0.9, 1.1);
        } else if (num_items >= 200 && num_items < 250) {
            mediator.adjust_sizes(0.8, 1.1);
        } else if (num_items >= 250 && num_items < 300) {
            mediator.adjust_sizes(0.7, 1.1);
        } else if (num_items >= 300 && num_items < 350) {
            mediator.adjust_sizes(0.7, 1.2);
        } else if (num_items >= 350 && num_items < 400) {
            mediator.adjust_sizes(0.7, 1.2);
        } else if (num_items >= 400 && num_items < 450) {
            mediator.adjust_sizes(0.7, 1.2);
        } else if (num_items >= 450 && num_items < 500) {
            mediator.adjust_sizes(0.7, 1.2);
        } else if (num_items >= 500) {
            mediator.adjust_sizes(0.6, 1.2);
        }
    },
  
    adjust_sizes: function(resize_paper_factor, resize_bubble_factor) {
        config.paper_min_scale *= resize_paper_factor;
        config.paper_max_scale *= resize_paper_factor;
  
        config.bubble_min_scale *= resize_bubble_factor;
        config.bubble_max_scale *= resize_bubble_factor;
    },
};

export const mediator = new MyMediator();

import Mediator from 'mediator-js';
import $ from "jquery";
import d3 from "d3";

import config from 'config';
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
    this.intermediate_layer = new Intermediate(config, this.rescale_map);
    this.context = {};
    this.init();
    this.init_state();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
        this.mediator.subscribe("start", this.register_bubbles);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("register_bubbles", this.register_bubbles);

        // async calls
        this.mediator.subscribe("get_data_from_files", this.async_get_data);
        this.mediator.subscribe("get_server_files", this.get_server_files);

        // bubbles events
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);
    },

    init_state: function() {
        MyMediator.prototype.current_file_number = 0;
    },

    // current_bubble needed in the headstart.js
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

    async_get_data: function (file, input_format, callback) {
        d3[input_format](file, (csv) => {
            callback(csv);
        });
    },

    get_server_files: function(callback) {
        $.ajax({
            type: 'POST',
            url: config.server_url + "services/staticFiles.php",
            data: "",
            dataType: 'JSON',
            success: (json) => {
                config.files = [];
                for (let i = 0; i < json.length; i++) {
                    config.files.push({
                        "title": json[i].title,
                        "file": config.server_url + "static" + json[i].file
                    });
                }
                mediator.publish("register_bubbles");
                d3[config.input_format](mediator.current_bubble.file, callback);
            }
        });
    },

    init_ontofile: function (file) {
        mediator.current_file_number = file;
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
        mediator.current_file = config.files[mediator.current_file_number];
        mediator.external_vis_url = config.external_vis_url + "?vis_id=" + config.files[mediator.current_file_number].file
    },

    init_start_visualization: function(backendData) {
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

        window.headstartInstance.tofile(mediator.current_file_number);
    },

    dispatch_data_event: function(csv) {
        // Dispatch an event that the data has been loaded for reuse outside of Headstart
        const elem = document.getElementById(config.tag);
        var event = new CustomEvent('headstart.data.loaded', {detail: {data: csv}});
        elem.dispatchEvent(event);
    },
};

export const mediator = new MyMediator();

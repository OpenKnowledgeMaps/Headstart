import Mediator from 'mediator-js';
import config from 'config';
import { io } from 'io';
import { canvas } from 'canvas';
import { streamgraph } from 'streamgraph';
import Intermediate from './intermediate';
import { getChartSize, getListSize } from "./utils/dimensions";

// needed for draggable modals (for now, can be refactored with react-bootstrap)
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
        this.streamgraph_chart_clicked,
        this.currentstream_click,
        this.rescale_map,
    );
    this.init();
    this.init_state();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.modules = { io: io, canvas: canvas, streamgraph: streamgraph};
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
        this.mediator.subscribe("start", this.register_bubbles);
        this.mediator.subscribe("start", this.init_modules);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("register_bubbles", this.register_bubbles);

        // data transformation and calculation of bubble/paper sizes
        this.mediator.subscribe("prepare_data", this.io_prepare_data);
        this.mediator.subscribe("prepare_areas", this.io_prepare_areas);

        // async calls
        this.mediator.subscribe("get_data_from_files", this.io_async_get_data);
        this.mediator.subscribe("get_server_files", this.io_get_server_files);

        // bubbles events
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
        
        //streamgraph
        this.mediator.subscribe("stream_clicked", this.stream_clicked)
        this.mediator.subscribe("currentstream_click", this.currentstream_click)
        this.mediator.subscribe("streamgraph_chart_clicked", this.streamgraph_chart_clicked)
    },

    init_state: function() {
        MyMediator.prototype.current_file_number = 0;
        MyMediator.prototype.current_stream = null;
        MyMediator.prototype.modern_frontend = false;
    },

    init_modules: function() {
        mediator.manager.registerModule(io, 'io');
        if(config.render_bubbles) {
            mediator.manager.registerModule(canvas, 'canvas');
        }
        
        if(config.is_streamgraph) {
            mediator.manager.registerModule(streamgraph, 'streamgraph')
        }
    },

    init_modern_frontend_intermediate: function() {
        const { size } = getChartSize(config, io.context);
        mediator.modern_frontend_intermediate.init(config, io.context, io.data, size);
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

    io_prepare_data: function (highlight_data, cur_fil_num, context) {
        mediator.manager.call('io', 'prepareData', [highlight_data, cur_fil_num, context]);
    },

    io_prepare_areas: function () {
        mediator.manager.call('io', 'prepareAreas', []);
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

        mediator.init_modern_frontend_intermediate();
        
        if (config.is_streamgraph) {         
            mediator.manager.call('canvas', 'setupStreamgraphCanvas', []);
        } else {
            if (config.is_force_papers && config.dynamic_force_papers) 
                mediator.manager.call('headstart', 'dynamicForcePapers', [data.length]);
            if (config.is_force_area && config.dynamic_force_area) 
                mediator.manager.call('headstart', 'dynamicForceAreas', [data.length]);
            if (config.dynamic_sizing) 
                mediator.manager.call('headstart', 'dynamicSizing', [data.length]);
        }

        mediator.manager.call('io', 'prepareAreas', []);
        
        mediator.bubbles_update_data_and_areas(mediator.current_bubble);

        // TODO call this just once (chart size must be known before the map is rendered)
        mediator.dimensions_update();

        if (config.is_streamgraph) {
            mediator.manager.registerModule(streamgraph, 'streamgraph')
            mediator.manager.call('streamgraph', 'start')
            mediator.manager.call('streamgraph', 'setupStreamgraph', [mediator.streamgraph_data])
            
            mediator.manager.call('streamgraph', 'initMouseListeners', []);
            
        } else {
            mediator.render_modern_frontend_knowledge_map();
        }

        mediator.render_modern_frontend_list();
        mediator.render_modern_frontend_peripherals();
        
        mediator.dimensions_update();
        d3.select(window).on("resize", () => {
            mediator.dimensions_update();
            mediator.window_resize();
        });
    },

    buildHeadstartHTML: function() {
        // Build Headstart skeleton
        this.viz = $("#" + config.tag);
        this.viz.addClass("headstart");
        this.viz.append(headstartTemplate({
            credit_embed: config.credit_embed
            , canonical_url: config.canonical_url
            , is_authorview: config.is_authorview
            , modern_frontend_enabled: mediator.modern_frontend_enabled
        }));
        
        if(config.show_loading_screen) {
            $("#map-loading-screen").show();
            $("#loading-text").text(config.localization[config.language].loading);
        }
        
        // TODO is this even real? modern_frontend_enabled
        if (!config.render_bubbles) {
            $(".vis-col").remove();
            this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            // TODO this shouldn't be happening with react
            if(config.render_list) {
                $(".list-col").height(this.available_height);
                $("#papers_list").height(this.available_height);
            }
        }
        if (!config.render_list) {
            $(".list-col").remove();
        }
    },

    // loads data used in headstart.js
    bubbles_update_data_and_areas: function(bubbles) {
        bubbles.data = io.data;
        bubbles.areas = io.areas;
        bubbles.areas_array = io.areas_array;
    },
    
    stream_clicked: function(d) {
        let keyword = d.key;
        let color = d.color;
        
        mediator.current_stream = keyword;
        mediator.manager.call('streamgraph', 'markStream', [keyword]);
        mediator.paper_deselected();
        mediator.modern_frontend_intermediate.zoomIn({title: keyword, color});
    },
    
    currentstream_click: function() {
        mediator.paper_deselected();
    },
    
    streamgraph_chart_clicked: function() {
        mediator.current_stream = null;
        mediator.manager.call('streamgraph', 'reset');
        mediator.paper_deselected();
        mediator.modern_frontend_intermediate.zoomOut();
    },

    record_action: function(id, category, action, user, type, timestamp, additional_params, post_data) {
        window.headstartInstance.recordAction(id, category, action, user, type, timestamp, additional_params, post_data);
    },

    window_resize: function() {
        if(config.is_streamgraph) {
            $('.line_helper').remove();
            $('#headstart-chart').empty();
            mediator.manager.call('canvas', 'calcChartSize');
            mediator.manager.call('canvas', 'createStreamgraphCanvas');
            mediator.manager.call('streamgraph', 'setupStreamgraph', [mediator.streamgraph_data]);
            mediator.manager.call('streamgraph', 'initMouseListeners', []);
            mediator.manager.call('streamgraph', 'markStream')
        }
    },

    paper_deselected: function() {
        mediator.modern_frontend_intermediate.deselectPaper();
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

        window.headstartInstance.tofile(mediator.current_file_number);
    }
};

export const mediator = new MyMediator();

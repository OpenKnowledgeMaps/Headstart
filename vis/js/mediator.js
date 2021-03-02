import Mediator from 'mediator-js';
import config from 'config';
import { list } from 'list';
import { io } from 'io';
import { canvas } from 'canvas';
import { scale } from './scale';
import { streamgraph } from 'streamgraph';
import Intermediate from './intermediate';
import { getChartSize, getListSize } from "./utils/dimensions";

const headstartTemplate = require("templates/headstart.handlebars");
const infoTemplate = require("templates/modals/info_modal.handlebars");
const iFrameTemplate = require("templates/modals/iframe_modal.handlebars");
const imageTemplate = require("templates/modals/images_modal.handlebars");
const viperEditTemplate = require("templates/modals/viper_edit_modal.handlebars");
const embedTemplate = require("templates/modals/embed_modal.handlebars");
const toolbarTemplate = require("templates/toolbar/toolbar.handlebars");
const scaleToolbarTemplate = require("templates/toolbar/scale_toolbar.handlebars");
const crisLegendTemplate = require("templates/toolbar/cris_legend.handlebars");
const credit_logo = require("images/okmaps-logo-round.png");

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
        this.list_show_popup,
        this.currentstream_click,
        this.record_action,
    );
    this.init();
    this.init_state();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.modules = { list: list, io: io, canvas: canvas, scale: scale, streamgraph: streamgraph};
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
        this.mediator.subscribe("mark_project_changed", this.mark_project_changed);

        // canvas events
        this.mediator.subscribe("draw_modals", this.draw_modals);
        
        //scale
        this.mediator.subscribe("update_visual_distributions", this.update_visual_distributions);
        
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
        if(config.render_list) mediator.manager.registerModule(list, 'list');
        mediator.manager.registerModule(io, 'io');
        if(config.render_bubbles) {
            mediator.manager.registerModule(canvas, 'canvas');
        }
        if(config.scale_toolbar) {
            mediator.manager.registerModule(scale, 'scale')
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

    tryToCall: function(func) {
        try {
            func();
        }
        catch(e) {
            console.log(`I ignored error ${e} in ${func}`);
        }
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
        list.current = "none";
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

            mediator.manager.call('canvas', 'setupCanvas', []);
            
            if (config.scale_toolbar) {
                mediator.manager.registerModule(scale, 'scale');
                mediator.manager.call('scale', 'drawScaleTypes', []);
            }
        }

        mediator.manager.call('canvas', 'initInfoModal');
        mediator.manager.call('io', 'prepareAreas', []);
        
        mediator.manager.call('canvas', 'drawModals', [context]);
        mediator.bubbles_update_data_and_areas(mediator.current_bubble);

        // TODO call this just once (chart size must be known before the map is rendered)
        mediator.dimensions_update();

        if (config.is_streamgraph) {
            mediator.manager.registerModule(streamgraph, 'streamgraph')
            mediator.manager.call('streamgraph', 'start')
            mediator.manager.call('streamgraph', 'setupStreamgraph', [mediator.streamgraph_data])

            mediator.manager.call('list', 'start');
            
            mediator.manager.call('streamgraph', 'initMouseListeners', []);
            
        } else {
            mediator.render_modern_frontend_knowledge_map();
        }

        mediator.render_modern_frontend_list();
        
        mediator.dimensions_update();
        d3.select(window).on("resize", () => {
            mediator.dimensions_update();
            mediator.window_resize();
        });

        mediator.manager.call('canvas', 'showInfoModal', []);
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
        if(config.credit_embed) {
            $("#credit_logo").attr("src", credit_logo);
        }
        
        if(config.show_loading_screen) {
            $("#map-loading-screen").show();
            $("#loading-text").text(config.localization[config.language].loading);
        }
        
        this.viz.append(infoTemplate());
        this.viz.append(iFrameTemplate({
            spinner_text: config.localization[config.language].pdf_load_text
        }));
        this.viz.append(imageTemplate());
        this.viz.append(viperEditTemplate());
        this.viz.append(embedTemplate());
        
        this.viz.append(toolbarTemplate());
       
        let toolbar = $("#toolbar");
        
        if (config.cris_legend) {
            toolbar.append(crisLegendTemplate());
        }
        
        if (config.scale_toolbar) {
            toolbar.append(scaleToolbarTemplate({
                scale_by_label: config.localization[config.language].scale_by_label,
                credit: config.credit
            }));
        }
        
        if (!config.render_bubbles) {
            $(".vis-col").remove();
            this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
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

    // shows pdf preview
    list_show_popup: function(d) {
        mediator.manager.call('list', 'populateOverlay', [d]);
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
        mediator.draw_modals();
        mediator.paper_deselected();
        mediator.modern_frontend_intermediate.zoomOut();
    },

    record_action: function(id, category, action, user, type, timestamp, additional_params, post_data) {
        window.headstartInstance.recordAction(id, category, action, user, type, timestamp, additional_params, post_data);
    },
    
    mark_project_changed: function(id) {
        window.headstartInstance.markProjectChanged(id);
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
        } else {
            mediator.manager.call('canvas', 'setupResizedCanvas', []);
        }
    },
    
    draw_modals: function () {
        let context = io.context;
        mediator.manager.call('canvas', 'drawModals', [context]);
    },
    
    update_visual_distributions: function(type) {
        let context = io.context;
        
        if(config.cris_legend) {
            mediator.manager.call('scale', 'updateLegend', [type, context]);
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
};

export const mediator = new MyMediator();

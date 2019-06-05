import { headstart } from 'headstart';
import Mediator from 'mediator-js';
import config from 'config';
import { papers } from 'papers';
import { BubblesFSM } from 'bubbles';
import { list } from 'list';
import { io } from 'io';
import { canvas } from 'canvas';
import { scale } from './scale';
import { streamgraph } from 'streamgraph';

const multiplesTemplate = require('templates/multiples.handlebars');
const headstartTemplate = require("templates/headstart.handlebars");
const infoTemplate = require("templates/modals/info_modal.handlebars");
const iFrameTemplate = require("templates/modals/iframe_modal.handlebars");
const imageTemplate = require("templates/modals/images_modal.handlebars");
const viperEditTemplate = require("templates/modals/viper_edit_modal.handlebars");
const embedTemplate = require("templates/modals/embed_modal.handlebars");
const toolbarTemplate = require("templates/toolbar/toolbar.handlebars");
const scaleToolbarTemplate = require("templates/toolbar/scale_toolbar.handlebars");
const crisLegendTemplate = require("templates/toolbar/cris_legend.handlebars");

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

    this.init();
    this.init_state();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic and state switching
        this.modules = { papers: papers, list: list, io: io, canvas: canvas, scale: scale, streamgraph: streamgraph};
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
        this.mediator.subscribe("start", this.set_normal_mode);
        this.mediator.subscribe("start", this.register_bubbles);
        this.mediator.subscribe("start", this.init_modules);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("ontomultiples", this.init_ontomultiples);
        this.mediator.subscribe("ontomultiples_finish", this.ontomultiples_finish);
        this.mediator.subscribe("register_bubbles", this.register_bubbles);
        this.mediator.subscribe("to_multiples", this.to_multiples);

        // data transformation and calculation of bubble/paper sizes
        this.mediator.subscribe("prepare_data", this.io_prepare_data);
        this.mediator.subscribe("prepare_areas", this.io_prepare_areas);

        // async calls
        this.mediator.subscribe("get_data_from_files", this.io_async_get_data);
        this.mediator.subscribe("get_server_files", this.io_get_server_files);


        // list
        this.mediator.subscribe("list_toggle", this.list_toggle);
        this.mediator.subscribe("list_show_popup", this.list_show_popup);
        this.mediator.subscribe("list_title_click", this.list_title_click);
        this.mediator.subscribe("list_title_clickable", this.list_title_clickable);
        this.mediator.subscribe("preview_mouseover", this.preview_mouseover);
        this.mediator.subscribe("preview_mouseout", this.preview_mouseout);
        this.mediator.subscribe("list_click_paper_list", this.list_click_paper_list);
        // list --> bookmarks
        this.mediator.subscribe("bookmark_added", this.bookmark_added);
        this.mediator.subscribe("bookmark_removed", this.bookmark_removed);

        // papers events
        this.mediator.subscribe("paper_click", this.paper_click);
        this.mediator.subscribe("paper_mouseover", this.paper_mouseover);
        this.mediator.subscribe("currentbubble_click", this.currentbubble_click);
        this.mediator.subscribe("papers_leave_loading", () => {return;});
        this.mediator.subscribe("paper_holder_clicked", this.paper_holder_clicked);
        this.mediator.subscribe("paper_current_bubble_clicked", this.paper_current_bubble_clicked);

        // bubbles events
        this.mediator.subscribe("bubble_mouseout", this.bubble_mouseout);
        this.mediator.subscribe("bubble_mouseover", this.bubble_mouseover);
        this.mediator.subscribe("bubble_click", this.bubble_click);
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);
        this.mediator.subscribe("bubble_zoomin", this.bubble_zoomin);
        this.mediator.subscribe("bubble_zoomout", this.bubble_zoomout);
        this.mediator.subscribe("zoomout_complete", this.zoomout_complete);
        this.mediator.subscribe("zoomin_complete", this.zoomin_complete);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
        this.mediator.subscribe("check_force_papers", this.check_force_papers);
        this.mediator.subscribe("mark_project_changed", this.mark_project_changed);

        // canvas events
        this.mediator.subscribe("window_resize", this.window_resize);
        this.mediator.subscribe("on_rect_mouseover", this.on_rect_mouseover);
        this.mediator.subscribe("on_rect_mouseout", this.on_rect_mouseout);
        this.mediator.subscribe("chart_svg_click", this.chart_svg_click);
        this.mediator.subscribe("draw_title", this.draw_title);

        // needed in io.js = prepareData and prepareAreas to
        // delegate some things to the canvas class
        this.mediator.subscribe("update_canvas_domains", this.update_canvas_domains);
        this.mediator.subscribe("set_new_area_coords", this.set_new_area_coords);
        this.mediator.subscribe("set_area_radii", this.set_area_radii);
        this.mediator.subscribe("canvas_set_domain", this.canvas_set_domain);
        this.mediator.subscribe("update_canvas_data", this.update_canvas_data);
        
        //scale
        this.mediator.subscribe("update_visual_distributions", this.update_visual_distributions);
    },

    init_state: function() {
        MyMediator.prototype.current_zoom_node = null;
        MyMediator.prototype.current_enlarged_paper = null;
        MyMediator.prototype.current_file_number = 0;
        MyMediator.prototype.current_circle = null;
        MyMediator.prototype.papers_list = null;
        MyMediator.prototype.circle_zoom = 0;
        MyMediator.prototype.is_zoomed = false;
        MyMediator.prototype.zoom_finished = false;
        MyMediator.prototype.is_in_normal_mode = true;
    },

    init_modules: function() {
        mediator.manager.registerModule(io, 'io');

        if(config.render_list) mediator.manager.registerModule(list, 'list');
        if(config.render_bubbles) {
            mediator.manager.registerModule(canvas, 'canvas');
            mediator.manager.registerModule(papers, 'papers');
        }
        if(config.scale_toolbar) {
            mediator.manager.registerModule(scale, 'scale')
        }
        if(config.is_streamgraph) {
            mediator.manager.registerModule(streamgraph, 'streamgraph')
        }
    },

    register_bubbles: function() {
        mediator.bubbles = [];
        $.each(config.files, (index, elem) => {
            var bubble = new BubblesFSM();
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
        mediator.modules.headstart = headstart;
        mediator.manager.call('io', 'async_get_data', [url, input_format, callback]);
    },

    io_get_server_files: function(callback) {
        mediator.manager.call('io', 'get_server_files', [callback]);
    },

    io_prepare_data: function (highlight_data, cur_fil_num) {
        mediator.manager.call('io', 'prepareData', [highlight_data, cur_fil_num]);
    },

    io_prepare_areas: function () {
        mediator.manager.call('io', 'prepareAreas', []);
    },

    init_ontofile: function (file) {
        mediator.is_in_normal_mode = true;
        mediator.is_in_multiples_mode = false;
        mediator.current_file_number = file;
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
        mediator.current_file = config.files[mediator.current_file_number];
        papers.current = "none";
        list.current = "none";
        $("#list_explorer").empty();
        mediator.manager.call('canvas', 'setupToFileCanvas', []);
    },

    init_ontomultiples: function() {
        mediator.is_in_normal_mode = false;
        mediator.is_in_multiples_mode = true;
        mediator.current_bubble.current = "x";
        papers.current = "none";
        list.current = "none";
        // clear the list list
        $("#list_explorer").empty();
        mediator.manager.call('canvas', 'setupMultiplesCanvas', []);
    },

    set_normal_mode: function() {
        mediator.is_in_normal_mode = true;
        mediator.is_in_multiples_mode = false;
    },

    ontomultiples_finish: function() {
        mediator.manager.call('canvas', 'drawGrid', []);
        mediator.manager.call('canvas', 'initMouseListeners', []);
    },

    init_start_visualization: function(highlight_data, csv) {
        let data = function () {
            if (config.show_context) {
                if(typeof csv.data === "string") {
                    return JSON.parse(csv.data);
                } else {
                    return csv.data;
                }
            } else {
                return csv;
            }
        }();
        let context = (config.show_context)?(csv.context):{};
        mediator.streamgraph_data = (config.is_streamgraph)?(csv.streamgraph):{};
        
        mediator.manager.registerModule(headstart, 'headstart');
        
        if(config.is_streamgraph) {         
            mediator.manager.call('canvas', 'setupStreamgraphCanvas', []);

            mediator.manager.call('io', 'initializeMissingData', [data]);
            mediator.manager.call('io', 'prepareData', [highlight_data, data]);
            mediator.manager.call('io', 'prepareAreas', []);

            mediator.manager.call('io', 'setContext', [context, data.length]);
            mediator.manager.call('io', 'setInfo', [context]);
            mediator.manager.call('canvas', 'drawTitle', [context]);
            mediator.bubbles_update_data_and_areas(mediator.current_bubble);
            
            mediator.manager.registerModule(streamgraph, 'streamgraph')
            mediator.manager.call('streamgraph', 'start')
            mediator.manager.call('streamgraph', 'setupStreamgraph', [mediator.streamgraph_data])
            
            //TODO: implement for streamgraph
            mediator.manager.call('canvas', 'initEventsStreamgraph', []);
            
            mediator.manager.call('list', 'start');
            if (config.show_list) mediator.manager.call('list', 'show');
            mediator.manager.call('canvas', 'showInfoModal', []);
            
            //TODO implement for streamgraph
            //mediator.manager.call('canvas', 'hyphenateAreaTitles', []);
            //mediator.manager.call('canvas', 'dotdotdotAreaTitles', []);
            //mediator.manager.call('bubble', 'initMouseListeners', []);
            
        } else {
            if(config.is_force_papers && config.dynamic_force_papers) mediator.manager.call('headstart', 'dynamicForcePapers', [data.length]);
            if(config.is_force_area && config.dynamic_force_area) mediator.manager.call('headstart', 'dynamicForceAreas', [data.length]);
            if(config.dynamic_sizing) mediator.manager.call('headstart', 'dynamicSizing', [data.length]);
            if (config.render_bubbles) mediator.manager.registerModule(mediator.current_bubble, 'bubble');

            mediator.manager.call('canvas', 'setupCanvas', []);
            if(config.scale_toolbar) {
                mediator.manager.registerModule(scale, 'scale')
                mediator.manager.call('scale', 'drawScaleTypes', [])
            }


            mediator.manager.call('io', 'initializeMissingData', [data]);
            mediator.manager.call('io', 'prepareData', [highlight_data, data]);
            mediator.manager.call('io', 'prepareAreas', []);

            mediator.manager.call('io', 'setContext', [context, data.length]);
            mediator.manager.call('io', 'setInfo', [context]);
            mediator.manager.call('canvas', 'drawTitle', [context]);

            mediator.bubbles_update_data_and_areas(mediator.current_bubble);
            mediator.manager.call('bubble', 'start', [data, highlight_data]);
            mediator.manager.call('canvas', 'initEventsAndLayout', []);
            mediator.manager.call('papers', 'start', [ mediator.current_bubble ]);
            mediator.manager.call('bubble', 'draw', []);
            mediator.manager.call('list', 'start');
            if (!config.render_bubbles && config.show_list) mediator.manager.call('list', 'show');
            mediator.manager.call('canvas', 'checkForcePapers', []);
            mediator.manager.call('canvas', 'showInfoModal', []);
            mediator.manager.call('canvas', 'hyphenateAreaTitles', []);
            mediator.manager.call('canvas', 'dotdotdotAreaTitles', []);
            mediator.manager.call('bubble', 'initMouseListeners', []);
            }
    },

    update_canvas_domains: function(data) {
        mediator.manager.call('canvas', 'updateCanvasDomains', [data]);
    },

    update_canvas_data: function(data) {
        mediator.manager.call('canvas', 'updateData', [data]);
    },

    canvas_set_domain: function(prop, extent) {
        mediator.manager.call('canvas', 'setDomain', [prop, extent]);
    },

    set_area_radii: function(areas) {
        mediator.manager.call('canvas', 'setAreaRadii', [areas]);
    },

    set_new_area_coords: function(new_area, area) {
        mediator.manager.call('canvas', 'setNewAreaCoords', [new_area, area]);
    },

    buildHeadstartHTML: function() {
        // Build Headstart skeleton
        this.viz = $("#" + config.tag);
        this.viz.addClass("headstart");
        this.viz.append(headstartTemplate({
            credit_embed: config.credit_embed
            , canonical_url: config.canonical_url
            , is_authorview: config.is_authorview
        }));
        this.viz.append(infoTemplate());
        this.viz.append(iFrameTemplate());
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

    bubbles_update_data_and_areas: function(bubbles) {
        bubbles.data = io.data;
        bubbles.areas = io.areas;
        bubbles.areas_array = io.areas_array;
    },

    to_multiples: function() {
        mediator.manager.call('headstart', 'tomultiples', []);
    },

    list_toggle: function() {
        mediator.manager.call('list', 'toggle', []);
    },

    list_show_popup: function(d) {
        mediator.manager.call('list', 'populateOverlay', [d]);
    },

    list_title_click: function(d) {
        mediator.manager.call('list', 'title_click', [d]);
    },

    list_title_clickable: function(d) {
        mediator.manager.call('list', 'makeTitleClickable', [d]);
    },

    paper_click: function(d) {
        mediator.manager.call('papers', 'paper_click', [d]);
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    paper_mouseover: function(d, holder_div) {
        mediator.manager.call('papers', 'enlargePaper', [d, holder_div]);
    },

    paper_holder_clicked: function(holder) {
        mediator.manager.call('list', 'enlargeListItem', [holder]);
        if (mediator.modules.list.current == "hidden") {
            mediator.manager.call('list', 'show', []);
        }
        mediator.current_enlarged_paper = holder;
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    paper_current_bubble_clicked: function(area) {
        mediator.manager.call('list', 'reset', []);
        mediator.manager.call('list', 'filterListByArea', [area]);
        if (mediator.current_enlarged_paper) {
            mediator.current_enlarged_paper.paper_selected = false
        }
        mediator.current_enlarged_paper = null;
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    bubble_mouseout: function(d, circle, bubble_fsm) {
        bubble_fsm.mouseout(d, circle);
    },

    bubble_mouseover: function(d, circle, bubble_fsm) {
        bubble_fsm.mouseover(d, circle);
    },

    bubble_click: function(d, bubble) {
        bubble.zoomin(d);
        mediator.manager.call('papers', 'currentbubble_click', [d]);
    },

    bubble_zoomin: function(d) {
        $("#map-rect").removeClass("zoomed_out").addClass('zoomed_in');
        $("#region.unframed").addClass("zoomed_in");
        $(".paper_holder").addClass("zoomed_in");
        d3.selectAll("#paper_visual_distributions").style("display", "block")

        mediator.manager.call('list', 'reset', []);
        mediator.manager.call('list', 'scrollTop', []);
        if (typeof d != 'undefined') {
            mediator.manager.call('list', 'updateByFiltered', []);
            mediator.manager.call('list', 'filterListByAreaURIorArea', [d]);
        }
        if (mediator.current_zoom_mode !== null && typeof mediator.current_zoom_mode != 'undefined') {
            if (typeof d != 'undefined') {
                mediator.manager.call('list', 'updateByFiltered', []);
            }
        }
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },
    bubble_zoomout: function() {
        mediator.manager.call('list', 'reset', []);
        mediator.manager.call('list', 'updateByFiltered', []);
        mediator.manager.call('list', 'scrollTop', []);

        $("#map-rect").removeClass("zoomed_in").addClass('zoomed_out');
        $("#region.unframed").removeClass("zoomed_in");
        $(".paper_holder").removeClass("zoomed_in");
        d3.selectAll("#paper_visual_distributions").style("display", "none")
    },
    
    zoomout_complete: function() {
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    zoomin_complete: function() {
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    currentbubble_click: function(d) {
        mediator.manager.call('papers', 'currentbubble_click', [d]);
        mediator.manager.call('list', 'count_visible_items_to_header', []);
    },

    bookmark_added: function(d) {
        mediator.manager.call('list', 'addBookmark', [d]);
    },

    bookmark_removed: function(d) {
        mediator.manager.call('list', 'removeBookmark', [d]);
    },

    preview_mouseover: function(current_item) {
        current_item.select("#transbox")
            .style("display", "block");
    },

    preview_mouseout: function(current_item) {
        current_item.select("#transbox")
            .style("display", "none");
    },

    record_action: function(id, category, action, user, type, timestamp, additional_params, post_data) {
        headstart.recordAction(id, category, action, user, type, timestamp, additional_params, post_data);
    },
    
    mark_project_changed: function(id) {
        headstart.markProjectChanged(id);
    },

    window_resize: function() {
        if(config.is_streamgraph) {
            $('.line_helper').remove();
            $('#headstart-chart').empty();
            mediator.manager.call('canvas', 'calcChartSize');
            mediator.manager.call('canvas', 'createStreamgraphCanvas');
            mediator.manager.call('streamgraph', 'setupStreamgraph', [mediator.streamgraph_data]);
            mediator.manager.call('list', 'fit_list_height', []);
        } else {
            mediator.resized_scale_x = d3.scale.linear();
            mediator.resized_scale_y = d3.scale.linear();
            mediator.manager.call('canvas', 'setupResizedCanvas', []);
            mediator.manager.call('list', 'fit_list_height', []);
            mediator.manager.call('bubble', 'onWindowResize', []);
            mediator.manager.call('papers', 'onWindowResize', []);
            mediator.manager.call('canvas', 'dotdotdotAreaTitles', []);
        }
    },

    on_rect_mouseover: function() {
        if (!mediator.is_zoomed) {
          mediator.manager.call('bubble', 'onmouseout', ['notzoomedmouseout']);
          mediator.current_circle = null;
        }
        else {
        }
        mediator.manager.call('bubble', 'mouseout', ['outofbigbubble']);
    },

    on_rect_mouseout: function () {
    },

    chart_svg_click: function() {
        mediator.manager.call('bubble', 'zoomout', []);
    },

    check_force_papers: function() {
        if (config.show_list) {
            mediator.manager.call('list', 'show', []);
        }
        mediator.manager.call('list', 'count_visible_items_to_header')
    },
    
    draw_title: function () {
        let context = io.context;
        mediator.manager.call('canvas', 'drawTitle', [context]);
    },

    list_click_paper_list: function(d) {
        mediator.manager.call('canvas', 'getCurrentCircle', [d]);
        if(mediator.current_circle) mediator.manager.call('bubble', 'zoomin', [mediator.current_circle.data()[0]])
        mediator.current_bubble.current = "hoverbig";
        mediator.manager.call('papers', 'mouseoverpaper', []);
        mediator.manager.call('list', 'enlargeListItem', [d]);
        mediator.current_enlarged_paper = d;
        mediator.manager.call('papers', 'framePaper', [d]);
        mediator.manager.call('list', 'count_visible_items_to_header')
    },
    
    update_visual_distributions: function(type) {
        let context = io.context;
        
        mediator.manager.call('bubble', 'updateVisualDistributions', [type, context]);
        mediator.manager.call('papers', 'updateVisualDistributions', [type, context]);
        mediator.manager.call('list', 'updateVisualDistributions', [type, context]);
        
        if(config.cris_legend) {
            mediator.manager.call('scale', 'updateLegend', [type, context]);
        }
        mediator.manager.call('canvas', 'dotdotdotAreaTitles', []);
    }
};

export const mediator = new MyMediator();

import { headstart } from 'headstart';
import Mediator from 'mediator-js';
import config from 'config';
import { papers } from 'papers';
import { BubblesFSM } from 'bubbles';
import { list } from 'list';
import { io } from 'io';
import { canvas } from 'canvas';
import { scale } from './scale';

const timelineTemplate = require('templates/timeline.handlebars');
const headstartTemplate = require("templates/headstart.handlebars");
const infoTemplate = require("templates/misc/info_modal.handlebars");
const iFrameTemplate = require("templates/misc/iframe_modal.handlebars");
const imageTemplate = require("templates/misc/images_modal.handlebars");
const editTemplate = require("templates/misc/viper_edit_modal.handlebars");
const embedTemplate = require("templates/misc/viper_embed_modal.handlebars");
const scaleToolbarTemplate = require("templates/misc/scale_toolbar.handlebars");

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
        this.modules = { papers: papers, list: list, io: io, canvas: canvas, scale: scale};
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("start", this.buildHeadstartHTML);
        this.mediator.subscribe("start", this.set_normal_mode);
        this.mediator.subscribe("start", this.register_bubbles);
        this.mediator.subscribe("start", this.init_modules);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("ontotimeline", this.init_ontotimeline);
        this.mediator.subscribe("ontotimeline_finish", this.ontotimeline_finish);
        this.mediator.subscribe("register_bubbles", this.register_bubbles);
        this.mediator.subscribe("to_timeline", this.to_timeline);

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

        // misc
        this.mediator.subscribe("record_action", this.record_action);
        this.mediator.subscribe("check_force_papers", this.check_force_papers);

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
        if(config.scale_types.lenght > 0) {
            mediator.manager.registerModule(scale, 'scale')
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
        mediator.is_in_timeline_mode = false;
        mediator.current_file_number = file;
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
        mediator.current_file = config.files[mediator.current_file_number];
        papers.current = "none";
        list.current = "none";
        $("#list_explorer").empty();
        mediator.manager.call('canvas', 'setupToFileCanvas', []);
    },

    init_ontotimeline: function() {
        mediator.is_in_normal_mode = false;
        mediator.is_in_timeline_mode = true;
        mediator.current_bubble.current = "x";
        papers.current = "none";
        list.current = "none";
        // clear the list list
        $("#list_explorer").empty();
        mediator.manager.call('canvas', 'setupTimelineCanvas', []);
    },

    set_normal_mode: function() {
        mediator.is_in_normal_mode = true;
        mediator.is_in_timeline_mode = false;
    },

    ontotimeline_finish: function() {
        mediator.manager.call('canvas', 'drawGrid', []);
        mediator.manager.call('canvas', 'initMouseListeners', []);
    },

    init_start_visualization: function(highlight_data, csv) {
        mediator.manager.registerModule(headstart, 'headstart');
        if (config.render_bubbles) mediator.manager.registerModule(mediator.current_bubble, 'bubble');
        mediator.manager.call('canvas', 'setupCanvas', []);
        mediator.manager.registerModule(scale, 'scale')
        mediator.manager.call('scale', 'drawScaleTypes', [])
        let data = (config.show_context)?(JSON.parse(csv.data)):csv;
        let context = (config.show_context)?(csv.context):{};
        
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
        this.viz.append(headstartTemplate());
        this.viz.append(infoTemplate());
        this.viz.append(iFrameTemplate());
        this.viz.append(imageTemplate());
        this.viz.append(editTemplate());
        this.viz.append(embedTemplate());
        
        if (config.scale_types.length > 0) {
            this.viz.append(scaleToolbarTemplate({
                scale_by_label: config.localization[config.language].scale_by_label
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

    to_timeline: function() {
        mediator.manager.call('headstart', 'totimeline', []);
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
    },

    paper_mouseover: function(d, holder_div) {
        mediator.manager.call('papers', 'enlargePaper', [d, holder_div]);
    },

    paper_holder_clicked: function(holder) {
        mediator.manager.call('list', 'enlargeListItem', [holder]);
        if (mediator.modules.list.current == "hidden") {
            mediator.manager.call('list', 'show', []);
        }
    },

    paper_current_bubble_clicked: function(area) {
        mediator.manager.call('list', 'reset', []);
        mediator.manager.call('list', 'filterListByArea', [area]);
    },

    bubble_mouseout: function(d, circle, bubble_fsm) {
        bubble_fsm.mouseout(d, circle);
    },

    bubble_mouseover: function(d, circle, bubble_fsm) {
        bubble_fsm.mouseover(d, circle);
    },

    bubble_click: function(d, bubble) {
        bubble.zoomin(d);
    },

    bubble_zoomin: function(d) {
        $("#map-rect").removeClass("zoomed_out").addClass('zoomed_in');
        $("#region.unframed").addClass("zoomed_in");
        $(".paper_holder").addClass("zoomed_in");

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
    },
    bubble_zoomout: function() {
        mediator.manager.call('list', 'reset', []);
        mediator.manager.call('list', 'updateByFiltered', []);
        mediator.manager.call('list', 'scrollTop', []);

        $("#map-rect").removeClass("zoomed_in").addClass('zoomed_out');
        $("#region.unframed").removeClass("zoomed_in");
        $(".paper_holder").removeClass("zoomed_in");
    },

    currentbubble_click: function(d) {
        mediator.manager.call('papers', 'currentbubble_click', [d]);
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

    record_action: function(id, action, user, type, timestamp, additional_params, post_data) {
        headstart.recordAction(id, action, user, type, timestamp, additional_params, post_data);
    },

    window_resize: function() {
        mediator.resized_scale_x = d3.scale.linear();
        mediator.resized_scale_y = d3.scale.linear();
        mediator.manager.call('canvas', 'setupResizedCanvas', []);
        mediator.manager.call('list', 'fit_list_height', []);
        mediator.manager.call('bubble', 'onWindowResize', []);
        mediator.manager.call('papers', 'onWindowResize', []);
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
    }
};

export const mediator = new MyMediator();

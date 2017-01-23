import { headstart } from 'headstart';
import Mediator from 'mediator-js';
import config from 'config';
import { papers } from 'papers';
import { BubblesFSM } from 'bubbles';
import { list } from 'list';
import { sortBy } from 'helpers';
import { io } from 'io';
import { canvas } from 'canvas';

var MyMediator = function() {
    // mediator
    this.fileData = [];
    this.mediator = new Mediator();
    this.init();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // init logic
        this.modules = { papers: papers, list: list, io: io, canvas: canvas};
        this.mediator.subscribe("start_visualization", this.init_start_visualization);
        this.mediator.subscribe("ontofile", this.init_ontofile);
        this.mediator.subscribe("ontotimeline", this.init_ontotimeline);
        this.mediator.subscribe("ontotimeline_finish", this.finish_ontotimeline);
        this.mediator.subscribe("registerBubbles", this.registerBubbles);
        this.mediator.subscribe("initState", this.initState);

        // data handling
        this.mediator.subscribe("prepare_data", this.io_prepare_data);
        this.mediator.subscribe("prepare_areas", this.io_prepare_areas);

        // async calls
        this.mediator.subscribe("get_data_from_files", this.io_async_get_data);

        // popup
        this.mediator.subscribe("to_timeline", this.to_timeline);

        // list
        this.mediator.subscribe("list_toggle", this.list_toggle);
        this.mediator.subscribe("list_show_popup", this.list_show_popup);
        this.mediator.subscribe("list_title_click", this.list_title_click);
        this.mediator.subscribe("list_sort_click", this.list_sort_click);
        this.mediator.subscribe("list_title_clickable", this.list_title_clickable);
        this.mediator.subscribe("preview_mouseover", this.preview_mouseover);
        this.mediator.subscribe("preview_mouseout", this.preview_mouseout);
        this.mediator.subscribe("list_click_paper_list", this.list_click_paper_list);

        // papers
        this.mediator.subscribe("paper_click", this.paper_click);
        this.mediator.subscribe("paper_mouseover", this.paper_mouseover);
        this.mediator.subscribe("currentbubble_click", this.currentbubble_click);
        this.mediator.subscribe("papers_leave_loading",
          () => {return;});
        this.mediator.subscribe("paper_holder_clicked", this.paper_holder_clicked);
        this.mediator.subscribe("paper_current_bubble_clicked", this.paper_current_bubble_clicked);

        // bubbles
        this.mediator.subscribe("bubble_mouseout", this.bubble_mouseout);
        this.mediator.subscribe("bubble_mouseover", this.bubble_mouseover);
        this.mediator.subscribe("bubble_click", this.bubble_click);
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);
        this.mediator.subscribe("bubble_zoomin", this.bubble_zoomin);
        this.mediator.subscribe("bubble_zoomout", this.bubble_zoomout);

        // bookmarks
        this.mediator.subscribe("bookmark_added", this.bookmark_added);
        this.mediator.subscribe("bookmark_removed", this.bookmark_removed);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
        this.mediator.subscribe("window_resize", this.window_resize);
        this.mediator.subscribe("check_force_papers", this.check_force_papers);
        this.mediator.subscribe("setup_timeline_canvas", this.setup_timeline_canvas);
        this.mediator.subscribe("setup_tofile_canvas", this.setup_tofile_canvas);
    },

    initState: function() {
        mediator.current_zoom_node = null;
        mediator.current_enlarged_paper = null;
        mediator.current_file_number = 0;
        mediator.current_circle = null;
        mediator.papers_list = null;
        mediator.circle_zoom = 0;
        mediator.is_zoomed = false;
        mediator.zoom_finished = false;
    },

    registerBubbles: function() {
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

    io_async_get_data: function (input_format, callback) {
        // WORKAROUND, if I try to add headstart earlier it doesn't work
        // TODO find reason
        mediator.modules.headstart = headstart;
        mediator.current_file = config.files[mediator.current_file_number];
        mediator.tryToCall(() => { mediator.modules.io.async_get_data(mediator.current_file, input_format, callback); });
    },

    io_prepare_data: function (highlight_data, cur_fil_num) {
        mediator.tryToCall(() => { mediator.modules.io.prepareData(highlight_data, cur_fil_num); });
    },

    io_prepare_areas: function () {
        mediator.tryToCall(() => { mediator.modules.io.prepareAreas(); });
    },

    init_ontofile: function (file) {
        mediator.current_file_number = file;
        mediator.current_bubble = mediator.bubbles[mediator.current_file_number];
        mediator.current_file = config.files[mediator.current_file_number];
        papers.current = "none";
        list.current = "none";
        mediator.tryToCall(() => { mediator.modules.canvas.setupToFileCanvas(); });
    },

    init_ontotimeline: function() {
        mediator.current_bubble.current = "x";
        mediator.tryToCall(() => { mediator.modules.canvas.setupTimelineCanvas(); });
    },

    finish_ontotimeline: function() {
        mediator.tryToCall(() => { mediator.modules.canvas.drawGrid(); });
        mediator.tryToCall(() => { mediator.modules.canvas.initMouseListeners(); });
    },

    init_start_visualization: function(highlight_data, csv) {
        mediator.tryToCall(() => { mediator.modules.canvas.setupCanvas(); });
        mediator.tryToCall(() => { mediator.modules.io.prepareData(highlight_data, csv); });
        mediator.tryToCall(() => { mediator.modules.io.prepareAreas(); });
        mediator.tryToCall(() => { mediator.current_bubble.start( csv, highlight_data ); });
        mediator.tryToCall(() => { mediator.modules.canvas.initEventsAndLayout(); });
        mediator.tryToCall(() => { mediator.modules.papers.start( mediator.current_bubble ); });
        mediator.tryToCall(() => { mediator.current_bubble.draw(); });
        mediator.tryToCall(() => { mediator.modules.list.start( mediator.current_bubble ); });
        mediator.tryToCall(() => { mediator.modules.canvas.checkForcePapers(); });
        mediator.tryToCall(() => { mediator.modules.canvas.showInfoModal(); });
        mediator.tryToCall(() => { mediator.modules.canvas.hyphenateAreaTitles(); });
        mediator.tryToCall(() => { mediator.modules.canvas.dotdotdotAreaTitles(); });
        mediator.tryToCall(() => { mediator.current_bubble.initMouseListeners(); });
    },

    bubbles_update_data_and_areas: function(bubbles) {
        bubbles.data = io.data;
        bubbles.areas = io.areas;
        bubbles.areas_array = io.areas_array;
    },

    to_timeline: function() {
        mediator.tryToCall(() => { mediator.modules.headstart.totimeline(); });
    },

    list_toggle: function() {
        mediator.tryToCall(() => { mediator.modules.list.toggle(); });
    },

    list_show_popup: function(d) {
        mediator.tryToCall(() => { mediator.modules.list.populateOverlay(d); });
    },

    list_title_click: function(d) {
        mediator.tryToCall(() => { mediator.modules.list.title_click(d); });
    },

    list_sort_click: function(sort_option) {
        mediator.tryToCall(() => { mediator.modules.sortBy(sort_option); });
    },

    list_title_clickable: function(d) {
        mediator.tryToCall(() => { mediator.modules.list.makeTitleClickable(d); });
    },

    paper_click: function(d) {
        mediator.tryToCall(() => { mediator.modules.papers.paper_click(d); });
    },

    paper_mouseover: function(d, holder_div) {
        mediator.tryToCall(() => { mediator.modules.papers.enlargePaper(d, holder_div); });
    },

    paper_holder_clicked: function(holder) {
        mediator.tryToCall(() => { mediator.modules.list.enlargeListItem(holder); });
        if (mediator.modules.list.current == "hidden") {
            mediator.tryToCall(() => { mediator.modules.list.show(); });
        }
    },

    paper_current_bubble_clicked: function(area) {
        mediator.tryToCall(() => { mediator.modules.list.reset(); });
        mediator.tryToCall(() => { mediator.modules.list.filterListByArea(area); });
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
        mediator.tryToCall(() => { mediator.modules.list.reset(); });
        if (typeof d != 'undefined') {
            mediator.tryToCall(() => { mediator.modules.list.updateByFiltered(); });
            mediator.tryToCall(() => { mediator.modules.list.filterListByAreaURIorArea(d); });
        }
        if (headstart.current_zoom_mode !== null && typeof headstart.current_zoom_mode != 'undefined') {
            if (typeof d != 'undefined') {
                mediator.tryToCall(() => { mediator.modules.list.updateByFiltered(); });
            }
        }
    },
    bubble_zoomout: function() {
        mediator.tryToCall(() => { mediator.modules.list.reset(); });
        mediator.tryToCall(() => { mediator.modules.list.updateByFiltered(); });
    },
    currentbubble_click: function(d) {
        mediator.tryToCall(() => { mediator.modules.papers.currentbubble_click(d); });
    },

    bookmark_added: function(d) {
        mediator.tryToCall(() => { mediator.modules.list.addBookmark(d); });
    },

    bookmark_removed: function(d) {
        mediator.tryToCall(() => { mediator.modules.list.removeBookmark(d); });
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
        mediator.tryToCall(() => { mediator.modules.list.fit_list_height(); });
    },
    check_force_papers: function() {
        if (config.show_list) {
            mediator.tryToCall(() => { mediator.modules.list.show(); });
        }
    },
    setup_timeline_canvas: function() {
        papers.current = "none";
        list.current = "none";
        // clear the list list
        $("#list_explorer").empty();
    },

    setup_tofile_canvas: function() {
        $("#list_explorer").empty();
    },

    list_click_paper_list: function(d) {
        headstart.current_circle = canvas.getCurrentCircle(d);
        mediator.current_bubble.zoomin(headstart.current_circle.data()[0]);
        mediator.current_bubble.current = "hoverbig";
        mediator.tryToCall(() => { mediator.modules.papers.mouseoverpaper(); });
        headstart.current_enlarged_paper = d;
        mediator.tryToCall(() => { mediator.modules.papers.framePaper(d); });
    }
};

export const mediator = new MyMediator();

import $ from 'jquery';
import Mediator from 'mediator-js';
import { headstart } from 'headstart';
import { papers } from 'papers';
import { list } from 'list';
import { sortBy } from 'helpers'; 

var MyMediator = function() {

    // mediator
    this.mediator = new Mediator();
    this.init();

    this.mediator_states = {
        popup_visible: false
    };
};

MyMediator.prototype = {
    init: function() {
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

        // papers
        this.mediator.subscribe("paper_click", this.paper_click);
        this.mediator.subscribe("paper_mouseover", this.paper_mouseover);
        this.mediator.subscribe("currentbubble_click", this.currentbubble_click);

        // bubbles
        this.mediator.subscribe("bubble_mouseout", this.bubble_mouseout);
        this.mediator.subscribe("bubble_mouseover", this.bubble_mouseover);
        this.mediator.subscribe("bubble_click", this.bubble_click);

        // bookmarks
        this.mediator.subscribe("bookmark_added", this.bookmark_added);
        this.mediator.subscribe("bookmark_removed", this.bookmark_removed);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
    },

    publish: function() {
        this.mediator.publish(...arguments);
    },

    to_timeline: function() {
        headstart.totimeline();
    },

    list_toggle: function() {
        list.toggle();
    },

    list_show_popup: function(d) {
        list.populateOverlay(d);
    },

    list_title_click: function(d) {
        list.title_click(d);
    },

    list_sort_click: function(sort_option) {
        sortBy(sort_option);
    },

    list_title_clickable: function(d) {
        list.makeTitleClickable(d);
    },

    paper_click: function(d) {
        papers.paper_click(d);
    },

    paper_mouseover: function(d, holder_div) {
        papers.enlargePaper(d, holder_div);
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

    currentbubble_click: function(d) {
        papers.currentbubble_click(d);
    },

    bookmark_added: function(d) {
        list.addBookmark(d);
    },

    bookmark_removed: function(d) {
        list.removeBookmark(d);
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
    }
};

export const mediator = new MyMediator();

import Mediator from 'mediator-js';
import { headstart } from 'headstart';
import { papers } from 'papers';
import { list } from 'list';
import { sortBy } from 'helpers';
import { io } from 'io';

var MyMediator = function() {

    // mediator
    this.fileData = [];
    this.mediator = new Mediator();
    this.init();
};

MyMediator.prototype = {
    constructor: MyMediator,
    init: function() {
        // data handling
        this.mediator.subscribe("prepare_data", this.io_prepare_data);
        this.mediator.subscribe("prepare_areas", this.io_prepare_areas);

        this.mediator.subscribe("window_resized", this.window_resize);

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

        // papers
        this.mediator.subscribe("paper_click", this.paper_click);
        this.mediator.subscribe("paper_mouseover", this.paper_mouseover);
        this.mediator.subscribe("currentbubble_click", this.currentbubble_click);

        // bubbles
        this.mediator.subscribe("bubble_mouseout", this.bubble_mouseout);
        this.mediator.subscribe("bubble_mouseover", this.bubble_mouseover);
        this.mediator.subscribe("bubble_click", this.bubble_click);
        this.mediator.subscribe("bubbles_update_data_and_areas", this.bubbles_update_data_and_areas);

        // bookmarks
        this.mediator.subscribe("bookmark_added", this.bookmark_added);
        this.mediator.subscribe("bookmark_removed", this.bookmark_removed);

        // misc
        this.mediator.subscribe("record_action", this.record_action);
    },

    publish: function() {
        this.mediator.publish(...arguments);
    },

    window_resize: function(self) {
        if (headstart.is("timeline")) {
            return;
        }

        let resized_scale_x = d3.scale.linear();
        let resized_scale_y = d3.scale.linear();

        resized_scale_x.domain([0, headstart.current_vis_size]);
        resized_scale_y.domain([0, headstart.current_vis_size]);

        headstart.calcChartSize();
        headstart.setScaleRanges();
        headstart.drawSvg(true);
        headstart.updateChartCanvas();
        list.fit_list_height();

        resized_scale_x.range([0, headstart.current_vis_size]);
        resized_scale_y.range([0, headstart.current_vis_size]);

        self.transform_bubble_frames(resized_scale_x, resized_scale_y);
        self.change_circle_radii();
        self.scale_area_title_objects();
        self.transform_papers(resized_scale_x, resized_scale_y);
        self.transform_paper_holders();
        self.transform_metadata();
        self.transform_readers();
    },

    transform_bubble_frames: function(resized_scale_x, resized_scale_y) {
        d3.selectAll("g.bubble_frame")
          .attr("transform", (d) => {
              d.x_zoomed = resized_scale_x(d.x_zoomed);
              d.y_zoomed = resized_scale_y(d.y_zoomed);
              d.x = resized_scale_x(d.x);
              d.y = resized_scale_y(d.y);
              if (headstart.is_zoomed === true) {
                  return "translate(" + d.x_zoomed + "," + d.y_zoomed + ")";
              } else {
                  return "translate(" + d.x + "," + d.y + ")";
              }
          });
    },

    change_circle_radii: function() {
        d3.selectAll("circle")
          .attr("r", (d) => {
              d.r_zoomed = headstart.circle_size(d.readers) * headstart.circle_zoom;
              d.r = headstart.circle_size(d.readers);
              if (headstart.is_zoomed === true) {
                  return d.r_zoomed;
              } else {
                  return d.r;
              }
          });
    },

    scale_area_title_objects: function() {
        var area_title_objects = d3.selectAll("#area_title_object");

        area_title_objects.each((d) => {
            d.height_html = Math.sqrt(Math.pow(d.r,2)*2);
            d.width_html = Math.sqrt(Math.pow(d.r,2)*2);
            d.x_html = 0 - d.width_html/2;
            d.y_html = 0 - d.height_html/2;
        });

        area_title_objects
          .attr("x",      (d) => { return d.x_html;})
          .attr("y",      (d) => { return d.y_html;})
          .attr("width",  (d) => { return d.width_html;})
          .attr("height", (d) => { return d.height_html;});

        area_title_objects.each(function() {
            d3.select(this).select("#area_title")
              .style("width", (d) => {
                  return d.width_html + "px";
              })
              .style("height", (d) => {
                  return d.height_html + "px"; });
        });

        $("#area_title>h2").css("font-size", headstart.calcTitleFontSize());
        $("#area_title>h2").hyphenate('en');
        $("#area_title_object>body").dotdotdot({wrap:"letter"});
    },

    transform_papers: function(resized_scale_x, resized_scale_y) {
        d3.selectAll("g.paper")
          .attr("transform", (d) => {
              d.x_zoomed = resized_scale_x(d.x_zoomed);
              d.y_zoomed = resized_scale_y(d.y_zoomed);
              d.x = resized_scale_x(d.x);
              d.y = resized_scale_y(d.y);
              if (headstart.is_zoomed === true) {
                  return "translate(" + d.x_zoomed + "," + d.y_zoomed + ")";
              } else {
                  return "translate(" + d.x + "," + d.y + ")";
              }
          });
    },

    transform_paper_holders: function() {


        var paper_holders = d3.selectAll("div.paper_holder");

        paper_holders.each((d) => {
            d.diameter = headstart.diameter_size(d.internal_readers);
            d.width = headstart.paper_width_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
            d.height = headstart.paper_height_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
            d.top_factor = (1-headstart.dogear_width);

            d.width_zoomed = d.width * headstart.circle_zoom;
            d.height_zoomed = d.height * headstart.circle_zoom;

            d.resize_width = (headstart.is_zoomed)?(d.width_zoomed):(d.width);
            d.resize_height = (headstart.is_zoomed)?(d.height_zoomed):(d.height);
        });

        d3.selectAll("#region")
          .attr("d", (d) => {
              return papers.createPaperPath(0, 0, d.resize_width, d.resize_height);
          });

        d3.selectAll("path.dogear")
          .attr("d", (d) => {
              return papers.createDogearPath(d.resize_width*d.top_factor, 0, d.resize_width, d.resize_height);
          });
    },

    transform_metadata: function() {
        //webkit bug
        d3.selectAll("#article_metadata")
          .attr("width", (d) => { return d.resize_width; })
          .attr("height", (d) => { return d.resize_height; });

        d3.selectAll("div.metadata")
          .style("width", (d) => {
              return d.resize_width * d.top_factor + "px";
          })
          .style("height", (d) => {
              if(!headstart.is_zoomed) {
                  return (headstart.content_based)?(d.resize_height):(d.resize_height * 0.8 + "px");
              } else {
                  return (headstart.content_based)?(d.resize_height + "px"):(d.resize_height - 20 + "px");
              }
          });
    },

    transform_readers: function() {
        d3.selectAll("div.readers")
          .style("height", (d) => {
              if (headstart.is_zoomed === false) {
                  return d.resize_height * 0.2 + "px";
              } else {
                  return "15px";
              }
          })
          .style("width", function(d) {
              return d.resize_width + "px";
          });
    },

    io_async_get_data: function (file, input_format, callback) {
        io.async_get_data(file, input_format, callback);
    },

    io_prepare_data: function (highlight_data, cur_fil_num) {
        io.prepareData(highlight_data, cur_fil_num);
    },

    io_prepare_areas: function () {
        io.prepareAreas();
    },

    bubbles_update_data_and_areas: function(bubbles) {
        bubbles.data = io.data;
        bubbles.areas = io.areas;
        bubbles.areas_array = io.areas_array;
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
        console.log("LIST TITLE CLICKABLE");
        mediator.get_circle_and_zoom_in(d);
        papers.mouseoverpaper();
        list.enlargeListItem(d);
        mediator.publish("record_action", d.id, "click_paper_list", headstart.user_id, d.bookmarked + " " + d.recommended, null);
        d3.event.stopPropagation();
    },

    get_circle_and_zoom_in: function(d) {
        headstart.current_circle = headstart.chart.selectAll("circle")
          .filter(function(x) {
              if (headstart.use_area_uri) {
                  return x.area_uri == d.area_uri;
              } else {
                  return x.title == d.area;
              }
          });

        headstart.bubbles[headstart.current_file_number].zoomin(headstart.current_circle.data()[0]);
        headstart.bubbles[headstart.current_file_number].current = "hoverbig";
        headstart.current_enlarged_paper = d;
        d3.selectAll("path#region")
          .filter(function(x) {
              return x.id === d.id;
          })
          .attr("class", "framed");
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

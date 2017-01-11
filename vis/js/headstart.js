// Headstart
// filename: headstart.js
import StateMachine from 'javascript-state-machine';

import config from 'config';

import { mediator } from 'mediator';
import { BubblesFSM } from 'bubbles';
import { papers } from 'papers';
import { list } from 'list';

import { intros } from 'intro';
import { getRealHeight } from "helpers";
import { BrowserDetect, highlight } from "helpers";
  
const timelineTemplate = require('templates/timeline.handlebars');
const headstartTemplate = require("templates/headstart.handlebars");
const infoTemplate = require("templates/misc/info_modal.handlebars");
const iFrameTemplate = require("templates/misc/iframe_modal.handlebars");
const imageTemplate = require("templates/misc/images_modal.handlebars");

import 'hypher';
import 'lib/en.js';
import 'dotdotdot';

export var headstart;
export var HeadstartFSM = function() {
  this.VERSION = 2.9;

  // Load default config + local settings and extend headstart object
  Object.assign(this, config, data_config);

  // Build Headstart skeleton
  this.viz = $("#" + this.tag);
  this.viz.addClass("headstart");

  this.viz.append(headstartTemplate());
  this.viz.append(infoTemplate());
  this.viz.append(iFrameTemplate());
  this.viz.append(imageTemplate());

  if (!this.render_bubbles_papers) {
    d3.select("div.vis-col").attr("style", "width:0px;height:0px;visibility:hidden");
    d3.select("div.list-col").attr("style", "width:100%");
  }

  if (!this.render_list) {
    d3.select("div.list-col").attr("style", "visibility:hidden;width:0%");
  }
  // contains bubbles objects for the timline view
  // elements get added to bubbles by calling registerBubbles()
  this.bubbles = {};
  
  this.current_zoom_node = null;
  this.current_enlarged_paper = null;
  this.current_file_number = 1;
  this.current_circle = null;
  this.papers_list = null;
  this.circle_zoom = 0;
  this.is_zoomed = false;
  this.zoom_finished = false;
}; // end HeadstartFSM constructor

HeadstartFSM.prototype = {

  // prototype methods
  checkBrowserVersions: function() {
    var browser = BrowserDetect.browser;

    if (browser !== "Firefox" && browser !== "Safari" && browser !== "Chrome") {
            alert("You are using an unsupported browser. This visualization was successfully tested with the latest versions of Chrome, Safari, Opera and Firefox.");
    }
  },

  recordAction: function(id, action, user, type, timestamp, additional_params, post_data) {

    if(!this.is_evaluation) {
      return;
    }

    timestamp = (typeof timestamp !== 'undefined') ? (escape(timestamp)) : ("");
    additional_params = (typeof additional_params !== 'undefined') ? ('&' + additional_params) : ("");
    if(typeof post_data !== 'undefined') {
      post_data = {post_data:post_data};
    } else {
      post_data = {};
    }

    let php_script = this.server_url + "services/writeActionToLog.php";

    $.ajax({
        url: php_script +
        '?user=' + user +
        '&action=' + action +
        '&item=' + escape(id) +
        '&type=' + type +
        '&item_timestamp=' + timestamp + additional_params + '&jsoncallback=?',
        type: "POST",
        data: post_data,
        dataType: "json",
        success: function(output) {
            console.log(output);
        }
    });
    },

  resetBubbles: function () {
    if(this.bubbles) {
      delete this.bubbles;
      this.bubbles = {};
    }
    
    $.each(this.files, (index, elem) => {
      var bubble = new BubblesFSM();
      this.registerBubbles(bubble);
      bubble.title = elem.title;
      bubble.file = elem.file;
    });
  },

  calcChartSize: function() {
      var parent_height = getRealHeight($("#" + this.tag));
      var subtitle_heigth = $("#subdiscipline_title").outerHeight(true);

      if (parent_height === 0) {
          this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - subtitle_heigth;
      } else {
          this.available_height = $("#" + this.tag).height() - subtitle_heigth;
      }

      this.available_height = this.available_height - 1;

      if (this.is("timeline")) {
          var timeline_height = $(".tl-title").outerHeight(true);
          this.available_height =  this.available_height - timeline_height;
          this.available_width = $("#" + this.tag).width();
      } else {
          this.available_width = $("#" + this.tag).width() - $("#list_explorer").width(); 
      }

      if (this.availableSizeIsBiggerThanMinSize()) {
          if (this.available_width >= this.available_height) {
              this.current_vis_size = this.available_height;
          } else {
              this.current_vis_size = this.available_width;
          }
      } else {
          this.current_vis_size = this.getMinSize();
      }

      if (this.current_vis_size > this.max_height) {
          this.current_vis_size = this.max_height;
      }
  },


  // Calculate all scales for the current map
  initScales: function() {
      // Init all scales
      this.chart_x = d3.scale.linear();
      this.chart_y = d3.scale.linear();

      this.chart_x_circle = d3.scale.linear();
      this.chart_y_circle = d3.scale.linear();

      this.x = d3.scale.linear();
      this.y = d3.scale.linear();
      
      this.paper_x = d3.scale.linear();
      this.paper_y = d3.scale.linear();

      this.circle_size = d3.scale.sqrt();
      this.diameter_size = d3.scale.sqrt();
  },

  setScaleRanges: function() {
      // Calculate correct scaling factors and paper/circle dimensions
      this.correction_factor = this.current_vis_size / this.reference_size;

      this.circle_min = (this.min_area_size * this.correction_factor) * this.bubble_min_scale;
      this.circle_max = (this.max_area_size * this.correction_factor) * this.bubble_max_scale;
      this.circle_size.range([this.circle_min, this.circle_max]);

      this.paper_min = (this.min_diameter_size * this.correction_factor) * this.paper_min_scale;
      this.paper_max = (this.max_diameter_size * this.correction_factor) * this.paper_max_scale;
      this.diameter_size.range([this.paper_min, this.paper_max]);

      // Set ranges on scales
      this.padding_articles = 5; //this.paper_max;
      this.chart_x.range([this.padding_articles, this.current_vis_size - this.padding_articles]);
      this.chart_y.range([this.padding_articles, this.current_vis_size - this.padding_articles]);

      this.circle_padding = this.circle_max/2 + 45;
      this.chart_x_circle.range([this.circle_padding, this.current_vis_size - this.circle_padding]);
      this.chart_y_circle.range([this.circle_padding, this.current_vis_size - this.circle_padding]);

      var zoomed_article_padding = 60;
      this.x.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);
      this.y.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);
      
      var zoomed_article_padding_paper = 35;
      this.paper_x.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
      this.paper_y.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
  },

  // Size helper functions
  getMinSize: function() {
      if (this.min_height >= this.min_width) {
          return this.min_width;
      } else {
          return this.min_height;
      }
  },

  availableSizeIsBiggerThanMinSize: function() {
    if ( this.available_width > this.min_width && this.available_height > this.min_height ) {
      return true;
    } else {
      return false;
    }
  },

  // auto if enough space is available, else hidden
  setOverflowToHiddenOrAuto: function( selector ) {
    var overflow = "hidden";

    if ( this.current_vis_size > this.available_height ||
         this.current_vis_size + this.list_width > this.available_width ){
        overflow = "auto";
    }

    d3.select( selector ).style( "overflow" , overflow );
  },

  // Draw basic SVG canvas
  // NOTE attribute width addition by number of elements
  drawSvg: function(update) {
      
      update = typeof update !== 'undefined' ? update : false;
      
      this.svg = d3.select("#chart-svg");

      if (this.is("timeline")) {
          let s = this.current_vis_size * Object.keys(this.bubbles).length;
          this.svg.attr("width", s)
                  .attr("height", this.current_vis_size);
          if (update === false) {
            this.svg.attr("viewBox", "0 0 " + s + " " + this.current_vis_size);
          }
      } else {
          this.svg.attr("height", this.current_vis_size + "px")
              .attr("width", this.current_vis_size + "px");
              //.attr("preserveAspectRatio", "xMidYMid meet");
          if (update === false) {
            //this.svg.attr("viewBox", "0 0 " + this.current_vis_size + " " + this.current_vis_size);
          }
      }
  },

  drawChartCanvas: function() {

    this.chart = this.svg.append("g").attr( "id", "chart_canvas" );
    // Rectangle to contain nodes in force layout
    this.chart.append("rect");
    // var rect_width = this.current_vis_size;// + this.max_list_size;
    this.updateChartCanvas();

    //chart.attr( "height", this.current_vis_size + "px" )
    //chart.attr( "width",  this.current_vis_size + "px" );
  },
  
  updateChartCanvas: function () {
      d3.select("rect")
        .attr( "height", this.current_vis_size )
        .attr( "width",  this.current_vis_size );
  },
  
  calcTitleFontSize: function () {
    if (this.current_vis_size <= 600) {
          return "12px";
    } else if (this.current_vis_size <= 1000) {
          return "14px";
    } else {
          return "16px";
    }
  },

  initEventListeners: function() {
      var self = this;
      
      d3.select(window).on("resize", () => { mediator.publish("window_resized", mediator); });

      // Info Modal Event Listener
      $('#info_modal').on('show.bs.modal', function() {
          console.log("MODAL INFO SHOW");
          var current_intro = self.intro;
          
          var intro = (typeof intros[current_intro] != "undefined")?(intros[current_intro]):(self.intro)
          
          $(this).find('.modal-title ').text(intro.title);
          $(this).find('.modal-body').html(intro.body);
      });
  },


  // Mouse interaction listeners
  initMouseListeners: function() {
    this.initMouseMoveListeners();
    this.initMouseClickListeners();
    this.initClickListenersForNav();
  },

  initMouseMoveListeners: function() {
    $("rect").on( "mouseover", () => {
      if (!this.is_zoomed) {
        this.bubbles[this.current_file_number].onmouseout("notzoomedmouseout");
        this.current_circle = null;
      }
      this.bubbles[this.current_file_number].mouseout("outofbigbubble");
      this.initClickListenersForNav();
    });
  },

  initMouseClickListeners: function() {
      $("#chart-svg").on("click", () => {
          this.bubbles[this.current_file_number].zoomout();
      });

      $("#" + this.tag).bind('click', (event) => {
        if(event.target.className === "container-headstart" || event.target.className === "vis-col" || event.target.id === "headstart-chart") {
              this.bubbles[this.current_file_number].zoomout();
          }
      });
  },


  initClickListenersForNav: function() {
      $("#timelineview").on("click", () => {
          if ($("#timelineview a").html() === "TimeLineView") {
              mediator.publish("to_timeline");
          }
      });
  },


  // Draws the header for this
  drawTitle: function() {
    let self = this;
    let chart_title = "";
    
    if(this.title === "") {
        if (this.language === "eng") {
            chart_title = 'Overview of <span id="num_articles"></span> articles';
        } else {
            chart_title = 'Überblick über <span id="num_articles"></span> Artikel';
        }
    } else {
        chart_title = this.title;
    }

    $("#subdiscipline_title h4").html(chart_title);
    $("#num_articles").html($(".paper").length);

    if (this.show_infolink) {
        let infolink = ' (<a data-toggle="modal" data-type="text" href="#info_modal" id="infolink"></a>)';
        $("#subdiscipline_title h4").append(infolink);
        $("#infolink").text(this.localization[this.language].intro_label);
    }

    if (this.show_timeline) {
        let link = ' <span id="timelineview"><a href="#">TimeLineView</a></span>';
        $("#subdiscipline_title>h4").append(link);
    }

    if (this.show_dropdown) {
        let dropdown = '<select id="datasets"></select>';

        $("#subdiscipline_title>h4").append(" Select dataset: ");
        $("#subdiscipline_title>h4").append(dropdown);

        $.each(this.files, (index, entry) => {
            let current_item = '<option value="' + entry.file + '">' + entry.title + '</option>';
            $("#datasets").append(current_item);
        });

        //$("#datasets " + headstart.current_file_number + ":selected").text();
        $("#datasets").val(this.bubbles[this.current_file_number].file);

        $("#datasets").change(function() {
            let selected_file_number = this.selectedIndex + 1;
            if (selected_file_number !== self.current_file_number) {
                self.tofile(selected_file_number);
            }
        });
    }
},


  initForceAreas: function() {
    let padded = this.current_vis_size - this.padding;
    this.force_areas = d3.layout.force().links([]).size([padded, padded]);
  },

  initForcePapers: function() {
    let padded = this.current_vis_size - this.padding;
    this.force_papers = d3.layout.force().nodes([]).links([]).size([padded, padded]);
    if (typeof checkPapers !== 'undefined') {
        window.clearInterval(checkPapers);
    }
  },

  // calls itself over and over until the forced layout of the papers
  // is established
  checkForcePapers: function() {
    var bubble = this.bubbles[this.current_file_number];

    if (this.is("normal") || this.is("switchfiles")) {
      var checkPapers = window.setInterval(() => {
        if (this.is("normal") || this.is("switchfiles")) {
          if ((!papers.is("ready") && !papers.is("none")) || (bubble.is("startup") || bubble.is("none") || (bubble.is("start")) )) {
            if (this.force_papers.alpha() <= 0 && this.force_areas.alpha() <= 0) {
              papers.forced();
              if(this.show_list) {
                list.show();
              }
              window.clearInterval(checkPapers);
            }
          }
        }
      }, 10);
    }
  },

  // for the timelineview new bubbles are registered with headstart and kept
  // in headstart.bubbles = {} object
  registerBubbles: function( new_bubbles ) {
    if (new_bubbles.id === 0) {
      new_bubbles.id = this.bubblesSize() + 1; // start id with 1
    }

    // add bubbles if not registered already
    if ( !(new_bubbles.id in this.bubbles) ) {
      this.bubbles[new_bubbles.id] = new_bubbles;
    } else {
      return false;
    }

    return true;
  },

  bubblesSize: function() {
    let size = 0;
    for (let key in this.bubbles) {
      if (this.bubbles.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  },

  // Grid drawing methods
  // draw x and y lines in svg canvas for timelineview
  drawGrid: function() {
    this.drawXGrid();
    this.drawYGrid();
  },

  removeGrid: function() {
    $("line").remove();
  },

  drawYGrid: function() {
    var to = (this.bubblesSize() * this.current_vis_size);
    for (var i = 0; i <= to; i+= this.current_vis_size) {
      this.svg.append("line")
      .attr("x1", i)
      .attr("x2", i)
      .attr("y1", "0")
      .attr("y2", "900");
    }
  },

  drawXGrid: function() {
    for (var i = 0; i <= 900; i+=50) {
      this.svg.append("line")
      .attr("x1", "0")
      .attr("x2", this.bubblesSize() * this.current_vis_size)
      .attr("y1", i)
      .attr("y2", i);
    }
  },

  drawGridTitles: function(update) {
      
      update = typeof update !== 'undefined' ? update : false;
      
      if (update === true) {
          $("#tl-titles").width(this.current_vis_size * Object.keys(this.bubbles).length);
          $(".tl-title").css("width", this.current_vis_size);
      } else {
          for (var i = 1; i <= this.bubblesSize(); i++) {
              $("#tl-titles").append(
                  '<div class="tl-title"><h3>' + this.bubbles[i].title + '</h3></div>');
          }
          $("#tl-titles").width(this.current_vis_size * Object.keys(this.bubbles).length);
          $(".tl-title").css("width", this.current_vis_size);
      }
  },

  createRestUrl: function () {
      let url = this.server_url + "services/getBookmarks.php?user=" + this.user_id;

      //sometimes the conference id array is not recognized
      let conference_id = eval(this.conference_id);

      if($.isArray(conference_id)) {
          conference_id.forEach((val) => {
            url += "&conference[]=" + val;
          });
      } else {
          url += "&conference=" + this.conference_id;
      }

      url += "&max_recommendations=" + this.max_recommendations;

      url += "&jsoncallback=?";

      return url;
  },

  setupChart: function() {
      this.calcChartSize();
      this.initScales();
      this.setScaleRanges();
      this.drawSvg();
      this.drawChartCanvas();
  },
  
  makeSetupVisualisation: function () {
      let hs = this;
      let current_bubble = this.bubbles[this.current_file_number];
      let adaptive_data = null;
      this.drawTitle();
      this.setupChart();
      // NOTE: async call
      // therefore we need to call the methods which depend on bubbles.data
      // after the csv has been received.
      let setupVisualization = (csv) => {
        if (this.is_adaptive) {
          let url = this.createRestUrl();
          $.getJSON(url, (data) => {
              this.startVisualization(this, current_bubble, csv, data, true);
            });
        } else {
          this.startVisualization(this, current_bubble, csv, null, true);
        }
      };
      return setupVisualization;
  },

  // FSM callbacks
  // the start event transitions headstart from "none" to "normal" view
  onstart: function() {
      this.checkBrowserVersions();
      this.setOverflowToHiddenOrAuto("#main");
      this.resetBubbles();
      let setupVisualization = this.makeSetupVisualisation();
      switch (this.mode) {
          case "local_files":
              var file = this.files[this.current_file_number - 1];
              mediator.publish("get_data_from_files", file, this.input_format, setupVisualization);
              break;

          case "search_repos":
              let current_bubble = this.bubbles[this.current_file_number];
              d3.json(this.server_url + "services/getLatestRevision.php?vis_id=" + current_bubble.file, setupVisualization);
              break;

          case "server_files":
              switch (this.input_format) {
                case "csv":
                    $.ajax({
                        type: 'POST',
                        url: this.server_url + "services/staticFiles.php",
                        data: "",
                        dataType: 'JSON',
                        success: (json) => {
                            this.files = [];
                            for (let i = 0; i < json.length; i++) {
                                this.files.push({
                                    "title": json[i].title,
                                    "file": this.server_url + "static" + json[i].file
                                });
                            }
                            this.resetBubbles();
                            current_bubble = this.bubbles[this.current_file_number]; 
                            d3.csv(current_bubble.file, setupVisualization);
                        }
                    });
                  break;
                case "json":
                  d3.json(current_bubble.file, setupVisualization);
                  break;
              }
              break;

          case "json-direct":
              setupVisualization(current_bubble.file);
              break;

          default:
              break;
      }
  },


  // 'ontotimeline' transitions from Headstarts "normal" view to the timeline
  // view. In a nutshell:
  // 1. it requires some cleanup
  //    - objects which are no longer needed
  //    - the canvas
  // 2. rendering of new elements, on a bigger
  //    chart
  ontotimeline: function() {
      if (typeof checkPapers !== 'undefined') {
        window.clearInterval(checkPapers);
      }

      this.force_areas.stop();
      this.force_papers.stop();

      this.resetBubbles();

      // clear the canvas
      $("#chart_canvas").empty();

      // clear the list list
      $("#list_explorer").empty();

      this.bubbles[this.current_file_number].current = "x";
      papers.current = "none";
      list.current = "none";

      // change heading to give an option to get back to normal view
      this.viz.empty();

      let timeline = timelineTemplate();
      this.viz.append(timeline);

      this.drawTitle();
      this.drawGridTitles();

      this.drawNormalViewLink();
      this.initScales();

      this.calcChartSize();
      this.setScaleRanges();
      this.drawSvg();
      this.drawChartCanvas();
      
      this.drawGridTitles(true);


      d3.select("#headstart-chart").attr("overflow-x", "scroll");

      $("#main").css("overflow", "auto");

      // load bubbles in sync

      $.each(this.bubbles, (index, elem) => {
          var setupTimelineVisualization = (csv) => {
              elem.start(csv);
          };

          switch (this.input_format) {
              case "csv":
                  d3.csv(elem.file, setupTimelineVisualization);
                  break;

              case "json":
                  d3.json(this.server_url + "services/getLatestRevision.php?vis_id=" + elem.file, setupTimelineVisualization);
                  break;

              default:
                  break;
          }
      });

      this.drawGrid();
      this.initMouseListeners();
  },

  
  ontofile: function(event, from, to, file) {
      this.force_areas.stop();
      this.force_papers.stop();

      this.current_file_number = file;

      // clear the canvas & list
      $("#chart_canvas").remove();
      $("#list_explorer").empty();

      // popup.current = "hidden";
      papers.current = "none";
      list.current = "none";

      // this.initScales();
      this.setOverflowToHiddenOrAuto("#main");
      // reset bubbles
      this.resetBubbles();
      let current_bubble = this.bubbles[this.current_file_number];
      let setupVisualization = this.makeSetupVisualisation();
      switch (this.mode) {
          case "local_files":
              var file = this.files[this.current_file_number - 1];
              mediator.publish("get_data_from_files", file, this.input_format, setupVisualization);
              break;

          case "search_repos":
              d3.json(this.server_url + "services/getLatestRevision.php?vis_id=" + current_bubble.file, setupVisualization);
              break;

          case "server_files":
              switch (this.input_format) {
                  case "csv":
                     $.ajax({
                         type: 'POST',
                         url: this.server_url + "services/staticFiles.php",
                         data: "",
                         dataType: 'JSON',
                         success: (json) => {
                             this.files = [];
                             for (let i = 0; i < json.length; i++) {
                                 this.files.push({
                                     "title": json[i].title,
                                     "file": this.server_url + "static" + json[i].file
                                 });
                             }
                             this.resetBubbles();
                             current_bubble = this.bubbles[this.current_file_number];
                             d3.csv(current_bubble.file, setupVisualization);
                         }
                     });
                     break;
                  case "json":
                      d3.json(current_bubble.file, setupVisualization);
                      break;
              }
              break;

          case "json-direct":
              setupVisualization(current_bubble.file);
              break;

          default:
              break;
      }
  },



  startVisualization: function(hs, bubbles, csv, adaptive_data) {
    mediator.publish("prepare_data", adaptive_data, csv);
    mediator.publish("prepare_areas");
    mediator.publish('bubbles_update_data_and_areas', bubbles);

    if (hs.render_bubbles_papers) {
      bubbles.start(csv, adaptive_data);
      hs.initEventListeners();
      hs.initMouseListeners();
      hs.initForcePapers();
      hs.initForceAreas();
      papers.start(bubbles);
      bubbles.draw();
      hs.checkForcePapers();
      if (hs.show_intro) {
        $("#infolink").click();
      }
      $("#area_title>h2").hyphenate('en');
      $("#area_title_object>body").dotdotdot({wrap: "letter"});
      bubbles.initMouseListeners();
    }

    if (hs.render_list) {
      list.start( bubbles );
      if (!hs.render_bubbles_papers) list.show();
    }
  },

  drawNormalViewLink: function() {
      // remove event handler
      $("#timelineview").off("click");

      // refreshes page
      var link = ' <a href="" id="normal_link">Normal View</a>';
      $("#timelineview").html(link);
  }
}; // end HeadstartFSM prototype definition

// State definitions for headstart object
// see "onstart" function for entry point e.g. the first code that
// gets excuted here.
StateMachine.create({

  target: HeadstartFSM.prototype,

  events: [
    { name: "start",      from: "none",     to: "normal" },
    { name: "totimeline", from: ["normal", "switchfiles"],   to: "timeline" },
    { name: "tofile", from: ["normal", "switchfiles", "timeline"], to: "switchfiles"}
  ]

});

// Headstart
// filename: headstart.js

"use strict";
import StateMachine from 'javascript-state-machine';

import config from 'config';

import { mediator } from 'mediator';
import { BubblesFSM } from 'bubbles';
import { papers } from 'papers';
import { list } from 'list';
import { canvas } from 'canvas';

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

  // contains bubbles objects for the timline view
  // elements get added to bubbles by calling registerBubbles()
  this.current_zoom_node = null;
  this.current_enlarged_paper = null;
  this.current_file_number = 0;
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
    if (!(browser == "Firefox" || browser == "Safari" || browser == "Chrome")) {
            var alert_message = 'You are using an unsupported browser.' +
                                'This visualization was successfully tested' +
                                'with the latest versions of Chrome, Safari,' +
                                'Opera and Firefox.';
            alert(alert_message);
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

  registerBubbles: function() {
    this.bubbles = [];
    $.each(this.files, (index, elem) => {
      var bubble = new BubblesFSM();
      if (bubble.id === 0) {
        bubble.id = this.bubbles.length + 1; // start id with 1
      }
      bubble.file = elem.file;
      bubble.title = elem.title;
      this.bubbles.push(bubble);
    });
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

  makeSetupVisualisation: function () {
      return (csv) => {
        var bubble = this.bubbles[this.current_file_number];
        if (this.is_adaptive) {
          let url = this.createRestUrl();
          $.getJSON(url, (data) => {
              mediator.publish("start_visualization", data, csv, bubble);
            });
        } else {
          mediator.publish("start_visualization", null, csv, bubble);
        }
      }
  },

  get_files: {
      local_files: function(that, setupVis) {
        var file = that.files[that.current_file_number];
        mediator.publish("get_data_from_files", file, that.input_format, setupVis);
      },

      search_repos: function(that, setupVis) {
        let current_bubble = that.bubbles[that.current_file_number];
        d3.json(that.server_url + "services/getLatestRevision.php?vis_id=" + current_bubble.file, setupVis);
      },

      server_files: {
        csv: function(that, setupVis) {
          $.ajax({
            type: 'POST',
            url: that.server_url + "services/staticFiles.php",
            data: "",
            dataType: 'JSON',
            success: (json) => {
              that.files = [];
              for (let i = 0; i < json.length; i++) {
                that.files.push({
                  "title": json[i].title,
                  "file": that.server_url + "static" + json[i].file
                });
              }
              that.registerBubbles();
              let current_bubble = that.bubbles[that.current_file_number];
              d3.csv(current_bubble.file, setupVis);
            }
          });
        },

        json: function(that, setupVis) {
          let current_bubble = that.bubbles[that.current_file_number];
          d3.json(current_bubble.file, setupVis);
        }
      },

      json_direct: function(that, setupVis) {
        let current_bubble = that.bubbles[that.current_file_number];
        setupVis(current_bubble.file);
      }
  },

  // FSM callbacks
  // the start event transitions headstart from "none" to "normal" view
  onstart: function() {
      this.checkBrowserVersions();
      this.registerBubbles();
      let hs = this;
      this.get_files[this.mode](hs, this.makeSetupVisualisation());
  },

  // 'ontotimeline' transitions from Headstarts "normal" view to the timeline
  // view. In a nutshell:
  // 1. it requires some cleanup
  //    - objects which re no longer needed
  //    - the canvas
  // 2. rendering of new elements, on a bigger
  //    chart
  ontotimeline: function() {
      this.bubbles[this.current_file_number].current = "x";
      papers.current = "none";
      list.current = "none";

      // change heading to give an option to get back to normal view
      this.viz.empty();
      this.viz.append(timelineTemplate());

      canvas.setupTimelineCanvas();
      // load bubbles in sync
      $.each(this.bubbles, (index, elem) => {
          var setupTimelineVisualization = (csv) => {
              mediator.publish("prepare_data", null, csv);
              mediator.publish("prepare_areas");
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

      canvas.drawGrid();
      canvas.initMouseListeners();
  },

  ontofile: function(event, from, to, file) {
      this.current_file_number = file;
      mediator.publish("ontofile");
      let hs = this;
      this.get_files[this.mode](hs, this.makeSetupVisualisation());
  },
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
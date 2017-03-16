// Headstart
// filename: headstart.js

import StateMachine from 'javascript-state-machine';

import config from 'config';
import { mediator } from 'mediator';

import { getRealHeight } from "helpers";
import { BrowserDetect, highlight } from "helpers";

import 'hypher';
import 'lib/en.js';
import 'dotdotdot';

export var HeadstartFSM = function(json_direct_data) {
  this.VERSION = 2.9;
  mediator.json_direct_data = json_direct_data;
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

    if(!config.is_evaluation) {
      return;
    }

    timestamp = (typeof timestamp !== 'undefined') ? (escape(timestamp)) : ("");
    additional_params = (typeof additional_params !== 'undefined') ? ('&' + additional_params) : ("");
    if(typeof post_data !== 'undefined') {
      post_data = {post_data:post_data};
    } else {
      post_data = {};
    }

    let php_script = config.server_url + "services/writeActionToLog.php";

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

  createRestUrl: function () {
      let url = config.server_url + "services/getBookmarks.php?user=" + config.user_id;

      //sometimes the conference id array is not recognized
      let conference_id = eval(config.conference_id);

      if($.isArray(conference_id)) {
          conference_id.forEach((val) => {
            url += "&conference[]=" + val;
          });
      } else {
          url += "&conference=" + this.conference_id;
      }
      url += "&max_recommendations=" + config.max_recommendations;
      url += "&jsoncallback=?";
      return url;
  },

  makeSetupVisualisation: function () {
      return (csv) => {
        if (config.is_adaptive) {
          let url = this.createRestUrl();
          $.getJSON(url, (data) => {
              mediator.publish("start_visualization", data, csv);
            });
        } else {
          mediator.publish("start_visualization", null, csv);
        }
      };
  },

  get_files: {
      local_files: function(that, setupVis) {
        let url = config.files[mediator.current_file_number].file;
        mediator.publish("get_data_from_files", url, config.input_format, setupVis);
      },

      search_repos: function(that, setupVis) {
        let url = config.server_url + "services/getLatestRevision.php?vis_id=" + mediator.current_bubble.file;
        mediator.publish("get_data_from_files", url, 'json', setupVis);
      },

      server_files: function(that, setupVis) {
        mediator.publish("get_server_files", setupVis);
      },

      json_direct: function() {
        config.files = mediator.json_direct_data;
        mediator.publish("register_bubbles");
        mediator.current_bubble.data = mediator.current_bubble.file;
        mediator.publish("start_visualization", null, mediator.current_bubble.data);
      }
  },

  // FSM callbacks
  // the start event transitions headstart from "none" to "normal" view
  onstart: function() {
      this.checkBrowserVersions();
      mediator.publish("start");
      let hs = this;
      this.get_files[config.mode](hs, this.makeSetupVisualisation());
  },

  // 'ontotimeline' transitions from Headstarts "normal" view to the timeline
  // view. In a nutshell:
  // 1. it requires some cleanup
  //    - objects which re no longer needed
  //    - the canvas
  // 2. rendering of new elements, on a bigger
  //    chart
  ontotimeline: function() {
      mediator.publish("ontotimeline");
      // load bubbles in sync
      var that = this;
      $.each(mediator.bubbles, (index, elem) => {
          var setupTimelineVisualization = (csv) => {
              mediator.publish("prepare_data", null, csv);
              mediator.publish("prepare_areas");
              elem.start(csv);
          };
          that.get_timeline_files(elem.file, setupTimelineVisualization);
      });
      mediator.publish("ontotimeline_finish");
  },

  get_timeline_files: function(file, callback) {
    var formats = {
      csv: function (file, callback) {
        d3.csv(file, callback);
      },
      json: function (file, callback) {
        d3.json(config.server_url + "services/getLatestRevision.php?vis_id=" + file, callback);
      },
      default: function() {
        throw "WRONG INPUT FORMAT";
      }
    };
    var method = (formats[config.input_format] || formats['default']);
    method(file, callback);
  },

  ontofile: function(event, from, to, file) {
      mediator.publish("ontofile", file);
      let hs = this;
      this.get_files[config.mode](hs, this.makeSetupVisualisation());
  },
}; // end HeadstartFSM prototype definition

// State definitions for headstart object
// see "onstart" function for entry point e.g. the first code that
// gets excuted here.
export var headstart = StateMachine.create({

  target: HeadstartFSM.prototype,

  events: [
    { name: "start",      from: "none",     to: "normal" },
    { name: "totimeline", from: ["normal", "switchfiles"],   to: "timeline" },
    { name: "tofile", from: ["normal", "switchfiles", "timeline"], to: "switchfiles"}
  ]

});

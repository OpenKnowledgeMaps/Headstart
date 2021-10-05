/* eslint-disable import/no-webpack-loader-syntax, no-undef */

// Headstart
// filename: headstart.js

import StateMachine from 'javascript-state-machine';
import $ from "jquery";

import config from 'config';
import { mediator } from 'mediator';

import 'hypher';
import 'lib/en.js';

import { BrowserDetect } from "exports-loader?exports=BrowserDetect!../lib/browser_detect.js";

export var HeadstartFSM = function(json_direct_data) {
  this.VERSION = 4.0;
  mediator.json_direct_data = json_direct_data;
}; // end HeadstartFSM constructor

HeadstartFSM.prototype = {

  // prototype methods
  checkBrowserVersions: function() {
    var browser = BrowserDetect.browser;
    if (!(browser === "Firefox" || browser === "Safari" || browser === "Chrome")) {
            var alert_message = 'You are using an unsupported browser. ' +
                                'This visualization was successfully tested ' +
                                'with the latest versions of Firefox, Chrome, Safari, ' +
                                'Opera and Edge.';
            alert(alert_message);
    }
  },

  recordAction: function(id, category, action, user, timestamp, additional_params, post_data) {

    if(!config.is_evaluation) {
      return;
    }

    let services = config.evaluation_service;

    if(typeof services === "string") {
        services = [services];
    }

    if (services.includes("log")) {
        this.recordActionLog(category, action, id, user, timestamp, additional_params, post_data);
    }
    if (services.includes("matomo")) {
        this.recordActionMatomo(category, action, id, user, timestamp, additional_params, post_data);
    }
    if (services.includes("ga")) {
        this.recordActionGA(category, action, id, user, timestamp, additional_params, post_data);
    }
  },

  recordActionLog: function(id, category, action, user, type, timestamp, additional_params, post_data) {
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
        '&category=' + category +
        '&action=' + action +
        '&item=' + encodeURI(id) +
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

  recordActionMatomo: function(category, action, id) {
    if(typeof _paq !== "undefined") {
        _paq.push(['trackEvent', category, action, id]);
    }
  },

  recordActionGA: function(category, action, id) {
    //gtag.js
    if(typeof gtag === "function") {
        gtag('event', action, {
          'event_category': category,
          'event_label': id
        });
    //analytics.js
    } else if (typeof ga === "function") {
      ga('send', 'event', category, action, id);
    }
  },

  markProjectChanged: function (id) {

    let php_script = config.server_url + "services/markProjectChanged.php";

    $.ajax({
        url: php_script + '?vis_id=' + id,
        type: "GET",
        dataType: "json",
        success: function(output) {
            console.log(output);
        }
      });

  },

  makeSetupVisualisation: function () {
      return (csv) => mediator.publish("start_visualization", csv);
  },

  get_files: {
      local_files: function(that, setupVis) {
        let url = config.files[mediator.current_file_number].file;
        mediator.publish("get_data_from_files", url, config.input_format, setupVis);
      },

      search_repos: function(that, setupVis) {
        let url = config.server_url + "services/getLatestRevision.php?vis_id=" + mediator.current_bubble.file
                + "&context=" + config.show_context + "&streamgraph=" + config.is_streamgraph;
        mediator.publish("get_data_from_files", url, 'json', setupVis);
      },

      gsheets: function(that, setupVis) {
            let url = config.server_url + "services/getGSheetsMap.php?vis_id=" + mediator.current_bubble.file
                + "&q=" +mediator.current_bubble.title
                + "&context=" + config.show_context + "&streamgraph=" + config.is_streamgraph;
            mediator.publish("get_data_from_files", url, 'json', setupVis);
      },

      server_files: function(that, setupVis) {
        mediator.publish("get_server_files", setupVis);
      },

      json_direct: function() {
        config.files = mediator.json_direct_data;
        mediator.publish("register_bubbles");
        mediator.current_bubble.data = mediator.current_bubble.file;
        mediator.publish("start_visualization", mediator.current_bubble.data);
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
    { name: "tofile", from: ["normal", "switchfiles"], to: "switchfiles"}
  ]

});

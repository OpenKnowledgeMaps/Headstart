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
  this.VERSION = 4.0;
  mediator.json_direct_data = json_direct_data;
}; // end HeadstartFSM constructor

HeadstartFSM.prototype = {

  // prototype methods
  checkBrowserVersions: function() {
    var browser = BrowserDetect.browser;
    if (!(browser == "Firefox" || browser == "Safari" || browser == "Chrome")) {
            var alert_message = 'You are using an unsupported browser. ' +
                                'This visualization was successfully tested ' +
                                'with the latest versions of Chrome, Safari, ' +
                                'Opera and Firefox.';
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
  
  dynamicForcePapers: function(num_items) {
      if (num_items >= 150 && num_items < 200) {
        config.papers_force_alpha = 0.2;
      } else if (num_items >= 200 && num_items < 350) {
          config.papers_force_alpha = 0.3;
      } else if (num_items >= 350 && num_items < 500) {
          config.papers_force_alpha = 0.4;
      }else if (num_items >= 500) {
          config.papers_force_alpha = 0.6;
      }
  },
  
  dynamicForceAreas: function(num_items) {
      if (num_items >= 200) {
          config.area_force_alpha = 0.02;
      }
  },
  
  dynamicSizing: function(num_items) {
      if (num_items >= 150 && num_items < 200) {
          this.adjustSizes(0.9, 1.1);
      } else if (num_items >= 200 && num_items < 250) {
          this.adjustSizes(0.8, 1.1);
      } else if (num_items >= 250 && num_items < 300) {
          this.adjustSizes(0.7, 1.1);
      } else if (num_items >= 300 && num_items < 350) {
          this.adjustSizes(0.7, 1.2);
      } else if (num_items >= 350 && num_items < 400) {
          this.adjustSizes(0.7, 1.2);
      } else if (num_items >= 400 && num_items < 450) {
          this.adjustSizes(0.7, 1.2);
      } else if (num_items >= 450 && num_items < 500) {
          this.adjustSizes(0.7, 1.2);
      } else if (num_items >= 500) {
          this.adjustSizes(0.6, 1.2);
      }
  },
  
  adjustSizes: function(resize_paper_factor, resize_bubble_factor) {
      config.paper_min_scale *= resize_paper_factor;
      config.paper_max_scale *= resize_paper_factor;
          
      config.bubble_min_scale *= resize_bubble_factor;
      config.bubble_max_scale *= resize_bubble_factor;
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
        let url = config.server_url + "services/getLatestRevision.php?vis_id=" + mediator.current_bubble.file 
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

  // 'ontomultiples' transitions from Headstarts "normal" view to multiples
  // view. In a nutshell:
  // 1. it requires some cleanup
  //    - objects which re no longer needed
  //    - the canvas
  // 2. rendering of new elements, on a bigger
  //    chart
  ontomultiples: function() {
      mediator.publish("ontomultiples");
      // load bubbles in sync
      var that = this;
      $.each(mediator.bubbles, (index, elem) => {
          var setupMultiplesVisualization = (csv) => {
              mediator.publish("prepare_data", null, csv, null);
              mediator.publish("prepare_areas");
              elem.start(csv);
          };
          that.get_multiples_files(elem.file, setupMultiplesVisualization);
      });
      mediator.publish("ontomultiples_finish");
  },

  get_multiples_files: function(file, callback) {
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
    { name: "tomultiples", from: ["normal", "switchfiles"],   to: "multiples" },
    { name: "tofile", from: ["normal", "switchfiles", "multiples"], to: "switchfiles"}
  ]

});

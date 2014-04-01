// Headstart
// filename: headstart.js

HeadstartFSM = function() {

  // a container for variables
  this.VERSION = 0.1;

  this.min_height = 650;
  this.min_width  = 650;

  this.dogear_width  = 0.1;
  this.dogear_height = 0.1;

  this.min_list_size = 290;
  this.max_list_size = 400;
  this.paper_width_factor  = 1.2;
  this.paper_height_factor = 1.6;
  this.preview_image_width_list  = 230;
  this.preview_image_height_list = 300;
  this.circle_zoom_factor = 600;
  this.padding_articles = 5;

  this.preview_page_height = 400;
  this.preview_top_height  = 30;
  this.preview_image_width  = 738;
  this.preview_image_height = 984;
  this.abstract_small = 250;
  this.abstract_large = 600;

  this.top_correction    = 50;
  this.bottom_correction = 0;

  this.transition_duration = 750;

  this.max_diameter_size = max_diameter_size;
  this.min_diameter_size = min_diameter_size;
  this.max_area_size = max_area_size;
  this.min_area_size = min_area_size;

  this.current_zoom_node = null;

  this.current_enlarged_paper = null;
  this.papers_list = null;
  this.circle_zoom = 0;
  this.current_circle = null;
  this.is_zoomed = false;

  this.subdiscipline_title = title;
  
  this.current_file_number = 1;
  
  this.evaluation_service = "http://localhost/headstart2/server/services/writeActionToLog.php";
  
  this.is_evaluation = evaluation;
  
  // contains bubbles objects for the timline view
  // elements get added to bubbles by calling registerBubbles()
  this.bubbles = {}
  
  if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
      return this.slice(0, str.length) == str;
    };
  }
  
  if (typeof String.prototype.escapeSpecialChars != 'function') {
    String.prototype.escapeSpecialChars = function() {
      return this.replace(/[\\]/g, '\\\\')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t')
        .replace(/[\"]/g, '\\"')
        .replace(/\\'/g, "\\'"); 
       };
     }
  
};

HeadstartFSM.prototype = {

  // prototype methods
  // simple check that all required libraries are present at the moment:
  // - d3
  // - jQuery
  // - Javascript-State-Machine
  // are needed for headstart.
  checkThatRequiredLibsArePresent: function() {
    if (typeof(d3) == "undefined"){
      alert("d3 v3 is required for headstart");
      console.log("d3 is required!");
    }

    if (typeof(window.jQuery) == "undefined"){
      alert("jquery is required for headstart");
      console.log("jquery is required!");
    }

    if (typeof(StateMachine) == "undefined"){
      alert("state machine is required for headstart");
      console.log("state machine is required for headstart");
    }
  },

  recordAction: function(id, action, user, type, timestamp, additional_params, post_data) {
    
    if(!this.is_evaluation)
      return;

    timestamp = (typeof timestamp !== 'undefined') ? (escape(timestamp)) : ("")
    additional_params = (typeof additional_params !== 'undefined') ? ('&' + additional_params) : ("")
    if(typeof post_data !== 'undefined') {
      post_data = {post_data:post_data};
    } else {
      post_data = {};
    }

    $.ajax({
      url: this.evaluation_service + '?user=' + user 
              + '&action=' + action
              + '&item=' + escape(id)
              + '&type=' + type
              + '&item_timestamp=' + timestamp
              + additional_params
              + '&jsoncallback=?',
      type: "POST",
      data: post_data,
      dataType: "json",
      success: function(output) {
        console.log(output)
      }
    });
  },
     
  resetBubbles: function () {
    if(this.bubbles) {
      delete this.bubbles;
      this.bubbles = {};
    }
    
    $.each(files, function(index, elem) {
      var bubble = new BubblesFSM();
      headstart.registerBubbles(bubble);
      bubble.title = elem.title;
      bubble.file = elem.file;
    })
  },

  // the rest of headstarts variables, which are initalized by some
  // sort of calculation
  initDynamicVariables: function() {
    // initialize a bunch of variables.
    this.available_width  = $(document).width();
    this.available_height = $(document).height();

    this.x = d3.scale.linear().range([0, this.circle_zoom_factor]);
    this.y = d3.scale.linear().range([0, this.circle_zoom_factor]);

    // order of these method calls is important, max_chart_size needs to be calculated before
    // correction_factor_x
    if (this.is("timeline")){
      this.max_chart_size = 400;
    } else {
      this.calculateMaxChartSize();
    }
    this.correction_factor_width  = ( this.max_chart_size / this.min_width  );
    this.correction_factor_height = ( this.max_chart_size / this.min_height );
    this.setCorrectionFactor();
    this.setListWidth();

    // Initialize global scales for zooming
    this.circle_min = ( this.min_area_size * this.correction_factor );
    this.circle_max = ( this.max_area_size * this.correction_factor );
    this.padding = this.circle_max / 2 + 45;

    this.setCircleSize();
    this.setDiameterSize();

    var to = this.max_chart_size - this.padding_articles;
    this.chart_x = d3.scale.linear().range( [this.padding_articles, to] );
    this.chart_y = d3.scale.linear().range( [this.padding_articles, to] );

    to = this.max_chart_size - this.padding;
    this.chart_x_circle = d3.scale.linear().range( [this.padding, to] );
    this.chart_y_circle = d3.scale.linear().range( [this.padding, to] );
  },

  // either set it to min values or use all space available
  calculateMaxChartSize: function() {
    if (this.availableSizeIsBiggerThanMinSize()) {
      if (this.available_width >= this.available_height) {
        var corrected_height = this.available_height - this.top_correction - this.bottom_correction;
        this.max_chart_size = corrected_height;
      }
    } else {
      if (this.min_height >= this.min_width)
        this.max_chart_size = this.min_width;
      else
        this.max_chart_size = this.min_height;
    }
  },

  // a little more readable
  availableSizeIsBiggerThanMinSize: function() {
    if ( this.available_width > this.min_width && this.available_height > this.min_height )
      return true;
    else
      return false;
  },

  setCorrectionFactor: function() {
    if ( this.correction_factor_width > this.correction_factor_height )
      this.correction_factor = this.correction_factor_height;
    else
      this.correction_factor = this.correction_factor_width;
  },

  setListWidth: function() {
    if ( this.available_width > ( this.max_chart_size + this.max_list_size + this.bottom_correction ))
      this.list_width =  this.max_list_size
    else
      this.list_width = this.min_list_size;
  },

  setCircleSize: function() {
    this.circle_size = d3.scale.sqrt().range( [this.circle_min, this.circle_max] );
  },

  setDiameterSize: function() {
    var from = this.min_diameter_size * this.correction_factor;
    var to = this.max_diameter_size * this.correction_factor;
    this.diameter_size = d3.scale.sqrt().range([from, to]);
  },

  // auto if enough space is available, else hidden
  setOverflowToHiddenOrAuto: function( selector ) {
    var overflow = "hidden";

    if ( this.max_chart_size > this.available_height ||
         this.max_chart_size + this.list_width > this.available_width ){
        overflow = "auto";
    }

    d3.select( selector ).style( "overflow" , overflow );
  },

    // not needed?
  setHeight: function( selector ) {
    var chart = d3.select( selector );
    chart.style("height", function () { return (this.max_chart_size < 720) ? "35px" : "40px";  });
  },

  // Draw basic SVG canvas
  // NOTE attribute width addition by number of elements
  drawSvg: function() {

    this.chart_id = d3.select( "#chart" );

    var svg = this.chart_id.append( "svg" );
    svg.style( "overflow-x", "scroll");
    svg.attr( "height", this.max_chart_size + "px" );
    svg.attr( "width",  this.max_chart_size + "px" );

    this.svg = svg;
  },

  drawChartCanvas: function() {

    var chart = this.svg.append("g").attr( "id", "chart_canvas" );
    chart.attr( "height", this.max_chart_size + "px" )
    chart.attr( "width",  this.max_chart_size + "px" );

    // Rectangle to contain nodes in force layout
    var rect = chart.append("rect")
    rect.attr( "height", this.max_chart_size + "px" )
    rect.attr( "width",  this.max_chart_size + "px" );

    this.chart = chart;
  },

  // Mouse interaction listeners
  initMouseListeners: function() {
    this.initMouseMoveListeners();
    this.initMouseClickListeners();
  },

  initMouseMoveListeners: function() {
    $("rect").on( "mouseover", function() {
      if (!headstart.is_zoomed) {
        headstart.bubbles[headstart.current_file_number].onmouseout("notzoomedmouseout");
        headstart.current_circle = null;
      }
      headstart.bubbles[headstart.current_file_number].mouseout("outofbigbubble");
      popup.initClickListenersForNav();
    });
  },

  initMouseClickListeners: function() {
    $("rect").on( "click", function() {
      headstart.bubbles[headstart.current_file_number].zoomout();
    });

    $("#chart").on("click", function() {
      headstart.bubbles[headstart.current_file_number].zoomOut();
    });
  },

  // Draws the h1 for headstart
  drawTitle: function() {
    d3.select("#subdiscipline_title")
    .append("h1")
    .style("font-size", function () {
      return (this.max_chart_size < 720)?("16px"):("18px");
    });
  },

  initForceAreas: function() {
    var padded = this.max_chart_size - this.padding;
    this.force_areas = d3.layout.force().links([]).size([padded, padded]);
  },

  initForcePapers: function() {
    var padded = this.max_chart_size - this.padding;
    this.force_papers = d3.layout.force().nodes([]).links([]).size([padded, padded]);
  },

  // calls itself over and over until the forced layout of the papers
  // is established
  checkForcePapers: function() {
    var hs = this;
    if (hs.is("normal") || hs.is("switchfiles")) {
      checkPapers = window.setInterval(function () {
        if (hs.is("normal") || hs.is("switchfiles")) {
          if (!papers.is("ready") && !papers.is("none")) {
            if (hs.force_papers.alpha() <= 0) {
              papers.forced();
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
    if (new_bubbles.id == "0") {
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
    var size = 0, key;
    for (key in this.bubbles) {
      if (this.bubbles.hasOwnProperty(key));
      size++;
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
    var to = (this.bubblesSize() * this.max_chart_size);
    for (var i = 0; i <= to; i+= this.max_chart_size) {
      this.svg.append("line")
      .attr("x1", i)
      .attr("x2", i)
      .attr("y1", "0")
      .attr("y2", "900")
      .attr("style", "stroke:rgb(0,0,0);stroke-width:0.1");
    }
  },

  drawXGrid: function() {
    for (var i = 0; i <= 900; i+=50) {
      this.svg.append("line")
      .attr("x1", "0")
      .attr("x2", this.bubblesSize() * this.max_chart_size)
      .attr("y1", i)
      .attr("y2", i)
      .attr("style", "stroke:rgb(0,0,0);stroke-width:0.1");
    };
  },

  drawGridTitles: function() {
    $("#chart").append('<div id="tl-titles"></div>');
    for (var i = 1; i <= this.bubblesSize(); i++) {
      $("#tl-titles").append('<div class="tl-title">' +
          this.bubbles[i].title
          + '</div>');
    }
    $(".tl-title").css("width", this.max_chart_size);
    $(".tl-title").css("text-align", "center");
    $(".tl-title").css("float", "left");
  },

  // FSM callbacks
  // the start event transitions headstart from "none" to "normal" view
  onstart: function( event, from, to, file ) {
      
    this.checkThatRequiredLibsArePresent();
    this.initDynamicVariables();

    this.setOverflowToHiddenOrAuto( "#main" );
    
    this.resetBubbles();
    
    var bubbles = this.bubbles[this.current_file_number];

    // NOTE: async call
    // therefore we need to call the methods which depend on bubbles.data
    // after the csv has been received.
    var hs = this;
    d3.csv(bubbles.file, function( csv ) {
      hs.drawSvg();
      hs.drawChartCanvas();
      hs.drawTitle();
      $.getJSON("http://localhost/headstart2/server/services/getBookmarks.php?user=16&conference=5&jsoncallback=?", function(data) {
        bubbles.start( csv, data );


        hs.initMouseListeners();
        hs.initForcePapers();
        hs.initForceAreas();

        papers.start( bubbles );
        // moving this to bubbles.start results in papers being displayed over the
        // bubbles, unfortunately
        bubbles.draw();
        bubbles.initMouseListeners();
        list.start( bubbles );
        popup.start();
        hs.checkForcePapers();
      });
    });

  },

  // 'ontotimeline' transitions from Headstarts "normal" view to the timeline
  // view. In a nutshell:
  // 1. it requires some cleanup
  //    - objects which are no longer needed
  //    - the canvas
  // 2. rendering of new elements, on a bigger
  //    chart
  ontotimeline: function( event, from, to ){
   
    this.resetBubbles();
    
    window.clearInterval(checkPapers);
   
    // clear the canvas
    $("#chart_canvas").empty();

    // clear the list list
    $("#papers_list_container").empty();
    
    this.bubbles[headstart.current_file_number].current = "x";
    popup.current  = "hidden";
    papers.current = "none";
    list.current   = "none";

    // change heading to give an option to get back to normal view
    popup.drawNormalViewLink();
    this.initDynamicVariables();

    // need a bigger width for the timeline view
    this.svg.attr("width", (this.max_chart_size * this.bubblesSize() + "px") );
    this.svg.attr("height", this.max_chart_size);
    this.chart_id.attr("overflow-x", "scroll");
    $("#main").css("overflow", "scroll");

    // load bubbles in sync
    
    $.each(this.bubbles, function (index, elem) {
      d3.csv(elem.file, function (csv) {
        elem.start( csv )
      })
    })

    this.drawGrid();
    this.drawGridTitles();
    this.initMouseListeners();
  },
  
  ontofile: function( event, from, to, file) {
    
    window.clearInterval(checkPapers);
    
    // clear the canvas
    $("#chart_canvas").remove();

    // clear the list list
    $("#papers_list_container").empty();
    
    popup.current  = "hidden";
    papers.current = "none";
    list.current   = "none";

    this.initDynamicVariables();
    this.setOverflowToHiddenOrAuto( "#main" );
    
    // reset bubbles
    this.resetBubbles();
    
    var bubble = this.bubbles[this.current_file_number];

    var hs = this;
    d3.csv(bubble.file, function( csv ) {
        
      hs.drawChartCanvas();
      
      bubble.start( csv );

      hs.initMouseListeners();
      hs.initForcePapers();
      hs.initForceAreas();

      papers.start( bubble );
      // moving this to bubbles.start results in papers being displayed over the
      // bubbles, unfortunately
      bubble.draw();
      bubble.initMouseListeners();
      list.start( bubble );
      //popup.start();
      hs.checkForcePapers();
    });
  }
}

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

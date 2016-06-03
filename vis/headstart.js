// Headstart
// filename: headstart.js

HeadstartFSM = function(host, path, tag, files, options) {
  
  initVar = function(variable, default_value) {
    return typeof variable !== 'undefined' ? variable : default_value;
  }

  // a container for variables
  this.VERSION = 2.5;
  
  this.host = host;
  this.path = path;
  this.tag = tag;

  // map
  this.min_height = 500;
  this.min_width  = 500;
  this.max_height = 1000;
  this.timeline_size = 600;

  this.is_force_areas = initVar(options.force_areas, false);
  this.area_force_alpha = initVar(options.force_areas_alpha, 0.02);

  // bubbles
  this.max_diameter_size = initVar(options.max_diameter_size, 50);
  this.min_diameter_size = initVar(options.min_diameter_size, 30);
  this.max_area_size = initVar(options.max_area_size, 110);
  this.min_area_size = initVar(options.min_area_size, 50);
  this.area_title_max_size = 50;

  // papers
  this.dogear_width  = 0.1;
  this.dogear_height = 0.1;
  this.paper_width_factor  = 1.2;
  this.paper_height_factor = 1.6;

  // list
  this.min_list_size = 400;
  this.max_list_size = 500;
  this.list_height = 51;
  this.list_height_correction = 29;

  this.sort_options = initVar(options.sort_options, [
      "readers",
      "title",
      "authors",
      "year"
  ])

  this.content_based = initVar(options.is_content_based, false);
  if (this.content_based) {
      this.sort_options = ["title", "area"];
  }

  // preview
  this.preview_image_width_list  = 230;
  this.preview_image_height_list = 300;
  this.circle_zoom_factor = 600;
  this.padding_articles = 5;

  this.preview_page_height = 400;
  this.preview_top_height  = 30;
  this.preview_image_width  = 738;
  this.preview_image_height = 984;
  this.abstract_small = 250;
  this.abstract_large = null;
  
  // transition
  this.transition_duration = 750;

  // misc
  this.debounce = 200;

  // var inits
  this.current_zoom_node = null;
  this.current_enlarged_paper = null;
  this.current_file_number = 1;
  this.current_circle = null;
  this.papers_list = null;
  this.circle_zoom = 0;
  this.is_zoomed = false;
  this.zoom_finished = false;

  // show 
  this.show_timeline = initVar(options.show_timeline, true);
  this.show_dropdown = initVar(options.show_dropdown, true);
  this.show_intro = initVar(options.show_intro, false);
  this.show_infolink = initVar(options.show_infolink, true);
  this.show_titlerow = initVar(options.show_titlerow, true);
  this.show_list = initVar(options.show_list, false);

  // behaviour settings (mostly legacy)
  this.is_evaluation = initVar(options.is_evaluation, false);
  this.evaluation_service = options.evaluation_service;
  this.is_adaptive = initVar(options.is_adaptive, false);
  this.conference_id = initVar(options.conference_id, 0);
  this.user_id = initVar(options.user_id, 0);
  this.max_recommendations = initVar(options.max_recommendations, 10);
  this.files = files;
    
  // paths
  this.service_path = initVar(options.service_path, this.host + this.path + "server/services/");
  this.images_path = initVar(options.images_path, this.host + this.path + "vis/images/");
  this.preview_type = initVar(options.preview_type, "images");

  // data specific settings
  this.subdiscipline_title = initVar(options.title, "");
  this.use_area_uri = initVar(options.use_area_uri, false);
  this.url_prefix = initVar(options.url_prefix, null)
  this.input_format = initVar(options.input_format, "csv");
  this.base_unit = initVar(options.base_unit, "readers")
  
  // application specific variables
  this.language = initVar(options.language, "eng");
  this.localization = {
      eng: {
          loading: "Loading...",
          search_placeholder: "Search...",
          show_list: "Show list",
          hide_list: "Hide list",
          readers: "readers",
          year: "date",
          authors: "authors",
          title: "title",
          area: "Area"
      },
      ger: {
          loading: "Wird geladen...",
          search_placeholder: "Suche...",
          show_list: "Liste ausklappen",
          hide_list: "Liste einklappen",
          readers: this.base_unit,
          year: "Jahr",
          authors: "Autor",
          title: "Titel",
          area: "Bereich"
      },
      eng_plos: {
          loading: "Loading...",
          search_placeholder: "Search...",
          show_list: "Show list",
          hide_list: "Hide list",
          readers: "views",
          year: "date",
          authors: "authors",
          title: "title",
          area: "Area"
      }
  }

  //plos
  this.url_plos_pdf = "http://www.plosone.org/article/fetchObject.action?representation=PDF&uri=info:doi/";
  this.plos_journals_to_shortcodes = {
      "plos neglected tropical diseases": "plosntds",
      "plos one": "plosone",
      "plos biology": "plosbiology",
      "plos medicine": "plosmedicine",
      "plos computational Biology": "ploscompbiol",
      "plos genetics": "plosgenetics",
      "plos pathogens": "plospathogens",
      "plos clinical trials": "plosclinicaltrials"
  }

  // contains bubbles objects for the timline view
  // elements get added to bubbles by calling registerBubbles()
  this.bubbles = {}

  // mediator
  this.mediator = new Mediator();
  this.mediator_states = {
    popup_visible:false
  }
  
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
  checkBrowserVersions: function() {
    var browser = BrowserDetect.browser;

    if (browser != "Firefox" && browser != "Safari" && browser != "Chrome") {
            alert("You are using an unsupported browser. This visualization"
                    + " was successfully tested with the latest versions of Chrome, Safari, Opera and Firefox.");
    }
  },
  
  //TODO: load scripts here
  loadScripts: function() {
  
  },
   
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
      url: this.service_path + "/writeActionToLog.php" + '?user=' + user 
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
    
    $.each(this.files, function(index, elem) {
      var bubble = new BubblesFSM();
      headstart.registerBubbles(bubble);
      bubble.title = elem.title;
      bubble.file = elem.file;
    })
  },

  calcChartSize: function() {
      parent_height = getRealHeight($("#"+this.tag));
      subtitle_heigth = $("#subdiscipline_title").outerHeight(true);
      if (parent_height == 0) {
          this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - subtitle_heigth;
      } else {
          this.available_height = $("#" + this.tag).height() - subtitle_heigth;
      }

      this.available_width = $("#" + this.tag).width() - $("#list_explorer").width();

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


  // the rest of headstarts variables, which are initalized by some
  // sort of calculation
  initDynamicVariables: function() {
    // Initialize correct chart size
    
    if (this.is("timeline")){
      this.current_vis_size = this.timeline_size;
    } else {
      this.calcChartSize()
    }

    this.x = d3.scale.linear().range([0, this.circle_zoom_factor]);
    this.y = d3.scale.linear().range([0, this.circle_zoom_factor]);

    this.correction_factor_width  = ( this.current_vis_size / this.min_width  );
    this.correction_factor_height = ( this.current_vis_size / this.min_height );
    this.setCorrectionFactor();
    // this.setListWidth();
    
    // Initialize global scales for zooming
    this.circle_min = ( this.min_area_size * this.correction_factor );
    this.circle_max = ( this.max_area_size * this.correction_factor );
    this.padding = this.circle_max / 2 + 45;

    this.setCircleSize();
    this.setDiameterSize();

    var to = this.current_vis_size - this.padding_articles;
    this.chart_x = d3.scale.linear().range( [this.padding_articles, to] );
    this.chart_y = d3.scale.linear().range( [this.padding_articles, to] );

    to = this.current_vis_size - this.padding;
    this.chart_x_circle = d3.scale.linear().range( [this.padding, to] );
    this.chart_y_circle = d3.scale.linear().range( [this.padding, to] );
  },

  // Size <helpers></helpers>
  getMinSize: function() {
      if (this.min_height >= this.min_width)
          return this.min_width;
      else
          return this.min_height;
  },
  
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

    if ( this.current_vis_size > this.available_height ||
         this.current_vis_size + this.list_width > this.available_width ){
        overflow = "auto";
    }

    d3.select( selector ).style( "overflow" , overflow );
  },

  // Draw basic SVG canvas
  // NOTE attribute width addition by number of elements
  drawSvg: function() {
      this.svg = d3.select("#chart-svg");

      this.svg.attr("height", this.current_vis_size + "px")
              .attr("width", this.current_vis_size + "px")
              .attr("viewBox", "0 0 " + this.current_vis_size + " " + this.current_vis_size)
              .attr("preserveAspectRatio", "xMidYMid meet");
  },


  drawChartCanvas: function() {

    var chart = this.svg.append("g").attr( "id", "chart_canvas" );
    chart.attr( "height", this.current_vis_size + "px" )
    chart.attr( "width",  this.current_vis_size + "px" );

    // Rectangle to contain nodes in force layout
    var rect = chart.append("rect")
    // var rect_width = this.current_vis_size;// + this.max_list_size;
    rect.attr( "height", this.current_vis_size + "px" )
    rect.attr( "width",  this.current_vis_size + "px" );

    this.chart = chart;
  },

  initEventListeners: function() {
      self = this;
      d3.select(window).on("resize", function() {
          self.calcChartSize()

          d3.select("#chart-svg").attr("width", self.current_vis_size + "px");
          d3.select("#chart-svg").attr("height", self.current_vis_size + "px");
          // d3.select("#chart-svg").attr("viewBox", "0 0 " + self.current_vis_size + " " + self.current_vis_size)
          // d3.select("#chart_canvas").attr("width", self.current_vis_size + "px");
          // d3.select("#chart_canvas").attr("height", self.current_vis_size + "px");

          list.fit_list_height();
      });
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
    var self = this;  
      
    $("rect").on( "click", function() {
      headstart.bubbles[headstart.current_file_number].zoomout();
    });
    
    $("#" + this.tag).bind('click', function(event) {
        if(event.target.id === self.tag) {
            headstart.bubbles[headstart.current_file_number].zoomout();
        }
    });
    
    /*$("#" + this.tag).on("click", function () {
      headstart.bubbles[headstart.current_file_number].zoomout();
    })*/

    $("#headstart-chart").on("click", function() {
      //headstart.mediator.publish("canvas_click", this.canvas_click);
      // headstart.bubbles[headstart.current_file_number].zoomOut();
    });
  },

  // Draws the h1 for headstart
  drawTitle: function() {
    var text_style = "font-size: 10pt;";
    var link_style = "font-size:8pt; color: rgb(167, 8, 5)";

    var whatsthis = ' <span id="info" style="' + text_style +
                    '">(<a href="#" id="infolink" style="'   + link_style +
                    '">' + "What's this?" + '</a>)</span></h2>';

    var info = d3.select( "#subdiscipline_title h4")
                 .html(headstart.subdiscipline_title + whatsthis);
  },

  initForceAreas: function() {
    var padded = this.current_vis_size - this.padding;
    this.force_areas = d3.layout.force().links([]).size([padded, padded]);
  },

  initForcePapers: function() {
    var padded = this.current_vis_size - this.padding;
    this.force_papers = d3.layout.force().nodes([]).links([]).size([padded, padded]);
  },

  // calls itself over and over until the forced layout of the papers
  // is established
  checkForcePapers: function() {
    var hs = this;
    if (hs.is("normal") || hs.is("switchfiles")) {
      checkPapers = window.setInterval(function () {
        if (hs.is("normal") || hs.is("switchfiles")) {
          if ((!papers.is("ready") && !papers.is("none")) || (bubbles.is("startup") || bubbles.is("none") || (bubbles.is("start")) )) {
            if (hs.force_papers.alpha() <= 0 && hs.force_areas.alpha() <= 0) {
              papers.forced();
              if(headstart.show_list) {
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
    var to = (this.bubblesSize() * this.current_vis_size);
    for (var i = 0; i <= to; i+= this.current_vis_size) {
      this.svg.append("line")
      .attr("x1", i)
      .attr("x2", i)
      .attr("y1", "0")
      .attr("y2", "900")
    }
  },

  drawXGrid: function() {
    for (var i = 0; i <= 900; i+=50) {
      this.svg.append("line")
      .attr("x1", "0")
      .attr("x2", this.bubblesSize() * this.current_vis_size)
      .attr("y1", i)
      .attr("y2", i)
    };
  },

  drawGridTitles: function() {
    $("#headstart-chart").append('<div id="tl-titles"></div>');
    for (var i = 1; i <= this.bubblesSize(); i++) {
      $("#tl-titles").append('<div class="tl-title">' +
          this.bubbles[i].title
          + '</div>');
    }
    $(".tl-title").css("width", this.current_vis_size);
  },
  
  createRestUrl: function () {
      
      var url = this.service_path + "getBookmarks.php?user=" + this.user_id;
      
      //sometimes the conference id array is not recognized
      var conference_id = eval(this.conference_id);
      
      if($.isArray(conference_id)) {
          conference_id.forEach(function (val) {
            url += "&conference[]=" + val;
          })
      } else {
          url += "&conference=" + this.conference_id;
      }
      
      url += "&max_recommendations=" + this.max_recommendations;
      
      url += "&jsoncallback=?";
      
      return url;
  },

  drawInfoLinkWithTitle: function(title) {
      var text_style = "font-size: 10pt;";
      var link_style = "font-size:8pt; color: rgb(167, 8, 5)";

      var whatsthis = ' <span id="info" style="' + text_style +
          '">(<a href="#" id="infolink" style="' + link_style +
          '">' + title + '</a>)</span></h2>';

      var info = d3.select("#subdiscipline_title h4")
          .html(this.subdiscipline_title + whatsthis);
  },


  // FSM callbacks
  // the start event transitions headstart from "none" to "normal" view
  onstart: function( event, from, to, file ) {
    this.init_mediator();
    
    this.loadScripts();
    
    this.checkBrowserVersions();
    this.checkThatRequiredLibsArePresent();
    this.drawTitle();

    this.initDynamicVariables();

    this.setOverflowToHiddenOrAuto( "#main" );
    
    this.resetBubbles();
    
    var bubbles = this.bubbles[this.current_file_number];

    // NOTE: async call
    // therefore we need to call the methods which depend on bubbles.data
    // after the csv has been received.
    var hs = this;
    
    var setupVisualization = function( csv ) {
      // hs.drawTitle();
      hs.drawSvg();
      hs.drawChartCanvas();
      if(headstart.is_adaptive) {
        
        var url = headstart.createRestUrl();
            
        $.getJSON(url, function(data) {
          headstart.startVisualization(hs, bubbles, csv, data, true);
        });
      } else {
        headstart.startVisualization(hs, bubbles, csv, null, true);
      }
    }

    switch(this.input_format) {
        case "csv":
            d3.csv(bubbles.file, setupVisualization);
            break;
            
        case "json":
            d3.json(this.service_path + "getLatestRevision.php?vis_id=" + bubbles.file, setupVisualization);
            break;
            
        case "json-direct":
            setupVisualization(bubbles.file);
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
  ontotimeline: function( event, from, to ){
    
    window.clearInterval(checkPapers);
    
    this.force_areas.stop();
    this.force_papers.stop();
   
    this.resetBubbles();
   
    // clear the canvas
    $("#chart_canvas").empty();

    // clear the list list
    $("#list_explorer").empty();
    
    this.bubbles[headstart.current_file_number].current = "x";
    popup.current  = "hidden";
    papers.current = "none";
    list.current   = "none";

    // change heading to give an option to get back to normal view
    popup.drawNormalViewLink();
    this.initDynamicVariables();

    // need a bigger width for the timeline view
    s = this.timeline_size * Object.keys(this.bubbles).length;
    this.svg.attr("width", s);
    this.svg.attr("height", this.timeline_size);  
    this.svg.attr("viewBox", "0 0 " + s + " " + this.timeline_size)

    d3.select("#chart_canvas").attr("width", s)
                              .attr("height", this.timeline_size);  
    // this.svg.attr("preserveAspectRatio", "xMidYMid meet");

    d3.select("#headstart-chart").attr("overflow-x", "scroll");
    
    $("#main").css("overflow", "auto");

    // load bubbles in sync
    
    $.each(this.bubbles, function (index, elem) {
   
        
      var setupTimelineVisualization = function (csv) {
        elem.start( csv )
      }
      
      switch(headstart.input_format) {
            case "csv":
                d3.csv(elem.file, setupTimelineVisualization);
                break;

            case "json":
                d3.json(headstart.service_path + "getLatestRevision.php?vis_id=" + elem.file, setupTimelineVisualization);
                break;

            default:
                    break;
        }
      
    })

    this.drawGrid();
    this.drawGridTitles();
    this.initMouseListeners();
  },
  
  ontofile: function( event, from, to, file) {
    
    this.force_areas.stop();
    this.force_papers.stop();
    
    headstart.current_file_number = file;
    
    // clear the canvas
    $("#chart_canvas").remove();

    // clear the list list
    $("#list_explorer").empty();
    
    popup.current  = "hidden";
    papers.current = "none";
    list.current   = "none";

    this.initDynamicVariables();
    this.setOverflowToHiddenOrAuto( "#main" );
    
    // reset bubbles
    this.resetBubbles();
    
    var bubbles = this.bubbles[this.current_file_number];

    var hs = this;
    var setupVisualization = function( csv ) {
      hs.drawChartCanvas();
      
      if(headstart.is_adaptive) {
        
        var url = headstart.createRestUrl();
            
        $.getJSON(url, function(data) {
          headstart.startVisualization(hs, bubbles, csv, data, false);
        });
      } else {
        headstart.startVisualization(hs, bubbles, csv, null, false);
      }
    }
    
    switch(this.input_format) {
        case "csv":
            d3.csv(bubbles.file, setupVisualization);
            break;
            
        case "json":
            d3.json(this.service_path + "getLatestRevision.php?vis_id=" + bubbles.file, setupVisualization);
            break;
            
        default:
                break;
    }
  },
  
  startVisualization: function(hs, bubbles, csv, adaptive_data, popup_start) {
    bubbles.start( csv, adaptive_data );

    hs.initEventListeners();
    hs.initMouseListeners();
    hs.initForcePapers();
    hs.initForceAreas();

    papers.start( bubbles );
    // moving this to bubbles.start results in papers being displayed over the
    // bubbles, unfortunately
    bubbles.draw();

    bubbles.initMouseListeners();
    list.start( bubbles );
    
    if(popup_start)
      popup.start();
    
    hs.checkForcePapers();
    //$("#area_title>h2").hyphenate('de');
    $("#area_title_object>body").dotdotdot({wrap:"letter"});

    $('#myModal').on('show.bs.modal', function (event) {
      // var button = $(event.relatedTarget) // Button that triggered the modal
      // var recipient = button.data('whatever') // Extract info from data-* attributes
      // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
      // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
      var modal = $(this)
      modal.find('.modal-title').text(intro_title)
      modal.find('.modal-body').html(intro_body)
    })
  },

  init_mediator: function() {
    // popup
    headstart.mediator.subscribe("popup_toggle", this.popup_toggle);
    headstart.mediator.subscribe("to_timeline", this.to_timeline);

    // list
    headstart.mediator.subscribe("list_toggle", this.list_toggle);
    headstart.mediator.subscribe("list_show_popup", this.list_show_popup);
    headstart.mediator.subscribe("list_title_click", this.list_title_click);
    headstart.mediator.subscribe("list_sort_click", this.list_sort_click);
    headstart.mediator.subscribe("list_title_clickable", this.list_title_clickable);
    headstart.mediator.subscribe("preview_mouseover", this.preview_mouseover);
    headstart.mediator.subscribe("preview_mouseout", this.preview_mouseout);

    // papers
    headstart.mediator.subscribe("paper_click", this.paper_click);
    headstart.mediator.subscribe("paper_mouseover", this.paper_mouseover);
    headstart.mediator.subscribe("currentbubble_click", this.currentbubble_click);

    // bubbles
    headstart.mediator.subscribe("bubble_mouseout", this.bubble_mouseout);
    headstart.mediator.subscribe("bubble_mouseover", this.bubble_mouseover);
    headstart.mediator.subscribe("bubble_click", this.bubble_click);

    // canvas
    headstart.mediator.subscribe("canvas_click", this.canvas_click);

    // bookmarks
    headstart.mediator.subscribe("bookmark_added", this.bookmark_added);
    headstart.mediator.subscribe("bookmark_removed", this.bookmark_removed);

    // misc
    headstart.mediator.subscribe("record_action", this.record_action);
  },

  popup_toggle: function() {
    $("#myModal").modal();
    // if (headstart.mediator_states.popup_visible) {
    //   popup.hide();
    //   headstart.mediator_states.popup_visible = false;
    // } else {
    //   popup.show();
    //   headstart.mediator_states.popup_visible = true;
    // }
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

  canvas_click: function() {
    headstart.bubbles[headstart.current_file_number].zoomOut();
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

function getRealHeight(element){
    var height=0;
    if (element.children().length>0){
        var temp = $('<div></div>');
        temp.append(element.children());
        height = element.height();
        element.append(temp.children());
    } else {
        var html=element.html();
        element.html('');
        height = element.height();
        element.html(html);
    }
    return height;
}

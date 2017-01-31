/* globals $, d3, data_config */
import { getRealHeight } from "helpers";
import config from 'config';
import { headstart } from 'headstart';
import { papers } from 'papers';
import { mediator } from 'mediator';
import { intros } from 'intro';

const timelineTemplate = require('templates/timeline.handlebars');
const headstartTemplate = require("templates/headstart.handlebars");
const infoTemplate = require("templates/misc/info_modal.handlebars");
const iFrameTemplate = require("templates/misc/iframe_modal.handlebars");
const imageTemplate = require("templates/misc/images_modal.handlebars");

class Canvas {
  constructor() {
    Object.assign(config, data_config);
    this.available_height = null;
    this.available_width = null;
    this.current_vis_size = null;

    // Build Headstart skeleton
    this.viz = $("#" + config.tag);
    this.viz.addClass("headstart");

    this.viz.append(headstartTemplate());
    this.viz.append(infoTemplate());
    this.viz.append(iFrameTemplate());
    this.viz.append(imageTemplate());
    if (!config.render_bubbles) {
      $(".vis-col").remove();
      this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      if(config.render_list) {
        $(".list-col").height(this.available_height);
        $("#papers_list").height(this.available_height);
      }
    }
    if (!config.render_list) {
      $(".list-col").remove();
    }
  }

  getCurrentCircle(d) {
    mediator.current_circle = canvas.chart.selectAll("circle")
          .filter(function(x) {
              if (config.use_area_uri) {
                  return x.area_uri == d.area_uri;
              } else {
                  return x.title == d.area;
              }
          });
  }

  // Set this.available_height, this.available_width and this.current_vis_size
  calcChartSize() {
    var parent_height = getRealHeight($("#" + config.tag));
    var subtitle_heigth = $("#subdiscipline_title").outerHeight(true);

    // Set available_height and available_width
    if (parent_height === 0) {
      this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - subtitle_heigth;
    } else {
      this.available_height = $("#" + config.tag).height() - subtitle_heigth;
    }

    this.available_height = this.available_height - 1;

    if (headstart.is("timeline")) {
      var timeline_height = $(".tl-title").outerHeight(true);
      this.available_height =  this.available_height - timeline_height;
      this.available_width = $("#" + config.tag).width();
    } else {
      this.available_width = $("#" + config.tag).width() - $("#list_explorer").width();
    }

    // Set current_vis_size
    if ( this.available_width > config.min_width && this.available_height > config.min_height) {
      if (this.available_width >= this.available_height) {
        this.current_vis_size = this.available_height;
      } else {
        this.current_vis_size = this.available_width;
      }
    } else {
      this.current_vis_size = this.getMinSize();
    }

    if (this.current_vis_size > config.max_height) {
      this.current_vis_size = config.max_height;
    }
  }

  initScales() {
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
  }

  setScaleRanges() {
    // Calculate correct scaling factors and paper/circle dimensions
    const correction_factor = this.current_vis_size / config.reference_size;

    const circle_min = (config.min_area_size * correction_factor) * config.bubble_min_scale;
    const circle_max = (config.max_area_size * correction_factor) * config.bubble_max_scale;
    this.circle_size.range([circle_min, circle_max]);

    const paper_min = (config.min_diameter_size * correction_factor) * config.paper_min_scale;
    const paper_max = (config.max_diameter_size * correction_factor) * config.paper_max_scale;
    this.diameter_size.range([paper_min, paper_max]);

    // Set ranges on scales
    const padding_articles = 5;
    this.chart_x.range([padding_articles, this.current_vis_size - padding_articles]);
    this.chart_y.range([padding_articles, this.current_vis_size - padding_articles]);

    const circle_padding = circle_max/2 + 45;
    this.chart_x_circle.range([circle_padding, this.current_vis_size - circle_padding]);
    this.chart_y_circle.range([circle_padding, this.current_vis_size - circle_padding]);

    const zoomed_article_padding = 60;
    this.x.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);
    this.y.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);

    const zoomed_article_padding_paper = 35;
    this.paper_x.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
    this.paper_y.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
  }
  // Size helper functions
  getMinSize() {
    if (config.min_height >= config.min_width) {
      return config.min_width;
    } else {
      return config.min_height;
    }
  }

  // auto if enough space is available, else hidden
  setOverflowToHiddenOrAuto( selector ) {
    var overflow = "hidden";

    if ( this.current_vis_size > this.available_height ||
      this.current_vis_size + config.list_width > this.available_width ){
      overflow = "auto";
    }

    d3.select( selector ).style( "overflow" , overflow );
  }

  // Draw basic SVG canvas
  // NOTE attribute width addition by number of elements
  drawSvg() {
    const svg = d3.select("#chart-svg");
    svg.attr("height", this.current_vis_size + "px")
       .attr("width", this.current_vis_size + "px");
  }

  drawTimelineSvg() {
    const svg = d3.select("#chart-svg");
    let s = this.current_vis_size * Object.keys(mediator.bubbles).length;
    svg.attr("width", s)
      .attr("height", this.current_vis_size);
    svg.attr("viewBox", "0 0 " + s + " " + this.current_vis_size);
  }

  drawChartCanvas() {
    const svg = d3.select("#chart-svg");
    this.chart = svg.append("g").attr( "id", "chart_canvas" );
    // Rectangle to contain nodes in force layout
    this.chart.append("rect");
    this.updateChartCanvas();
  }

  updateChartCanvas() {
    d3.select("rect")
      .attr( "height", this.current_vis_size )
      .attr( "width",  this.current_vis_size );
  }

  calcTitleFontSize() {
    if (this.current_vis_size <= 600) {
      return "12px";
    } else if (this.current_vis_size <= 1000) {
      return "14px";
    } else {
      return "16px";
    }
  }

  initEventListeners() {
    d3.select(window).on("resize", () => {
      if (headstart.is("timeline")) {
        return;
      }
      mediator.publish("window_resize");
    });

    // Info Modal Event Listener
    $('#info_modal').on('show.bs.modal', function() {
      var current_intro = config.intro;
      var intro = (typeof intros[current_intro] != "undefined")?(intros[current_intro]):(headstart.intro)
      $('.modal-title').text(intro.title);
      $('.modal-body').html(intro.body);
    });
  }

  // Mouse interaction listeners
  initMouseListeners() {
    this.initMouseMoveListeners();
    this.initMouseClickListeners();
    this.initClickListenersForNav();
  }

  initMouseMoveListeners() {
    $("rect").on( "mouseover", () => {
      mediator.publish("on_rect_mouseover");
    });
  }

  initMouseClickListeners() {
    $("#chart-svg").on("click", () => {
      mediator.publish('chart_svg_click');
    });

    $("#" + config.tag).bind('click', (event) => {
      if(event.target.className === "container-headstart" || 
         event.target.className === "vis-col"             || 
         event.target.id        === "headstart-chart") {
        mediator.publish('chart_svg_click');
      }
    });
  }

  initClickListenersForNav() {
    $("#timelineview").on("click", () => {
      if ($("#timelineview a").html() === "TimeLineView") {
        mediator.publish("to_timeline");
      }
    });
  }

  // Draws the header for this
  drawTitle() {
    let chart_title = "";
    chart_title = config.localization[config.language].default_title;
    if(config.title) chart_title = config.title;

    var subdiscipline_title_h4 = $("#subdiscipline_title h4");
    subdiscipline_title_h4.html(chart_title);
    $("#num_articles").html($(".paper").length);

    if (config.show_infolink) {
      let infolink = ' (<a data-toggle="modal" data-type="text" href="#info_modal" id="infolink"></a>)';
      subdiscipline_title_h4.append(infolink);
      $("#infolink").text(config.localization[config.language].intro_label);
    }

    if (config.show_timeline) {
      let link = ' <span id="timelineview"><a href="#">TimeLineView</a></span>';
      subdiscipline_title_h4.append(link);
    }

    if (config.show_dropdown) {
      let dropdown = '<select id="datasets"></select>';

      subdiscipline_title_h4.append(" Select dataset: ");
      subdiscipline_title_h4.append(dropdown);

      $.each(config.files, (index, entry) => {
        let current_item = '<option value="' + entry.file + '">' + entry.title + '</option>';
        $("#datasets").append(current_item);
      });

      $("#datasets").val(mediator.current_bubble.file);

      $("#datasets").change(function() {
        let selected_file_number = this.selectedIndex;
        if (selected_file_number !== mediator.current_file_number) {
          headstart.tofile(selected_file_number);
        }
      });
    }
  }

  initForceAreas() {
    let padded = canvas.current_vis_size - headstart.padding;
    this.force_areas = d3.layout.force().links([]).size([padded, padded]);
  }

  initForcePapers() {
    let padded = canvas.current_vis_size - headstart.padding;
    this.force_papers = d3.layout.force().nodes([]).links([]).size([padded, padded]);
  }

  // Grid drawing methods
  // draw x and y lines in svg canvas for timelineview
  drawGrid() {
    this.drawXGrid();
    this.drawYGrid();
  }

  removeGrid() {
    $("line").remove();
  }

  drawYGrid() {
  const svg = d3.select("#chart-svg");
  var to = ((mediator.bubbles.length + 1) * this.current_vis_size);
  for (var i = 0; i <= to; i+= this.current_vis_size) {
    svg.append("line")
      .attr("x1", i)
      .attr("x2", i)
      .attr("y1", "0")
      .attr("y2", "900");
    }
  }

  drawXGrid() {
  const svg = d3.select("#chart-svg");
    for (var i = 0; i <= 900; i+=50) {
      svg.append("line")
        .attr("x1", "0")
        .attr("x2", (mediator.bubbles.length + 1) * this.current_vis_size)
        .attr("y1", i)
        .attr("y2", i);
    }
  }

  // calls itself over and over until the forced layout of the papers
  // is established
  checkForcePapers() {
    if (headstart.is("normal") || headstart.is("switchfiles")) {
      var checkPapers = window.setInterval(() => {
        if (
            ((!papers.is("ready") && !papers.is("none")) || 

            (mediator.current_bubble.is("startup")|| 
             mediator.current_bubble.is("none")   || 
            (mediator.current_bubble.is("start"))   ))   &&

            (this.force_papers.alpha() <= 0 && this.force_areas.alpha() <= 0)
           ) {
               papers.forced();
               mediator.publish("check_force_papers");
               window.clearInterval(checkPapers);
            }
      }, 10);
    }
  }

  drawGridTitles(update) {
    update = typeof update !== 'undefined' ? update : false;

    if (update === true) {
      $("#tl-titles").width(this.current_vis_size * Object.keys(mediator.bubbles).length);
      $(".tl-title").css("width", this.current_vis_size);
    } else {
      for (var i = 0; i < mediator.bubbles.length; i++) {
        $("#tl-titles").append(
          '<div class="tl-title"><h3>' + mediator.bubbles[i].title + '</h3></div>');
      }
      $("#tl-titles").width(this.current_vis_size * Object.keys(mediator.bubbles).length);
      $(".tl-title").css("width", this.current_vis_size);
    }
  }

  drawNormalViewLink() {
    // remove event handler
    var id_timelineview = $("#timelineview");
    id_timelineview.off("click");
    // refreshes page
    var link = ' <a href="" id="normal_link">Normal View</a>';
    id_timelineview.html(link);
  }

  setupCanvas() {
    this.setOverflowToHiddenOrAuto("#main");
    this.drawTitle();
    this.calcChartSize();
    this.initScales();
    this.setScaleRanges();
    this.drawSvg();
    this.drawChartCanvas();
  }

  setupResizedCanvas() {
      // Set domain to old this.current_vis_size
      mediator.resized_scale_x.domain([0, this.current_vis_size]);
      mediator.resized_scale_y.domain([0, this.current_vis_size]);
      this.calcChartSize(); // Calculate new this.current_vis_size
      // Set range to new this.current_vis_size
      mediator.resized_scale_x.range([0, this.current_vis_size]);
      mediator.resized_scale_y.range([0, this.current_vis_size]);

      // Call setScaleRanges again to set the new Range of 
      // this . chart_x,y chart_x,y_circle, x,y, paper_x, paper_y,
      // circle_size, diameter_size
      this.setScaleRanges();
      this.drawSvg();
      this.updateChartCanvas();
  }

  setupTimelineCanvas() {
    this.viz.empty();
    this.viz.append(timelineTemplate());

    // change heading to give an option to get back to normal view
    this.force_areas.stop();
    this.force_papers.stop();
    // clear the canvas
    $("#chart_canvas").empty();

    this.drawGridTitles();
    this.setOverflowToHiddenOrAuto("#main");
    this.drawTitle();
    this.calcChartSize();
    this.initScales();
    this.setScaleRanges();
    this.drawTimelineSvg();
    this.drawChartCanvas();
    this.drawNormalViewLink();
    this.drawGridTitles(true);
    d3.select("#headstart-chart").attr("overflow-x", "scroll");
    $("#main").css("overflow", "auto");
  }

  setupToFileCanvas() {
    this.force_areas.stop();
    this.force_papers.stop();
    // clear the canvas & list
    $("#chart_canvas").remove();
  }

  initEventsAndLayout() {
    this.initEventListeners();
    this.initMouseListeners();
    this.initForcePapers();
    this.initForceAreas();
  }

  showInfoModal() {
    if (config.show_intro) {
      $("#infolink").click();
    }
  }

  hyphenateAreaTitles() {
    $("#area_title>h2").hyphenate('en');
  }

  dotdotdotAreaTitles() {
    $("#area_title_object>body").dotdotdot({wrap:"letter"});
  }

  updateCanvasDomains(data) {
    this.chart_x.domain(d3.extent(data, function (d) {
        return d.x;
    }));
    this.chart_y.domain(d3.extent(data, function (d) {
        return d.y * -1;
    }));
    this.diameter_size.domain(d3.extent(data, function (d) {
        return d.internal_readers;
    }));
  }

  updateData(data) {
    data.forEach(function(d) {
      // construct rectangles of a golden cut
      d.diameter = canvas.diameter_size(d.internal_readers);
      d.width = config.paper_width_factor * Math.sqrt(Math.pow(d.diameter, 2) / 2.6);
      d.height = config.paper_height_factor * Math.sqrt(Math.pow(d.diameter, 2) / 2.6);
      d.orig_x = d.x;
      d.orig_y = d.y;
      // scale x and y
      d.x = canvas.chart_x(d.x);
    });      
  }

  setDomain(prop, extent) {
    this[prop].domain(extent);
  }

  setAreaRadii(areas) {
    for (var area in areas) {
      areas[area].r = this.circle_size(areas[area].readers);
    }
  }

  setNewAreaCoords(new_area, area) {
    new_area.x = this.chart_x_circle(area.x);
    new_area.y = this.chart_y_circle(area.y);
  }
}

export const canvas = new Canvas();

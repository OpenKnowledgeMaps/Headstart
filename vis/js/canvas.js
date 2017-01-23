import { getRealHeight } from "helpers";
import config from 'config';
import { headstart } from 'headstart';
import { papers } from 'papers';
import { mediator } from 'mediator';

class Canvas {
  constructor() {
    this.available_height = null;
    this.available_width = null;
    this.current_vis_size = null;
  }

  getCurrentCircle(d) {
    return canvas.chart.selectAll("circle")
          .filter(function(x) {
              if (config.use_area_uri) {
                  return x.area_uri == d.area_uri;
              } else {
                  return x.title == d.area;
              }
          });
  }

  calcChartSize() {
    var parent_height = getRealHeight($("#" + config.tag));
    var subtitle_heigth = $("#subdiscipline_title").outerHeight(true);

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

    if (this.availableSizeIsBiggerThanMinSize()) {
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

  // Calculate all scales for the current map
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

  availableSizeIsBiggerThanMinSize() {
    if ( this.available_width > config.min_width && this.available_height > config.min_height ) {
      return true;
    } else {
      return false;
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
  drawSvg(update) {

    update = typeof update !== 'undefined' ? update : false;

    this.svg = d3.select("#chart-svg");

    if (headstart.is("timeline")) {
      let s = this.current_vis_size * Object.keys(headstart.bubbles).length;
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
  }

  drawChartCanvas() {
    this.chart = this.svg.append("g").attr( "id", "chart_canvas" );
    // Rectangle to contain nodes in force layout
    this.chart.append("rect");
    // var rect_width = this.current_vis_size;// + config.max_list_size;
    this.updateChartCanvas();

    //chart.attr( "height", this.current_vis_size + "px" )
    //chart.attr( "width",  this.current_vis_size + "px" );
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
    var cv = this;

    d3.select(window).on("resize", () => {
      if (headstart.is("timeline")) {
        return;
      }

      let resized_scale_x = d3.scale.linear();
      let resized_scale_y = d3.scale.linear();

      resized_scale_x.domain([0, this.current_vis_size]);
      resized_scale_y.domain([0, this.current_vis_size]);

      this.calcChartSize();
      this.setScaleRanges();
      this.drawSvg(true);
      this.updateChartCanvas();
      mediator.publish("window_resize");

      resized_scale_x.range([0, this.current_vis_size]);
      resized_scale_y.range([0, this.current_vis_size]);

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

      d3.selectAll("circle")
        .attr("r", (d) => {
          d.r_zoomed = this.circle_size(d.readers) * headstart.circle_zoom;
          d.r = this.circle_size(d.readers);
          if (headstart.is_zoomed === true) {
            return d.r_zoomed;
          } else {
            return d.r;
          }
        });

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

      $("#area_title>h2").css("font-size", cv.calcTitleFontSize());
      $("#area_title>h2").hyphenate('en');
      $("#area_title_object>body").dotdotdot({wrap:"letter"});

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

      var paper_holders = d3.selectAll("div.paper_holder");

      paper_holders.each((d) => {
        d.diameter = this.diameter_size(d.internal_readers);
        d.width = config.paper_width_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.height = config.paper_height_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.top_factor = (1-config.dogear_width);

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
            return (config.content_based)?(d.resize_height):(d.resize_height * 0.8 + "px");
          } else {
            return (config.content_based)?(d.resize_height + "px"):(d.resize_height - 20 + "px");
          }
        });

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
    });

    // Info Modal Event Listener
    $('#info_modal').on('show.bs.modal', function() {
      var current_intro = config.intro;

      var intro = (typeof intros[current_intro] != "undefined")?(intros[current_intro]):(config.intro);

      $(headstart).find('.modal-title ').text(intro.title);
      $(headstart).find('.modal-body').html(intro.body);
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
      if (!headstart.is_zoomed) {
        headstart.bubbles[headstart.current_file_number].onmouseout("notzoomedmouseout");
        headstart.current_circle = null;
      }
      headstart.bubbles[headstart.current_file_number].mouseout("outofbigbubble");
      this.initClickListenersForNav();
    });
  }

  initMouseClickListeners() {
    $("#chart-svg").on("click", () => {
      headstart.bubbles[headstart.current_file_number].zoomout();
    });

    $("#" + config.tag).bind('click', (event) => {
      if(event.target.className === "container-headstart" || event.target.className === "vis-col" || event.target.id === "headstart-chart") {
        headstart.bubbles[headstart.current_file_number].zoomout();
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

    if(config.title === "") {
      if (config.language === "eng") {
        chart_title = 'Overview of <span id="num_articles"></span> articles';
      } else {
        chart_title = 'Überblick über <span id="num_articles"></span> Artikel';
      }
    } else {
      chart_title = config.title;
    }
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

      //$("#datasets " + headstart.current_file_number + ":selected").text();
      $("#datasets").val(headstart.bubbles[headstart.current_file_number].file);

      $("#datasets").change(function() {
        let selected_file_number = this.selectedIndex;
        if (selected_file_number !== headstart.current_file_number) {
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
  var to = ((headstart.bubbles.length + 1) * this.current_vis_size);
  for (var i = 0; i <= to; i+= this.current_vis_size) {
    this.svg.append("line")
      .attr("x1", i)
      .attr("x2", i)
      .attr("y1", "0")
      .attr("y2", "900");
    }
  }

  drawXGrid() {
    for (var i = 0; i <= 900; i+=50) {
      this.svg.append("line")
        .attr("x1", "0")
        .attr("x2", (headstart.bubbles.length + 1) * this.current_vis_size)
        .attr("y1", i)
        .attr("y2", i);
    }
  }

  // calls itself over and over until the forced layout of the papers
  // is established
  checkForcePapers() {
    var bubble = headstart.bubbles[headstart.current_file_number];

    if (headstart.is("normal") || headstart.is("switchfiles")) {
      var checkPapers = window.setInterval(() => {
        if (headstart.is("normal") || headstart.is("switchfiles")) {
          if ((!papers.is("ready") && !papers.is("none")) || (bubble.is("startup") || bubble.is("none") || (bubble.is("start")) )) {
            if (this.force_papers.alpha() <= 0 && this.force_areas.alpha() <= 0) {
              papers.forced();
              mediator.publish("check_force_papers");
              window.clearInterval(checkPapers);
            }
          }
        }
      }, 10);
    }
  }

  drawGridTitles(update) {
    update = typeof update !== 'undefined' ? update : false;

    if (update === true) {
      $("#tl-titles").width(this.current_vis_size * Object.keys(headstart.bubbles).length);
      $(".tl-title").css("width", this.current_vis_size);
    } else {
      for (var i = 0; i < headstart.bubbles.length; i++) {
        $("#tl-titles").append(
          '<div class="tl-title"><h3>' + headstart.bubbles[i].title + '</h3></div>');
      }
      $("#tl-titles").width(this.current_vis_size * Object.keys(headstart.bubbles).length);
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
    this.initScales();
    this.setOverflowToHiddenOrAuto("#main");
    this.drawTitle();
    this.calcChartSize();
    this.setScaleRanges();
    this.drawSvg();
    this.drawChartCanvas();
  }

  setupTimelineCanvas() {
    mediator.publish("setup_timeline_canvas");

    // change heading to give an option to get back to normal view
    this.force_areas.stop();
    this.force_papers.stop();
    // clear the canvas
    $("#chart_canvas").empty();

    this.drawGridTitles();
    this.initScales();
    this.setupCanvas();
    this.drawNormalViewLink();
    this.drawGridTitles(true);
    d3.select("#headstart-chart").attr("overflow-x", "scroll");
    $("#main").css("overflow", "auto");
  }

  setupToFileCanvas() {
    mediator.publish("setup_tofile_canvas");
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
}

export const canvas = new Canvas();

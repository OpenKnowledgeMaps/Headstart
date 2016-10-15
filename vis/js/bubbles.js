// StateMachine for Bubbles UI elements in Headstart
// Filename: bubbles.js
import StateMachine from 'javascript-state-machine';

import { headstart } from 'headstart';
import { mediator } from 'mediator';
import { papers} from 'papers';
import { list } from 'list';
import { toBack, toFront, hideSibling} from 'helpers';

const bubbleTemplate = require('templates/map/bubble.handlebars');

import 'hypher';
import 'lib/en.js';
import 'dotdotdot';

export var BubblesFSM = function() {
  this.id = 0;
  this.areas = {};
  this.areas_array = [];
  this.startup();
  this.title = "default-title";
};

BubblesFSM.prototype = {
  // prototype methods

  // draw the circles on the chart.
  // bubbles consist of a "circle" and "foreignObject"
  // both of which are created here
  draw: function() {
    var bubbleFrames = this.drawBubbleFrames();

    if (headstart.is("normal") || headstart.is("switchfiles")) {
      this.positionBubbles( bubbleFrames );
      this.addClassNamesToCircles( bubbleFrames );
    }

    if (headstart.is("timeline")) {
      this.positionBubbles2( bubbleFrames, this.id );
      this.addClassNamesToCirclesForGrouping( bubbleFrames );
    }

    this.appendForeignObjectTo( bubbleFrames );
    this.adjustBubbleTitleSizeTo( bubbleFrames, "12px" );
    this.resetCirclePosition();
  },

  drawBubbleFrames: function() {
    return headstart.chart.data(this.areas_array).selectAll("g.node")
                          .data(this.areas_array)
                          .enter().append("g").attr("class", "bubble_frame");
  },

  addClassNamesToCircles: function( bubbleFrames ) {
    bubbleFrames.append("circle")
            .attr("class", "area")
            .append("svg:title").text(function (d) { return d.title; });
  },

  addClassNamesToCirclesForGrouping: function( bubbleFrames ) {
    var svgCircles = bubbleFrames.append("circle").attr("id", "area");

    // add class name to .circle
    for (var i = 0; i < svgCircles[0].length; i++) {
        var class_name = (this.areas_array[i].title.replace(/ /g, ''));
        $(svgCircles[0][i]).attr("class", "area "+ class_name);
    }
  },

  prepareData: function(init_data, highlight_data) {

      var xy_array = [];

      // convert to numbers
      init_data.forEach(function(d) {
        d.x = parseFloat(d.x);
        d.y = parseFloat(d.y);

        //if two items have the exact same location, that throws off the force-based layout
        var xy_string = d.x + d.y;

        while(xy_array.hasOwnProperty(xy_string)) {
          d.y += 0.00000001;
          xy_string = d.x + d.y;
        }

        xy_array[xy_string] = true;

        if(d.paper_abstract === null || typeof d.paper_abstract === "undefined") {
            d.paper_abstract = "";
        }
        
        if(d.published_in === null || typeof d.published_in === "undefined") {
            d.published_in = "";
        }

        if(headstart.content_based === false) {
          d.readers = +d.readers;
          d.internal_readers = +d.readers + 1;
        } else {
          d.readers = 0;
          d.internal_readers = 1;
        }
        if(typeof highlight_data != 'undefined' && highlight_data !== null) {
          if(highlight_data.bookmarks_all !== null) {
            highlight_data.bookmarks_all.forEach(function(x) {
                var id_string = x.id;
                id_string = id_string.toString();
                if(id_string == d.id) {
                  d.readers += x.num;
                  d.internal_readers += x.num;
                }
            });
          }
      }

        d.paper_selected = false;

        // convert authors to "[first name] [last name]"
        var authors = d.authors.split(";");
        var authors_string = "";
        var authors_short_string = "";
        for(var i=0; i<authors.length-1; i++) {
          var names = authors[i].trim().split(",");

          var last_name = names[0].trim();
          
          
          if(names.length > 1) {
            var first_name = names[1].trim();
            authors_string += first_name + " " + last_name;
            authors_short_string += first_name.substr(0,1) + ". " + last_name;
         } else {
              authors_string += last_name;
              authors_short_string += last_name;
         }

          if(i != authors.length-2) {
            authors_string += ", ";
            authors_short_string += ", ";
          }
        }

        d.authors_string = authors_string;
        d.authors_short_string = authors_short_string;

      });

      headstart.chart_x.domain(d3.extent(init_data, function(d) { return d.x; }));
      headstart.chart_y.domain(d3.extent(init_data, function(d) { return d.y*-1; }));
      headstart.diameter_size.domain(d3.extent(init_data, function(d) { return d.internal_readers; }));

      var areas = this.areas;
      init_data.forEach(function(d) {

        // construct rectangles of a golden cut
        d.diameter = headstart.diameter_size(d.internal_readers);

        d.width = headstart.paper_width_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.height = headstart.paper_height_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        
        d.orig_x = d.x;
        d.orig_y = d.y;
        
        // scale x and y
        d.x = headstart.chart_x(d.x);
        d.y = headstart.chart_y(d.y*-1);

        var area = (headstart.use_area_uri)?(d.area_uri):(d.area);

        if(area in areas) {
          areas[area].papers.push(d);
        } else {
          areas[area] = {};
          areas[area].title = d.area;
          areas[area].papers = [d];
        }

        d.resized = false;
      });

      if(typeof highlight_data != 'undefined' && highlight_data !== null) {
        if(highlight_data.bookmarks !== null) {
          highlight_data.bookmarks.forEach(function(d) {

            var index = init_data.filter(function (x) {
              return x.id == d.contentID;
            });

            if(index.length > 0) {
              index[0].bookmarked = 1;
            }
          });
        }

        if(highlight_data.recommendations !== null) {
          highlight_data.recommendations.forEach(function(d) {

            var index = init_data.filter(function (x) {
              return x.id == d.contentID;
            });

            if(index.length > 0) {
              index[0].recommended = 1;
            }
          });
        }

      }

      this.data = init_data;
  },

  // initialize all "mouseover", "mouseout" event listeners
  // for bubbles
  initMouseListeners: function() {
    this.initCircleListeners();
    this.initMouseListenersForTitles();
  },

  // blasen und papers weiterleitung
  // blasen -> wenn über blase gehovered und paper sichtbar
  // dann soll auch auf paper geclicked werden können.
  makePaperClickable: function(d) {
      headstart.current_circle =  headstart.chart.selectAll("circle")
      .filter(function (x) {
          if (d !== null) {
              if (headstart.use_area_uri) {
                return x.area_uri == d.area_uri;
              } else {
                return x.title == d.area;
              }
          } else {
              return null;
          }
      });

      zoom(headstart.current_circle.data()[0]);
      d3.event.stopPropagation(); // click stopps, "event bubbles up"
  },

  // initialize mouseover, mouseout circle listeners
  initCircleListeners: function() {
    var this_bubble_fsm = this;
    d3.selectAll("circle").on("mouseover", function(d) {
      if (!this_bubble_fsm.is("hoverbig")){
        mediator.publish("bubble_mouseover", d, this, this_bubble_fsm);
        mediator.publish("record_action",d.id, "circle_mouseover", headstart.user_id, "none", null);
      }
    }).on("mouseout", function(d) {
      mediator.publish("bubble_mouseout", d, this, this_bubble_fsm);
      mediator.publish("record_action",d.id, "circle_mouseout", headstart.user_id, "none", null);
    });

    if (headstart.is("normal") || headstart.is("switchfiles")) {
      this.initCircleClickListener();
    }
  },

  // initialize just the circle click listeners
  initCircleClickListener: function() {
    var self = this;

    d3.selectAll('circle').on("click", function(d) {
      mediator.publish("bubble_click", d, self);
      // self.zoomin(d);
    });

    d3.selectAll('circle').on("dblclick", function() {
      if(self.is("hoverbig") && headstart.is_zoomed && headstart.zoom_finished) {
            self.zoomout();
      }
    });
  },

  // initialize just the mousemovement listeners
  initMouseListenersForTitles: function() {
    d3.selectAll( "#area_title" ).on( "mouseover", function(d) {
      if(headstart.current != "timeline") {
        headstart.bubbles[headstart.current_file_number].hideCircle(this);
      } else {
        var underlying_circle =  d3.selectAll("circle")
          .filter(function (x) {
              if (d !== null) {
                  return x.title == d.title;                
              }
              else {
                  return null;
              }
          });

        headstart.bubbles[headstart.current_file_number].resetCircleDesignTimeLine(underlying_circle[0][0]);
        headstart.bubbles[headstart.current_file_number].highlightAllCirclesWithLike(underlying_circle[0][0]);
        headstart.bubbles[headstart.current_file_number].drawConnectionLines(underlying_circle[0][0]);
      }
    });

    d3.selectAll( "#area_title" ).on( "mouseout", function() {
      if(headstart.current != "timeline") {
        headstart.bubbles[headstart.current_file_number].showCircle(this);
      }
    });
  },

  // hide a cirlce
  hideCircle:  function( circle ) {
    var circle_element = circle.parentNode.parentNode.parentNode.firstChild;
    d3.select(circle_element.nextSibling).style("visibility", "hidden");
  },

  // show a cirlce
  showCircle:  function( circle ) {
    var circle_element = circle.parentNode.parentNode.parentNode.firstChild;
    d3.select(circle_element).style('opacity', 1);
    d3.select(circle_element.nextSibling).style("visibility", "visible");
  },

  // highlight a cirlce
  highlightCircle:  function( circle ) {
    circle.attr("class", "zoom_selected");
    circle.style("fill-opacity", 1);
  },


  // used for timeline view, when user hovers over one circle in a
  // time period, we want to highlight the same circle for the time period
  highlightAllCirclesWithLike: function( circle ) {
    var class_name = $(circle).attr("class").replace("area ", "");
    $("." + class_name).css("fill" , "#FE642E");
    $("." + class_name).css("fill-opacity", 1);
    var circles = $("." + class_name);
    for (var i=0; i<circles.length; i++) {
      toFront(circles[i].parentNode);
    }
  },

  // drawConnection between the circles:
  // the problem is jquery $(circles) returns the circles "unsorted".
  // we want them in sorted order by ascending left(x) coordinates.
  // so we can draw the lines from the left most circle to the rightmost in a
  // sensible manner.
  // the sortCircle method achieves this in a rudamentary way for now.
  drawConnectionLines: function( circle ) {
    var class_name = $(circle).attr("class").replace("area ", "");
    var circles = $("." + class_name);
    var sorted_circles = this.sortCircles(circles);

    //<line x1="0" y1="0" x2="2" y2="2" style="stroke:rgb(0,0,0);
    //                                         stroke-width:2" />
    for (var i = 0; i < sorted_circles.length-1; i++) {
      var circleStart = sorted_circles[i].getBoundingClientRect();
      var circleEnd = sorted_circles[i+1].getBoundingClientRect();
      headstart.svg.append("line")
        .attr("x1", circleStart.right + window.pageXOffset)
        .attr("x2", circleEnd.left + window.pageXOffset)
        .attr("y1", circleStart.top)
        .attr("y2", circleEnd.top)
        .attr("class", "connection");
    }
  },

  // sorts circles by left coords in ascending order
  // NOTE: there is probably a much better way of doing this, but it works for
  // now
  sortCircles: function(circles) {
    // first push all left values into array
    var left_values = [];
    for (let i=0; i<circles.length; i++) {
      left_values.push(circles[i].getBoundingClientRect().left);
    }
    // then sort these left_values
    left_values.sort(function(a,b){ return a-b; });

    var sorted_circles = [];
    // now go through the sorted values and when we find the value in the
    // original circles array, put it in sorted_circles
    for (let i=0; i<circles.length; i++) {
      for (let j=0; j<circles.length; j++) {
        if (left_values[i] == circles[j].getBoundingClientRect().left) {
          sorted_circles.push(circles[j]);
        }
      }
    }

    return sorted_circles;
  },

  // delete all connection lines from the svg canvas as soon as the mouse
  // is removed from the circle element.
  removeAllConnections: function() {
    $(".connection").remove();
  },

  bringPapersToFront:  function( d ) {
    var papers = d3.selectAll(".paper").filter(function (x) {
      return (headstart.use_area_uri)?(x.area_uri == d.area_uri):(x.area == d.title);
    });

    for (let i = 0; i < papers[0].length; i++) {
      var current_node = papers[0][i];
      toFront(current_node);
    }
  },

  // position the bubbles on chart area
  positionBubbles: function( bubbles ) {
    bubbles.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  },

  // for the timelineview we simply translate the "other" bubbles by the
  // current_vis_size
  positionBubbles2: function( bubbles, bubbles_id ) {
    bubbles.attr("transform", function (d) {
      var x_pos = d.x + ((bubbles_id-1) * headstart.current_vis_size);
      return "translate(" + x_pos + "," + d.y + ")";
    });
  },

  // set the title size of bubbles to px
  adjustBubbleTitleSizeTo: function( bubbles) {
    bubbles.selectAll("h2").style("font-size", headstart.calcTitleFontSize());
  },

  appendForeignObjectTo: function( bubbleFrame ) {
    bubbleFrame.append('foreignObject')
        .attr({
            'id': 'area_title_object',
            'class': "headstart",
            'x': function(d) {
                return d.x_html; },
            'y': function(d) {
                return d.y_html; },
            'width': function(d) {
                return d.width_html; },
            'height': function(d) {
                return d.height_html; },
        }).append("xhtml:body")
        .html(function(d) {
            return bubbleTemplate(d);
        });
  },

  // prepare the areas for the bubbles
  prepareAreas: function () {

    var areas = this.areas;
    var areas_array = this.areas_array;

    var readers = [];

    for(var area in areas) {
      var papers = areas[area].papers;
      var sum_readers = d3.sum(papers, function(d) { return d.internal_readers;  });

      readers.push(sum_readers);
    }

    headstart.circle_size.domain(d3.extent(readers));
    var area_x = [];
    var area_y = [];

    for(area in areas) {
      let papers = areas[area].papers;
      let sum_readers = d3.sum(papers, function(d) { return d.internal_readers;  });
      
      areas[area].readers = sum_readers;

      var mean_x = d3.mean(papers, function(d) { return d.x;  });
      var mean_y = d3.mean(papers, function(d) { return d.y;  });
      var r = headstart.circle_size(sum_readers);

      area_x.push(mean_x);
      area_y.push(mean_y);

      areas[area].x = mean_x;
      areas[area].y = mean_y;
      areas[area].r = r;
    }
    
    headstart.chart_x_circle.domain(d3.extent(area_x));
    headstart.chart_y_circle.domain(d3.extent(area_y));

    for (area in areas) {
      var new_area = [];
      new_area.title = areas[area].title;
      new_area.x = headstart.chart_x_circle(areas[area].x);
      new_area.y = headstart.chart_y_circle(areas[area].y);
      new_area.orig_x = areas[area].x;
      new_area.orig_y = areas[area].y;
      new_area.r = areas[area].r;
      new_area.height_html = Math.sqrt(Math.pow(areas[area].r,2)*2);
      new_area.width_html = Math.sqrt(Math.pow(areas[area].r,2)*2);
      new_area.x_html = 0 - new_area.width_html/2;
      new_area.y_html = 0 - new_area.height_html/2;
      new_area.area_uri = area;
      new_area.readers = areas[area].readers;
      new_area.papers = areas[area].papers;
      areas_array.push(new_area);
    }
  },

  zoom: function(d) {
    var previous_zoom_node = headstart.current_zoom_node;

    list.reset();

    papers.resetPaths();

    if(typeof d != 'undefined') {
      list.papers_list.selectAll("#list_holder")
        .style("display", function (d) { return d.filtered_out?"none":"inline"; });

      list.papers_list.selectAll("#list_holder")
        .filter(function (x) {
          return (headstart.use_area_uri)?(x.area_uri != d.area_uri):(x.area != d.title);
        })
      .style("display", "none");
    }

    d3.event.stopPropagation();

    if (previous_zoom_node !== null && typeof previous_zoom_node != 'undefined') {

      if(typeof d != 'undefined') {
        if(d3.select(previous_zoom_node).data()[0].title == d.title) {
          return;
        }
      } else {
        list.papers_list.selectAll("#list_holder")
          .style("display", function (d) { return d.filtered_out?"none":"inline"; });

        d3.event.stopPropagation();
        return;
      }
    }

    var zoom_node = headstart.chart.selectAll("circle")
      .filter(function (x) {
        if (d !== null) {
            return x.title == d.title;
        } else {
            return null;
        }
      });

    headstart.current_zoom_node = zoom_node.node();

    if(headstart.current_zoom_node !== null) {
      toFront(headstart.current_zoom_node.parentNode);
    }

    if(previous_zoom_node !== null) {
      toBack(previous_zoom_node.parentNode);
    }


    this.bringPapersToFront( d );

    zoom_node.on("mouseover", null)
      .on("mouseout", null);

    headstart.chart.selectAll("circle")
      .attr("class", "zoom_selected")
      .style("fill-opacity", "1");

    headstart.chart.selectAll("circle")
        .filter(function(x) {
            if (d !== null) {
                return (x.title != d.title);
            } else {
                return null;
            }
        })
        .attr("class", "zoom_unselected")
        .style("fill-opacity", 0.1)
        .on("mouseover", null)
        .on("mouseout", null);


    d3.select("#subdiscipline_title h4").text(headstart.localization[headstart.language].area +": " + d.title);
    $("#subdiscipline_title").dotdotdot();

    d3.selectAll("div.paper_holder")
      .on("mouseover", function(d){
        mediator.publish("paper_mouseover", d, this);
      });

    // d3.selectAll("circle")
    //   .on("click", function(d) {
    //     return bubbles.zoom(d);
    //   })
    // .style("display", "block");

    zoom_node.style("display", "block");

    d3.selectAll(".paper")
        .style("display", function (d) { return d.filtered_out?"none":"block"; });

    d3.selectAll(".paper")
      .filter(function (x) {
        return (headstart.use_area_uri)?(x.area_uri != d.area_uri):(x.area != d.title);
      })
    .style("display", "none");

    d3.selectAll("#region")
      .style("fill-opacity", 1);

    // Determine new zooming factor based on the viewbox
    //var svg = document.getElementById("chart-svg");
    //var viewbox = svg.getAttribute("viewBox").split(/\s+|,/);
    headstart.circle_zoom = headstart.current_vis_size / d.r / 2 * headstart.zoom_factor;
    headstart.x.domain([d.x - d.r, d.x + d.r]);
    headstart.y.domain([d.y - d.r, d.y + d.r]);

    headstart.paper_x.domain([d.x - d.r, d.x + d.r]);
    headstart.paper_y.domain([d.y - d.r, d.y + d.r]);
    
    var n = 0;

    var t = headstart.chart.transition()
      .duration(headstart.transition_duration)
      .each("start", function () { n++; })
      .each("end", function () {
          if (--n !== 0) {
              return;
          }

          headstart.zoom_finished = true;
    });

    headstart.bubbles[headstart.current_file_number].createTransition(t, d.title);

    mediator.publish("record_action", d.id, "zoom_in", headstart.user_id, "none", null);
    // headstart.recordAction(d.id, "zoom_in", headstart.user_id, "none", null);

    d3.event.stopPropagation();

    headstart.is_zoomed = true;
    headstart.zoom_finished = false;
  },

  zoomOut: function() {

    if (!headstart.is_zoomed) {
      return;
    }

    if (papers.is("loading")) {
      return;
    }

    list.reset();

    if (headstart.current_zoom_node !== null) {
      toFront(headstart.current_zoom_node.parentNode);

      var circle_data = d3.select(headstart.current_zoom_node).data();
      mediator.publish("record_action", circle_data.id, "zoom_out", headstart.user_id, "none", null);
      // headstart.recordAction(circle_data.id, "zoom_out", headstart.user_id, "none", null);
    } else {
      mediator.publish("record_action","none", "zoom_out", headstart.user_id, "none", null);
      // headstart.recordAction("none", "zoom_out", headstart.user_id, "none", null);
    }

    if (headstart.current_enlarged_paper !== null) {
      headstart.current_enlarged_paper.paper_selected = false;
      headstart.current_enlarged_paper = null;
    }

    list.papers_list.selectAll("#list_holder")
      .style("display", function (d) { return d.filtered_out?"none":"inline"; });

    var n = 0;
    var t = headstart.chart.transition()
      .duration(headstart.zoomout_transition)
      .each("start", function () {
          n++;
        })
      .each("end", function() {
        if(--n !== 0) {
            return;
        }

        headstart.chart.selectAll("#area_title_object")
            .style("display", "block")
            .filter(function() {
                return d3.select(this.previousSibling).attr("class") != "zoom_selected";
            })
                .style("visibility", "visible");

        headstart.current_zoom_node = null;
        headstart.is_zoomed = false;
      });
    
    t.selectAll("g.bubble_frame")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
    });
    
    t.selectAll("g.paper")//.each(function(d, i) {
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y +")";
      });

    t.selectAll("#region")
      .attr("d", function (d) {
        return papers.createPaperPath(0, 0, d.width, d.height);
      });

    t.selectAll("path.dogear")
      .attr("d", function (d) {
        return papers.createDogearPath(d.width*(1-headstart.dogear_width), 0, d.width, d.height);
      });

    //webkit bug
    t.selectAll("#article_metadata")
      .attr("width", function (d) { return d.width; })
      .attr("height", function (d) { return d.height; });

    t.selectAll("div.metadata")
      .style("width", function (d) {
        return d.width * (1-headstart.dogear_width) + "px";
      })
    .style("height", function (d) {
      return (headstart.content_based)?(d.height):(d.height * 0.75 + "px");
    });

    t.selectAll("div.readers")
      .style("height", function (d) {
        return d.height * 0.25 + "px";
      })
    .style("width", function (d) {
      return d.width + "px";
    })
    .style("margin-top", "0px");


    t.selectAll("p")
      .attr("class", "highlightable");

    d3.selectAll("span.readers_entity")
      .style("font-size", "8px");

    headstart.drawTitle();

    d3.selectAll(".paper")
      .style("display", function(d) { return d.filtered_out?"none":"block"; });

    this.resetCirclePosition(t);

    this.initCircleClickListener();

    var circles = d3.selectAll("g.bubble_frame");

    for (var i = 0; i < circles[0].length; i++) {
      var current_node = circles[0][i];
      toFront(current_node);
    }

    papers.resetPaths();

    d3.selectAll("div.paper_holder")
      .on("mouseover", null)
      .on("mouseout", null)
      .style("cursor", "default");

    papers.initPaperClickHandler();
  },

  resetCircleDesignTimeLine: function() {
      d3.selectAll("circle")
              .style("fill" , "rgb(210, 228, 240)")
              .style("fill-opacity" , "0.8");

      d3.selectAll("#area_title_object").style("visibility", "visible");
  },

  resetCircleDesign: function() {
    if(headstart.current_circle !== null) {
      d3.selectAll("circle")
        .attr("class", "area")
        .style("fill-opacity", "0.8");

      var papers = d3.selectAll(".paper")
        .filter(function (x) {
          if (headstart.current_circle.data()[0] !== null) {
            var area = headstart.current_circle.data()[0];
            return (headstart.use_area_uri)?(x.area_uri == area.area_uri):(x.area == area.title);
          } else {
            return null;
          }
        });

      for (var i = 0; i < papers[0].length; i++) {
        var current_node = papers[0][i];
        toBack(current_node);
      }
      d3.selectAll("#area_title_object").style("visibility", "visible");
    }
  },


  resetCirclePosition: function(obj) {
    if(typeof(obj) === "undefined") {
      obj = d3;
    }

    obj.selectAll("circle")
      .style("fill-opacity", "0.8")
      .attr("r", function(d) { return d.r; })
      .attr("cx", 0)
      .attr("cy", 0);
  },

  // on zoom IN
  createTransition: function(t) {

    d3.selectAll("#area_title_object")
      .style("display", "none");
    
    t.selectAll("g.bubble_frame")
      .attr("transform", function (d) {
          d.x_zoomed = headstart.x(d.x);
          d.y_zoomed = headstart.y(d.y);
          
          return "translate(" + d.x_zoomed + "," + d.y_zoomed + ")";
    });
    
    t.selectAll("circle")
     .attr("r", function(d) {
        d.r_zoomed = headstart.circle_zoom * d.r;
        return d.r_zoomed;
      });
    
    t.selectAll("g.paper")
      .attr("transform", function (g) {
        g.x_zoomed = headstart.paper_x(g.x);
        g.y_zoomed = headstart.paper_y(g.y);
        return "translate(" + g.x_zoomed + "," + g.y_zoomed + ")";
      });

    var region = function(d) {
      return papers.createPaperPath(0, 0, d.width*headstart.circle_zoom, d.height*headstart.circle_zoom);
    };

    var dogear = function(d) {
      return papers.createDogearPath(d.width*(1-headstart.dogear_width)*headstart.circle_zoom,
          0, d.width*headstart.circle_zoom, d.height*headstart.circle_zoom);
    };

    t.selectAll("#region")
      .attr("d", region);

      t.selectAll("path.dogear")
      .attr("d", dogear);

    //webkit bug
    t.selectAll("#article_metadata")
      .attr("width", function (d) {
        return d.width * headstart.circle_zoom;
      })
    .attr("height", function (d) {
      return d.height * headstart.circle_zoom;
    });

    t.selectAll("div.metadata")
      .style("height", function (d) {
        return (headstart.content_based)?(d.height * headstart.circle_zoom + "px"):(d.height * headstart.circle_zoom - 20 + "px");
      })
    .style("width", function (d) {
      return d.width * headstart.circle_zoom * (1-headstart.dogear_width) + "px";
    });

    t.selectAll("div.readers")
      //.style("height", "15px")
      .style("width", function (d) {
        return d.width * headstart.circle_zoom + "px";
      })
      //.style("margin-top", "4px");

    t.selectAll("p")
      .attr("class", "large highlightable");

    t.selectAll("span.readers_entity")
      .style("font-size", "11px");
  },

  onstart: function( event, from, to, csv, recommendation_data ) {
      this.prepareData(csv, recommendation_data);
      this.prepareAreas();

      if (headstart.is("timeline")) {
        this.draw();
        this.initMouseListeners();
      }
      mediator.publish("record_action","none", "start", headstart.user_id, "start_bubble", null, null, recommendation_data);
  },

  onbeforemouseover: function() {
     if (headstart.is("normal") || headstart.is("switchfiles")) {
       this.resetCircleDesign();
     }
  },

  onmouseover: function( event, from, to, d, circle) {

    headstart.current_circle = d3.select(circle);
    if (headstart.is("timeline")) {
      this.resetCircleDesignTimeLine(circle);
      this.highlightAllCirclesWithLike(circle);
      this.drawConnectionLines(circle);
      //hideSibling(circle);
    } else {
      this.resetCircleDesign();
      this.highlightCircle(headstart.current_circle);
      toFront(headstart.current_circle.node().parentNode);
      this.bringPapersToFront(d);
      hideSibling(circle);

      if (papers.is("behindbubble") || papers.is("behindbigbubble")) {
        papers.mouseover();
      }
      d3.selectAll("#region").style("fill-opacity", 1);
    }


  },

  // if the user hovers over a paper inside of a bubble,
  // we want to prevent the bubbles from switching from
  // hoversmall.
  onbeforemouseout: function( event, from, to, circle) {
     if (this.is("zoomedin") || this.is("hoverbig")) {
       return false;
     }

    if (papers.is("loading")) {
      return false;
    }

    if (event != "notzoomedmouseout") {
      if (papers.current == "infrontofbubble") {
        return false;
      }
    }

    if (circle != "outofbigbubble") {
      if (papers.is("infrontofbigbubble")) {
        return false;
      }
    }
  },

  onmouseout: function( event, from, to, d, circle ) {

    if (headstart.is("normal") || headstart.is("switchfiles")) {
      if (event == "notzoomedmouseout") {
        this.resetCircleDesign();
        if (!papers.is("loading")) {
          papers.mouseout();
        }
      }
      if (papers.is("infrontofbigbubble")) {
        papers.mouseout();
      }
    }

    if (headstart.is("timeline")) {
      this.resetCircleDesignTimeLine(circle);
      this.removeAllConnections();
    } else {
      this.resetCircleDesign();
    }
  },

  onzoomout: function() {
    this.zoomOut();
    this.resetCircleDesign();
    papers.zoomout();
    headstart.initClickListenersForNav();
  },

  // we only whant to be able to "zoom" when the papers are
  // ready
  onbeforezoomin: function() {
    if (papers.is("loading")) {
      return false;
    }
  },

  onzoomin: function( event, from, to, d ) {
    if (d !== undefined) {
      this.zoom(d);
    }
    this.initMouseListeners();
    papers.zoom();
    headstart.initClickListenersForNav();
  }
};


StateMachine.create({

  target: BubblesFSM.prototype,

  events: [
    { name: "startup",   from: "none",    to: "x" },
    { name: "start",     from: "x",       to: "zoomedout"  },

    { name: "mouseover", from: "zoomedout",  to: "hoversmall" },
    { name: "mouseout",  from: "hoversmall", to: "zoomedout"  },

    { name: "mouseover", from: "zoomedin",   to: "hoverbig"   },
    { name: "mouseout",  from: "hoverbig",   to: "zoomedin"   },

    { name: "zoomin",    from: ["hoversmall", "hoverbig"], to: "hoverbig" },
    { name: "zoomin",    from: "zoomedout",   to: "zoomedin"  },

    // due to mouse not being on circle if zoomed in
    { name: "mouseout",  from: "zoomedin",   to: "zoomedin" },
    { name: "mouseover", from: "hoversmall", to: "hoversmall" },
    { name: "zoomout",   from: "hoverbig",   to: "zoomedout" },

    // is ignored
    { name: "zoomout", from: "zoomedout",    to: "zoomedout" },
    { name: "zoomout", from: "hoversmall",   to: "hoversmall" },
    // for the mouseout hack
    { name: "mouseout", from: "zoomedout",   to: "zoomedout" }
  ]

});

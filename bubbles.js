// StateMachine for Bubbles UI elements in Headstart
// Filename: bubbles.js

BubblesFSM = function() {
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
    bubbleFrames.append("circle").attr("class", "area");
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
        
        if(headstart.content_based == false) {
          d.readers = +d.readers;
        } else {
          d.readers = 1;
        }
        d.paper_selected = false;

        // convert authors to "[first name] [last name]"
        var authors = d.authors.split(";");
        var authors_string = "";
        for(var i=0; i<authors.length-1; i++) {
          var names = authors[i].split(",");
          
          if(names.length > 1)
            authors_string += names[1] + " " + names[0];
          else
              authors_string += names[0];
          
          if(i != authors.length-2)
            authors_string += ", ";
        }

        d.authors = authors_string;
      });

      headstart.chart_x.domain(d3.extent(init_data, function(d) { return d.x }));
      headstart.chart_y.domain(d3.extent(init_data, function(d) { return d.y*-1 }));
      headstart.diameter_size.domain(d3.extent(init_data, function(d) { return d.readers }));

      var areas = this.areas;
      init_data.forEach(function(d) {

        // construct rectangles of a golden cut
        d.diameter = headstart.diameter_size(d.readers);

        d.width = headstart.paper_width_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.height = headstart.paper_height_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);

        // scale x and y
        d.x = headstart.chart_x(d.x);
        d.y = headstart.chart_y(d.y*-1);


        if(d.area in areas) {
          areas[d.area].papers.push(d);
        } else {
          areas[d.area] = {};
          areas[d.area].papers = [d];
        }

        d.resized = false;
      });
      
      if(typeof highlight_data != 'undefined') {
        if(highlight_data["bookmarks"] != null) {        
          highlight_data["bookmarks"].forEach(function(d) {

            var index = init_data.filter(function (x) { 
              return x.id == d.contentID 
            });

            if(index.length > 0) {
              index[0].bookmarked = 1;
            }
          });
        }
        
        if(highlight_data["recommendations"] != null) {        
          highlight_data["recommendations"].forEach(function(d) {

            var index = init_data.filter(function (x) { 
              return x.id == d.contentID 
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
          if (d != null)
              return x.title == d.area
          else
              return null
      })

      zoom(headstart.current_circle.data()[0]);
      d3.event.stopPropagation(); // click stopps, "event bubbles up"
  },

  // initialize mouseover, mouseout circle listeners
  initCircleListeners: function() {
    var this_bubble = this;
    d3.selectAll("circle").on("mouseover", function(d) {
      if (!this_bubble.is("hoverbig")){
        this_bubble.mouseover(this, d);
      }
    }).on("mouseout", function(d) {
      this_bubble.mouseout(this, d);
    });

    if (headstart.is("normal") || headstart.is("switchfiles"))
      this.initCircleClickListener();
  },

  // initialize just the circle click listeners
  initCircleClickListener: function() {
    var b = this;
    d3.selectAll( "circle" ).on("click", function(d) {
      b.zoomin(d);
    });
  },

  // initialize just the mousemovement listeners
  initMouseListenersForTitles: function() {
    d3.selectAll( "#area_title" ).on( "mouseover", function(d) {
      if(headstart.current != "timeline")
        headstart.bubbles[headstart.current_file_number].hideCircle(this);
      else {
        
        var underlying_circle =  d3.selectAll("circle")
          .filter(function (x) {
              if (d != null)
                  return x.title == d.title
              else
                  return null
          })

        headstart.bubbles[headstart.current_file_number].resetCircleDesignTimeLine(underlying_circle[0][0]);
        headstart.bubbles[headstart.current_file_number].highlightAllCirclesWithLike(underlying_circle[0][0]);
        headstart.bubbles[headstart.current_file_number].drawConnectionLines(underlying_circle[0][0]);
      }
    });

    d3.selectAll( "#area_title" ).on( "mouseout", function(d) {
      if(headstart.current != "timeline")
        headstart.bubbles[headstart.current_file_number].showCircle(this);
    });
  },

  // hide a cirlce
  hideCircle:  function( circle ) {
    var circle_element = circle.parentNode.parentNode.parentNode.firstChild;
    d3.select(circle_element).style('opacity', 0.25);
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
        .attr("class", "connection")
        .attr("style", "stroke:rgb(255,0,0);stroke-width:2");
    }
  },

  // sorts circles by left coords in ascending order
  // NOTE: there is probably a much better way of doing this, but it works for
  // now
  sortCircles: function(circles) {
    // first push all left values into array
    var left_values = [];
    for (var i=0; i<circles.length; i++) {
      left_values.push(circles[i].getBoundingClientRect().left);
    }
    // then sort these left_values
    left_values.sort(function(a,b){ return a-b });

    var sorted_circles = [];
    // now go through the sorted values and when we find the value in the
    // original circles array, put it in sorted_circles
    for (var i=0; i<circles.length; i++) {
      for (var j=0; j<circles.length; j++) {
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
    var papers = d3.selectAll(".paper").filter(function (x, i) {
      return (x.area === d.title)
    });

    for (var i = 0; i < papers[0].length; i++) {
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
  // max_chart_size
  positionBubbles2: function( bubbles, bubbles_id ) {
    bubbles.attr("transform", function (d) {
      var x_pos = d.x + ((bubbles_id-1) * headstart.max_chart_size);
      return "translate(" + x_pos + "," + d.y + ")";
    });
  },

  // set the title size of bubbles to px
  adjustBubbleTitleSizeTo: function( bubbles, px ) {
    if( headstart.max_chart_size < 720 ) {
      bubbles.selectAll("h2").style("font-size", px);
    }
  },

  // append the foreignObject to each of the bubbles
  //
  //      <foreignObject id="area_title_object"
  //                     x="-59.45975218530764"
  //                     y="-59.45975218530764"
  //                     width="118.91950437061529"
  //                     height="118.91950437061529"
  //                     style="visibility: visible;">
  appendForeignObjectTo: function( bubbles ) {
    bubbles.append( "foreignObject" )
      .attr("id", "area_title_object")
      .attr("x",      function (d) { return d.x_html })
      .attr("y",      function (d) { return d.y_html })
      .attr("width",  function (d) { return d.width_html })
      .attr("height", function (d) { return d.height_html })
      .append("xhtml:body")
      .append("div")
      .attr("id", "area_title")
      .style("width",  function (d) { return d.width_html + "px" })
      .style("height", function (d) { return d.height_html + "px" })
      .append("h2")
      .html(function (d) {
        return d.title
      });
  },

  // prepare the areas for the bubbles
  prepareAreas: function() {

    var areas = this.areas;
    var areas_array = this.areas_array;

    var readers = [];

    for(area in areas) {
      var papers = areas[area].papers;
      var sum_readers = d3.sum(papers, function(d) { return d.readers  });

      readers.push(sum_readers);
    }

    headstart.circle_size.domain(d3.extent(readers));
    var area_x = [];
    var area_y = [];

    for(area in areas) {
      var papers_2 = areas[area].papers;

      var mean_x = d3.mean(papers_2, function(d) { return d.x  });
      var mean_y = d3.mean(papers_2, function(d) { return d.y  });

      var sum_readers_2 = d3.sum(papers_2, function(d) { return d.readers  });

      areas[area].x = mean_x;
      areas[area].y = mean_y;
      area_x.push(mean_x);
      area_y.push(mean_y);
      areas[area].r = headstart.circle_size(sum_readers_2);
    }

    headstart.chart_x_circle.domain(d3.extent(area_x));
    headstart.chart_y_circle.domain(d3.extent(area_y));

    for (area in areas) {
      var new_area = [];
      new_area["title"] = area;
      new_area["x"] = headstart.chart_x_circle(areas[area].x);
      new_area["y"] = headstart.chart_y_circle(areas[area].y);
      new_area["r"] = areas[area].r;
      new_area["height_html"] = Math.sqrt(Math.pow(areas[area].r,2)*2);
      new_area["width_html"] = Math.sqrt(Math.pow(areas[area].r,2)*2);
      new_area["x_html"] = 0 - new_area["width_html"]/2;
      new_area["y_html"] = 0 - new_area["height_html"]/2;
      new_area["papers"] = areas[area].papers;
      areas_array.push(new_area);
    }
  },

  zoom: function(d, i) {

    headstart.is_zoomed = true;

    var previous_zoom_node = headstart.current_zoom_node;

    list.reset();

    if(typeof d != 'undefined') {
      list.papers_list.selectAll("#list_holder")
        .style("display", function (d) { return d.filtered_out?"none":"inline"});

      list.papers_list.selectAll("#list_holder")
        .filter(function (x, i) {
          return (x.area != d.title)
        })
      .style("display", "none");
    }

    d3.event.stopPropagation();

    if (previous_zoom_node != null && typeof previous_zoom_node != 'undefined') {

      if(typeof d != 'undefined') {
        if(d3.select(previous_zoom_node).data()[0].title == d.title) {
          return;
        }
      } else {
        resetList();

        list.papers_list.selectAll("#list_holder")
          .style("display", function (d) { return d.filtered_out?"none":"inline"});

        d3.event.stopPropagation();
        return;
      }
    }

    var zoom_node = headstart.chart.selectAll("circle")
      .filter(function (x, i) {
        if(d != null)
        return x.title == d.title;
        else
        return null;
      })

    headstart.current_zoom_node = zoom_node.node();

    if(headstart.current_zoom_node != null)
      toFront(headstart.current_zoom_node.parentNode);

    if(previous_zoom_node !== null) {
      toBack(previous_zoom_node.parentNode);
    }


    this.bringPapersToFront( d );

    zoom_node.on("mouseover", null)
      .on("mouseout", null);

    headstart.chart.selectAll("circle")
      .attr("class", "zoom_selected")
      .style("fill-opacity", "1")

      headstart.chart.selectAll("circle")
      .filter(function (x, i) {
        if(d != null)
        return (x.title != d.title)
        else
        return null
      })
    .attr("class", "zoom_unselected")
      .style("fill-opacity", 0.1)
      .on("mouseover", null)
      .on("mouseout", null)

      d3.select("#subdiscipline_title h1").text("Area: " + d.title);

    d3.selectAll("div.paper_holder")
      .on("mouseover", papers.enlargePaper);

    d3.selectAll("circle")
      .on("click", function(d) {
        return bubbles.zoom(d);
      })
    .style("display", "block");

    zoom_node.style("display", "block");

    d3.selectAll(".paper")
        .style("display", function (d) { return d.filtered_out?"none":"block"})

      d3.selectAll(".paper")
      .filter(function (x, i) {
        return (x.area != d.title)
      })
    .style("display", "none");

    d3.selectAll("path.region")
      .style("fill-opacity", 1)

      headstart.circle_zoom = headstart.circle_zoom_factor / d.r / 2;
    headstart.x.domain([d.x - d.r, d.x + d.r]);
    headstart.y.domain([d.y - d.r, d.y + d.r]);

    var t = headstart.chart.transition()
      .duration(headstart.transition_duration);

    headstart.bubbles[headstart.current_file_number].createTransition(t, d.title);

    headstart.recordAction(d.id, "zoom_in", "herecomestheuser", "herecomesthestatusoftheitem", null);

    d3.event.stopPropagation();
  },

  zoomOut: function() {

    if (!headstart.is_zoomed) {
      return;
    }

    if (papers.is("loading")) {
      return;
    }

    headstart.is_zoomed = false;

    list.reset();

    if (headstart.current_zoom_node !== null) {
      toFront(headstart.current_zoom_node.parentNode);
      
      var circle_data = d3.select(headstart.current_zoom_node).data();
      headstart.recordAction(circle_data.id, "zoom_out", "herecomestheuser", "herecomesthestatusoftheitem", null);
    } else {
      headstart.recordAction("none", "zoom_out", "herecomestheuser", "herecomesthestatusoftheitem", null);
    }

    if (headstart.current_enlarged_paper !== null) {
      headstart.current_enlarged_paper.paper_selected = false;
      headstart.current_enlarged_paper = null;
    }

    list.papers_list.selectAll("#list_holder")
      .style("display", function (d) { return d.filtered_out?"none":"inline"});

    var t = headstart.chart.transition()
      .duration(headstart.transition_duration)
      .each('end', function (d) {
        headstart.chart.selectAll("#area_title_object")
        .style("display", "block")
        .style("visibility", "visible");
      });

    t.selectAll("g.paper")//.each(function(d, i) {
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y +")";
      })

    t.selectAll("path.region")
      .attr("d", function (d) {
        return papers.createPaperPath(0, 0, d.width, d.height)
      });

    t.selectAll("path.dogear")
      .attr("d", function (d) {
        return papers.createDogearPath(d.width*(1-headstart.dogear_width), 0, d.width, d.height);
      });

    //webkit bug
    t.selectAll("#article_metadata")
      .attr("width", function (d) { return d.width })
      .attr("height", function (d) { return d.height })

      t.selectAll("div.metadata")
      .style("width", function (d) {
        return d.width * (1-headstart.dogear_width) + "px"
      })
    .style("height", function (d) {
      return (headstart.content_based)?(d.height):(d.height * 0.8 + "px")
    });

    t.selectAll("div.readers")
      .style("height", function (d) {
        return d.height * 0.2 + "px"
      })
    .style("width", function (d) {
      return d.width + "px"
    })
    .style("margin-top", "0px");


    t.selectAll("p")
      .attr("class", "");

    t.selectAll("span.readers_entity")
      .style("font-size", "8px");

    popup.drawInfoLinkWithTitle( "What's this?" );
    popup.drawTimeLineLink();
    popup.drawDropdown();


    d3.selectAll(".paper")
      .style("display", function(d) { return d.filtered_out?"none":"block"});

    this.resetCirclePosition(t);

    this.initCircleClickListener();

    var circles = d3.selectAll("g.bubble_frame");

    for (var i = 0; i < circles[0].length; i++) {
      var current_node = circles[0][i];
      toFront(current_node);
    }

    d3.selectAll("div.paper_holder")
      .on("mouseover", null)
      .on("mouseout", null)
      .style("cursor", "default");

    papers.initPaperClickHandler();

    headstart.current_zoom_node = null;
  },

  resetCircleDesignTimeLine: function( circle ) {
      var class_name = $(circle).attr("class").replace("area ", "");
      
      d3.selectAll("circle")
              .style("fill" , "rgb(210, 228, 240)")
              .style("fill-opacity" , "0.8");

      d3.selectAll("#area_title_object").style("visibility", "visible");
  },

  resetCircleDesign: function() {
    if(headstart.current_circle != null) {
      d3.selectAll("circle")
        .attr("class", "area")
        .style("fill-opacity", "0.8");

      var papers = d3.selectAll(".paper")
        .filter(function (x) {
          if (headstart.current_circle.data()[0] != null) {
            var area = headstart.current_circle.data()[0].title;
            return x.area == area;
          }
          else {
            return null
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
    if(typeof(obj) === "undefined")
      obj = d3;

    obj.selectAll("circle")
      .style("fill-opacity", "0.8")
      .attr("r", function(d) { return d.r; })
      .attr("cx", 0)
      .attr("cy", 0)
  },

  // on zoom IN
  createTransition: function(t, zoom_area) {

    var zoom_node_t =
      t.selectAll("circle")
      .filter(function (x, i) {
        return (x.title == zoom_area)
      });

    t.selectAll("#area_title_object")
      .style("display", "none");

    t.selectAll("circle")
      .attr("cx", function(d) {
        return headstart.x(d.x) - d.x;
      })
    .attr("cy", function(d) {
      return headstart.y(d.y) - d.y;
    })
    .attr("r", function(d) {
      return headstart.circle_zoom * d.r;
    });

    t.selectAll("g.paper")
      .attr("transform", function (g) {
        return "translate(" + headstart.x(g.x) + "," + headstart.y(g.y) + ")";
      });

    var region = function(d) {
      return papers.createPaperPath(0, 0, d.width*headstart.circle_zoom, d.height*headstart.circle_zoom)
    }

    var dogear = function(d) {
      return papers.createDogearPath(d.width*(1-headstart.dogear_width)*headstart.circle_zoom,
          0, d.width*headstart.circle_zoom, d.height*headstart.circle_zoom);
    }

    t.selectAll("path.region")
      .attr("d", region)

      t.selectAll("path.dogear")
      .attr("d", dogear);

    //webkit bug
    t.selectAll("#article_metadata")
      .attr("width", function (d) {
        return d.width * headstart.circle_zoom
      })
    .attr("height", function (d) {
      return d.height * headstart.circle_zoom
    });

    t.selectAll("div.metadata")
      .style("height", function (d) {
        return (headstart.content_based)?(d.height * headstart.circle_zoom + "px"):(d.height * headstart.circle_zoom - 20 + "px");
      })
    .style("width", function (d) {
      return d.width * headstart.circle_zoom * (1-headstart.dogear_width) + "px";
    });

    t.selectAll("div.readers")
      .style("height", "15px")
      .style("width", function (d) {
        return d.width * headstart.circle_zoom + "px";
      })
    .style("margin-top", "3px");

    t.selectAll("p")
      .attr("class", "large")

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
      
      headstart.recordAction("none", "start", "herecomestheuser", "start_bubble", null, null, recommendation_data);
  },

  onbeforemouseover: function( event, from, to, circle, d ) {
     if (headstart.is("normal") || headstart.is("switchfiles")) {
       this.resetCircleDesign();
     }
  },

  onmouseover: function( event, from, to, circle, d ) {
      
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
      d3.selectAll("path.region").style("fill-opacity", 1);
    }


  },

  // if the user hovers over a paper inside of a bubble,
  // we want to prevent the bubbles from switching from
  // hoversmall.
  onbeforemouseout: function( event, from, to, circle, d ) {
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

  onmouseout: function( event, from, to, circle, d ) {
      
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

  onzoomout: function( event, from, to ) {
    this.resetCircleDesign();
    papers.zoomout();
    popup.initClickListenersForNav();
  },

  // we only whant to be able to "zoom" when the papers are
  // ready
  onbeforezoomin: function( event, from, to ) {
    if (papers.is("loading"))
      return false;
  },

  onzoomin: function( event, from, to, d ) {
    if (d !== undefined) {
      this.zoom(d);
    }
    this.initMouseListeners();
    papers.zoom();
    popup.initClickListenersForNav();
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


// just a wrapper to avoid confusing function call
function hideSibling( circle ) {
  d3.select(circle.nextSibling).style("visibility", "hidden");
}

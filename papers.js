// StateMachine for Papers UI element in Headstart
// Filename: papers_count.js

var papers = StateMachine.create({

    events: [
        // when the application starts, we go into loading state,
        // until the directed force layout for the papers is ready.
        { name: "start",     from: "none",     to: "loading"  },
        { name: "forced",    from: "loading",  to: "ready"    },

        // user might have the mouse on bubble while loading
        // so we first go to ready state and on leaving the bubble
        // we go to behindbubble.
        { name: "mouseout",  from: "ready",    to: "behindbubble" },
        { name: "mouseover", from: "ready",    to: "infrontofbubble" },
        { name: "zoom",      from: "ready",    to: "infrontofbigbubble" },

        // user moves mouse out of a bubble, the papers are hidden
        // user moves mouse inside of a bubble, papers move to front
        { name: "mouseout",  from: "infrontofbubble", to: "behindbubble" },
        { name: "mouseover", from: "behindbubble",    to: "infrontofbubble" },

        // user clicks on a bubble or paper (inside that bubble)
        { name: "zoom",      from: "infrontofbubble", to: "infrontofbigbubble" },

        // user moves mouse out of big bubble
        { name: "mouseout",  from: "infrontofbigbubble", to: "behindbigbubble" },
        { name: "mouseover", from: "behindbigbubble", to: "infrontofbigbubble" },
        { name: "zoomout",   from: "behindbigbubble", to: "behindbubble" },

        { name: "mouseoutpaper",  from: "enlarged", to: "infrontofbigbubble" },
        { name: "mouseoverpaper", from: "infrontofbigbubble", to: "enlarged" },
        { name: "mouseoverpaper", from: "enlarged", to: "enlarged" },
        // user clicks in list on a paper
        { name: "mouseoverpaper", from: "ready", to: "infrontofbigbubble" },
        { name: "mouseoverpaper", from: "behindbubble", to: "infrontofbigbubble" },

        // if clicked on paper while not ready
        // catch it in onbeforeclick
        { name: "click", from: "loading", to: "loading" },
        { name: "click", from: "infrontofbubble", to: "infrontofbigbubble" },

        // if user leaves chart with mouse
        { name: "mouseout", from: "behindbubble", to: "behindbubble" },
        { name: "mouseout", from: "behindbigbubble", to: "behindbigbubble" },

        { name: "zoomout", from: "infrontofbigbubble", to: "behindbubble" },

        // is ignored
        { name: "click", from: "ready", to: "ready" },
        { name: "zoomout", from: "ready", to: "ready" },
        { name: "zoomout", from: "loading", to: "loading" },
        { name: "zoomout", from: "behindbubble", to: "behindbubble" },
        { name: "mouseoutpaper",  from: "infrontofbigbubble", to: "infrontofbigbubble" },
        { name: "zoom",      from: "behindbubble", to: "infrontofbigbubble" },
        // if user clicks inside bigbubble we just ignore it for now
        { name: "zoom",      from: "infrontofbigbubble", to: "infrontofbigbubble" }

    ],

    callbacks: {
        onstart: function( event, from, to, bubbles ) {
          this.force_stopped = false;
          this.drawPapers( bubbles );
          this.applyForce( bubbles );
          this.initPaperClickHandler();
        },

        onbeforeclick: function( event, from, to ) {
          if (this.is("loading"))
            return false;
        },

        onclick: function( event, from, to, d ) {
          if(!headstart.is_zoomed) {
            return bubbles.makePaperClickable(d);
          }
        },

        onforced: function( event, from, to ) {
          papers.force_stopped = true;
        },

        onbeforemouseout: function( event, from, to, d, holder_div ) {
          if (holder_div !== undefined){
            return false;
          }
        },

        onmouseoutpaper: function( event, from, to, d, holder_div ) {
          this.shrinkPaper(d, holder_div);
        },

        onmouseout: function( event, from, to, d, holder_div ) {
          if (holder_div !== undefined)
            this.shrinkPaper(d, holder_div);

          headstart.bubbles[headstart.current_file_number].mouseout();
        }

    }
});

papers.drawPapers = function( bubbles ) {

   var nodes = headstart.chart.data(bubbles.data).selectAll("g.node")
               .data(bubbles.data)
               .enter().append("g")
               .attr("class", "paper")
               .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

    this.drawPaperPath(nodes);
    this.drawDogEarPath(nodes);

    var xhtml = this.prepareForeignObject(nodes);
    this.populatePapersWithMetaData(xhtml);
}

// draw the path "around" the papers, perhaps "border" would be a better name
papers.drawPaperPath = function(nodes) {
  var region = function(d) {
    return papers.createPaperPath(0, 0, d.width, d.height, 0.2, 0.2);
  }

  nodes.append("path")
    .attr("class", "region")
    .attr("d", region);
}

// draw the path of the dog-ear for the papers
papers.drawDogEarPath = function(nodes) {
  var dogear = function(d) {
    return papers.createDogearPath(d.width*0.8, 0, d.width, d.height, 0.2, 0.2);
  }

  nodes.append("path")
    .attr("class", "dogear")
    .attr("d", dogear);
}

// if the user clicks on the paper inside of a bubble,
// it should zoom in. (behave same way when, only the bubble is clicked)
papers.initPaperClickHandler = function() {
  d3.selectAll(".paper_holder").on( "click", function(d) {
    if (!papers.is("loading")) {
        if(!headstart.is_zoomed) {
            var current_node = headstart.chart.selectAll("circle")
            .filter(function (x) {
                if (d != null)
                    return x.title == d.area
                else
                    return null
            })
            
            d3.event.stopPropagation();
            headstart.bubbles[headstart.current_file_number].zoomin(current_node.data()[0]);
        }

        
    }
  });
}

// add #id element to foreignObject and adjust various other attributes
// <foreignObject id="article_metadata"
//                width="28.03096927844192px"
//                height="37.37462570458923px
// <body><div class="paper_holder" style="cursor: default;">
papers.prepareForeignObject = function( nodes ){
    var xhtml =
        nodes.append("foreignObject")
            .attr("id", "article_metadata")
            .attr("width", function (d) { return d.width + "px"  })
            .attr("height", function (d) { return d.height + "px" })
           .append("xhtml:body")
           .append("div")
            .attr("class", "paper_holder")
            .style("cursor", "default");
    return xhtml;
}

// add metadata to papers, consisting of
// Title, Details, PublicationYear, Readers
// <div class="metadata"
// style="height: 29.899700563671384px;
// width: 22.424775422753537px;">
papers.populatePapersWithMetaData = function( xhtml ) {
    var metadata = this.appendMetaDataCSSClass(xhtml);
    this.appendMetaDataTitle(metadata);
    this.appendMetaDataDetails(metadata);
    this.appendMetaDataPublicationYear(metadata);
    this.appendMetaDataReaders(xhtml);
}

papers.appendMetaDataCSSClass = function(xhtml) {
 return xhtml.append("div")
             .attr("class", "metadata")
             .style("height", function (d) { return d.height * 0.8 + "px" })
             .style("width",  function (d) { return d.width  * 0.8 + "px" });
}

papers.appendMetaDataTitle = function(metadata) {
  metadata.append("p")
    .attr("id", "title")
    .html(function (d) {  return d.title+"<br>" })
}

papers.appendMetaDataDetails = function(metadata) {
  metadata.append("p")
    .attr("id", "details")
    .html(function (d) { return d.authors })
}

papers.appendMetaDataPublicationYear = function(metadata) {
  metadata.append("p")
    .attr("id", "in")
    .html("in ")
    .append("span")
    .attr("class", "pubyear")
    .html(function (d) { return d.published_in + " (" + d.year + ")" });
}

papers.appendMetaDataReaders = function(xhtml) {
  xhtml.append("div")
    .attr("class", "readers")
    .append("p")
    .attr("id", "readers")
    .html(function (d) { return d.readers })
    .append("span")
    .attr("class", "readers_entity")
    .html(" readers");
}

// create the path or "border" for papers
papers.createPaperPath = function(x, y, width, height, correction_x, correction_y) {

    if (!correction_x)
        correction_x = headstart.dogear_width;

    if (!correction_y)
        correction_y = headstart.dogear_height;

    var h = width * (1 - correction_x);
    var l = width * correction_x;
    var v = height * (1 - correction_y);

    var path = "M " + x + " " + y + " h " + h + " l " + l +  " "
               + (height * correction_y)
               +  " v " + v +  " h " + (-1 * width) +  " v " + (-1 * height);

    return path;
}

papers.applyForce = function( bubbles ) {

    headstart.force_papers.start();
    var papers_count = 0;

    headstart.force_papers.on("tick", function(e) {
        var alpha = e.alpha;

        bubbles.data.forEach(function(a, i) {
            var current_area = "";

            for (area in bubbles.areas_array) {
                if (bubbles.areas_array[area].title == a.area) {
                    current_area = bubbles.areas_array[area];
                    break;
                }
            }

            var paper_a = papers.constructCircle(a);

            var distance = Math.sqrt(
                Math.pow(current_area.x - paper_a.x, 2)
                + Math.pow(current_area.y - paper_a.y, 2)
                );

            if (distance > Math.abs(current_area.r - paper_a.r)) {
                paper_a.y += (current_area.y - paper_a.y) * alpha;
                paper_a.x += (current_area.x - paper_a.x) * alpha;
                a.x = paper_a.x - a.width/2;
                a.y = paper_a.y - a.height/2;
            }

            bubbles.data.slice(i + 1).forEach(function(b) {

                var paper_b = papers.constructCircle(b);

                papers.checkCollisions(paper_a, paper_b, alpha)

                a.x = paper_a.x - a.width/2;
                a.y = paper_a.y - a.height/2;
                b.x = paper_b.x - b.width/2;
                b.y = paper_b.y - b.height/2;
            });
        });

        papers.drawEntity("g.paper", alpha, papers_count);

        papers_count++;
    });

}

// construct circle around paper
papers.constructCircle = function( a ) {

    var paper_a = {};
    paper_a.x = a.x + a.width/2;
    paper_a.y = a.y + a.height/2;
    paper_a.r = (a.diameter/2)*1.2;

    return paper_a;
}

// figure out translate coordinates
papers.drawEntity = function( entity, alpha, count ) {

    if (   alpha > 0.09 && count % 2 == 0
        || alpha <= 0.09 && alpha >= 0.08 && count %  2 == 0
        || alpha <= 0.08 && alpha >= 0.07 && count %  4 == 0
        || alpha <= 0.07 && alpha >= 0.06 && count %  4 == 0
        || alpha <= 0.06 && alpha >= 0.05 && count %  6 == 0
        || alpha <= 0.05 && alpha >= 0.04 && count %  6 == 0
        || alpha <= 0.04 && alpha >= 0.03 && count %  8 == 0
        || alpha <= 0.03 && alpha >= 0.02 && count %  8 == 0
        || alpha <= 0.02 && alpha >= 0.01 && count %  10 == 0
        || alpha <= 0.01 && count %  10 == 0 ) {

        headstart.chart.selectAll(entity)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

}


// test for collisions of papers, so they dont overlap
papers.checkCollisions = function(a, b, alpha) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var l = Math.sqrt(dx * dx + dy * dy);
    var d = a.r + b.r;

    if (l < d) {
        l = (l - d) / l * alpha;
        dx *= l;
        dy *= l;
        a.x -= dx;
        a.y -= dy;
        b.x += dx;
        b.y += dy;
    }
}

papers.shrinkPaper = function(d,holder) {

    if(!headstart.is_zoomed) {
      return;
    }

    var holder_div = holder ? holder : d3.select(this);

    papers.resizePaper(d, holder_div, 1, "rgb(255, 255, 255)", "0.25");

    holder_div.selectAll("p")
        .attr("class", "large");

    d.resized = false;

    holder_div.on("mouseover", papers.enlargePaper);
}

papers.resizePaper = function(d, holder_div, resize_factor, color, opacity) {

    var current_div = holder_div.node()
        ,current_foreignObject = current_div.parentNode.parentNode
        ,current_g = current_foreignObject.parentNode
        ,current_path = current_g.firstChild
        ,current_dogear = current_g.childNodes[1];

    //current_g.parentNode.appendChild(current_g);
    toFront(current_g);

    var region = papers.createPaperPath(0, 0, d.width*headstart.circle_zoom*resize_factor, d.height*headstart.circle_zoom*resize_factor);

    var dogear = papers.createDogearPath(d.width*(1-headstart.dogear_width)*headstart.circle_zoom*resize_factor, 0, d.width*headstart.circle_zoom*resize_factor, d.height*headstart.circle_zoom*resize_factor);

    d3.select(current_foreignObject)
        .attr("width", d.width * headstart.circle_zoom * resize_factor + "px")
        .attr("height", d.height * headstart.circle_zoom * resize_factor + "px")
        .style("width", d.width * headstart.circle_zoom * resize_factor + "px")
        .style("height", d.height * headstart.circle_zoom * resize_factor + "px")

    d3.select(current_path)
        //.style("fill-opacity", opacity)
        .style("fill", color)
        .attr("d", region)

    d3.select(current_dogear)
        .attr("d", dogear);

    holder_div.select("div.metadata")
        .attr("height", d.height * headstart.circle_zoom * resize_factor - 20 + "px")
        .attr("width", d.width * headstart.circle_zoom * resize_factor * (1-headstart.dogear_width) + "px")
        .style("height", d.height * headstart.circle_zoom * resize_factor - 20 + "px")
        .style("width", d.width * headstart.circle_zoom * resize_factor * (1-headstart.dogear_width) + "px")

    holder_div.select("div.readers")
        .style("width", d.width * headstart.circle_zoom * resize_factor + "px");

}


// called far too often
papers.enlargePaper = function(d,i) {

    papers.mouseoverpaper();


    if(d.resized || !headstart.is_zoomed) {
        return;
    }
    
    headstart.recordAction(d.id, "enlarge_paper", "herecomestheuser", "herecomesthestatusoftheitem", null);
 
   var resize_factor = 1.2;

    var holder_div = d3.select(this);

    holder_div.selectAll("p")
        .attr("class", "larger");

    var metadata = holder_div.select("div.metadata");

    if(metadata.node().offsetHeight < metadata.node().scrollHeight) {
        resize_factor = papers.calcResizeFactor(metadata);
    }

    papers.resizePaper(d, holder_div, resize_factor, "rgb(255, 255, 255)", "1");

    holder_div
    //.style("overflow-y", "scroll")
        .style("cursor", "pointer")
        .on("click", function (d) {

            if(!headstart.is_zoomed) {
                return bubbles.makePaperClickable(d);
            } else {

                if(!d.paper_selected) {

                    list.enlargeListItem(d);

                    if(list.current = "hidden") {
                        list.show();
                    }
                }

                d.paper_selected = true;
                headstart.current_enlarged_paper = d;
                d3.event.stopPropagation();
            }
        })
    .on("mouseout", function (d) {
        papers.mouseoutpaper(d, holder_div);
    });

    headstart.current_circle = headstart.chart.selectAll("circle")
        .filter(function (x, i) {
            return (x.title == d.area)
        });

    headstart.current_circle
        .on("click", function (d) {

            list.reset();

            d3.selectAll("#list_holder")
            .filter(function (x, i) {
                return (x.area == d.title)
            })
            .style("display", function (d) { return d.filtered_out?"none":"inline"});

            if(headstart.current_enlarged_paper != null)
                headstart.current_enlarged_paper.paper_selected = false;

            headstart.current_enlarged_paper = null;

            headstart.recordAction(d.id, "click_paper_list_enlarge", "herecomestheuser", "herecomesthestatusoftheitem", null);

            d3.event.stopPropagation();
        });

    d.resized = true;
}

papers.populateOverlay = function(d) {
    paper_frame
    .style("display","block")

    loadAndAppendImage("images/" + d.id + "/page_1.png", 1);

    var images_finished = false;
    var counter = 2;

    while(!images_finished) {
        var image_src = "images/" + d.id + "/page_" + counter + ".png";

        if (!loadAndAppendImage(image_src, counter)) {
            images_finished = true;
        }

        counter++;
    }
}

papers.calcResizeFactor = function(metadata) {
    var current_paper = metadata.node();
    var new_height = current_paper.scrollHeight;
    var new_width = current_paper.offsetWidth;

    var ratio_old = headstart.paper_width_factor/headstart.paper_height_factor;
    var ratio_new = new_height/new_width;

    while(ratio_new.toFixed(1) > ratio_old.toFixed(1)) {
        new_height -= Math.pow(headstart.paper_height_factor,3);
        new_width += Math.pow(headstart.paper_width_factor,3);
        ratio_new = new_height/new_width;
    }

    return new_width/current_paper.offsetWidth;
}

// creates the dog-ears path for the papers
papers.createDogearPath = function(x, y, width, height, correction_x, correction_y) {

    if (!correction_x)
        correction_x = headstart.dogear_width;

    if (!correction_y)
        correction_y = headstart.dogear_height;

    var v = height * correction_x;
    var h = width * correction_y;

    var path = "M " + x + " " + y + " v " + v + " h " + h;

    return path;
}

function toBack(node) {
    node.parentNode.insertBefore(node, node.parentNode.childNodes[1]);
}

function toFront(node) {
    node.parentNode.appendChild(node);
}


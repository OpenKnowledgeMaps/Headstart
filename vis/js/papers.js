// StateMachine for Papers UI element in Headstart
// Filename: papers_count.js
import StateMachine from 'javascript-state-machine';

import 'hypher';
import 'lib/en.js';

import config from 'config';
import { mediator } from 'mediator';
import { toFront } from 'helpers';
import { canvas } from 'canvas';

const paperTemplate = require("templates/map/paper.handlebars");

export const papers = StateMachine.create({

    events: [
        // when the application starts, we go into loading state,
        // until the directed force layout for the papers is ready.
        {name: "start", from: "none", to: "loading"},
        {name: "forced", from: "loading", to: "ready"},

        // user might have the mouse on bubble while loading
        // so we first go to ready state and on leaving the bubble
        // we go to behindbubble.
        {name: "mouseout", from: "ready", to: "behindbubble"},
        {name: "mouseover", from: "ready", to: "infrontofbubble"},
        {name: "zoom", from: "ready", to: "infrontofbigbubble"},

        // user moves mouse out of a bubble, the papers are hidden
        // user moves mouse inside of a bubble, papers move to front
        {name: "mouseout", from: "infrontofbubble", to: "behindbubble"},
        {name: "mouseover", from: "behindbubble", to: "infrontofbubble"},

        // user clicks on a bubble or paper (inside that bubble)
        {name: "zoom", from: "infrontofbubble", to: "infrontofbigbubble"},
        {name: "zoom", from: "enlarged", to: "infrontofbigbubble"},

        // user moves mouse out of big bubble
        {name: "mouseout", from: "infrontofbigbubble", to: "behindbigbubble"},
        {name: "mouseover", from: "behindbigbubble", to: "infrontofbigbubble"},
        {name: "zoomout", from: "behindbigbubble", to: "behindbubble"},
        {name: "zoomout", from: "enlarged", to: "behindbubble"},

        {name: "mouseoutpaper", from: "enlarged", to: "infrontofbigbubble"},
        {name: "mouseoverpaper", from: "infrontofbigbubble", to: "enlarged"},
        {name: "mouseoverpaper", from: "enlarged", to: "enlarged"},
        // user clicks in list on a paper
        {name: "mouseoverpaper", from: "ready", to: "infrontofbigbubble"},
        {name: "mouseoverpaper", from: "behindbubble", to: "infrontofbigbubble"},

        // if clicked on paper while not ready
        // catch it in onbeforeclick
        {name: "click", from: "loading", to: "loading"},
        {name: "click", from: "infrontofbubble", to: "infrontofbigbubble"},

        // if user leaves chart with mouse
        {name: "mouseout", from: "behindbubble", to: "behindbubble"},
        {name: "mouseout", from: "behindbigbubble", to: "behindbigbubble"},

        {name: "zoomout", from: "infrontofbigbubble", to: "behindbubble"},

        // is ignored
        {name: "click", from: "ready", to: "ready"},
        {name: "zoomout", from: "ready", to: "ready"},
        {name: "zoomout", from: "loading", to: "loading"},
        {name: "zoomout", from: "behindbubble", to: "behindbubble"},
        {name: "mouseoutpaper", from: "infrontofbigbubble", to: "infrontofbigbubble"},
        {name: "zoom", from: "behindbubble", to: "infrontofbigbubble"},
        // if user clicks inside bigbubble we just ignore it for now
        {name: "zoom", from: "infrontofbigbubble", to: "infrontofbigbubble"}

    ],

    callbacks: {
        onstart: function (event, from, to) {
            this.force_stopped = false;
            this.drawPapers();
            this.applyForce();
            this.initPaperClickHandler();
        },

        onleaveloading: function() {
            mediator.publish("papers_leave_loading");
        },

        onbeforeclick: function () {
            if (this.is("loading")) {
                return false;
            }
        },

        onclick: function (event, from, to, d) {
            if (!mediator.is_zoomed) {
                return mediator.bubbles.makePaperClickable(d);
            }
        },

        onforced: function () {
            this.force_stopped = true;
        },

        onbeforemouseout: function (event, from, to, d, holder_div) {
            if (holder_div !== undefined) {
                return false;
            }
        },

        onmouseoutpaper: function (event, from, to, d, holder_div) {
            this.shrinkPaper(d, holder_div);
        },

        onmouseout: function (event, from, to, d, holder_div) {
            if (holder_div !== undefined) {
                this.shrinkPaper(d, holder_div);
            }

            mediator.current_bubble.mouseout();
        }

    }
});

papers.drawPapers = function () {
    var nodes = canvas.chart.selectAll("g.node")
            .data(mediator.current_bubble.data)
            .enter().append("g")
            .attr("class", "paper")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

    this.drawPaperPath(nodes);
    this.drawDogEarPath(nodes);

    this.prepareForeignObject(nodes);
    
    let article_metadata = d3.selectAll("#article_metadata");

    article_metadata.select(".paper_holder").select(".metadata");
    var readers = article_metadata.select(".readers");
    
    if (config.content_based) {
        readers.style("display", "none");
    }
    
    article_metadata.select("#icons")
            .style("height", function (d) {
                if(d.oa === true) {
                    return "20px";
                }
            });
    
    article_metadata.select("#open-access-logo")
            .style("display", function (d) {
                if(d.oa === false) {
                    return "none";
                }
            });
    
    article_metadata.select("#file-icon_paper")
        .style("display", function (d) {
            if (d.resulttype !== "publication") {
                return "none"
            }
        });

    article_metadata.select("#dataset-icon_paper")
        .style("display", function (d) {
            if (d.resulttype !== "dataset") {
                return "none"
            }
        });
    
    article_metadata.select("#outlink")
            .style("display", function (d) {
                if(d.oa === false) {
                    return "none";
                }
            });
    
};

// draw the path "around" the papers, perhaps "border" would be a better name
papers.drawPaperPath = function (nodes) {
    var region = (d) => {
            return this.createPaperPath(0, 0, d.width, d.height, 0.2, 0.2, d.resulttype);
    };

    nodes.append("path")
            .attr("id", "region")
            .attr("d", region); 

    this.resetPaths();
};

papers.resetPaths = function () {
    // this seems illogical but has to be this way because
    // the is_zoomed flag is set after this is executed
    const zoomedClass = mediator.is_zoomed ? "" : " zoomed_in";
    d3.selectAll("path#region")
            .attr("class", function (d) {
                if (d.bookmarked) {
                    return "framed_bookmarked" + zoomedClass;
                } else if (d.recommended) {
                    return "framed_recommended" + zoomedClass;
                } else {
                    return "unframed" + zoomedClass;
                }
            });
};

// draw the path of the dog-ear for the papers
papers.drawDogEarPath = function (nodes) {
    var dogear = (d) => {
        return this.createDogearPath(d.width * 0.8, 0, d.width, d.height, 0.2, 0.2, d.resulttype);
    };

    nodes.append("path")
            .attr("class", "dogear")
            .attr("d", dogear);
};

// if the user clicks on the paper inside of a bubble,
// it should zoom in. (behave same way when, only the bubble is clicked)
papers.initPaperClickHandler = function () {
    d3.selectAll(".paper_holder").on("click", function (d) {
        mediator.publish("paper_click", d);
    });
};


papers.paper_click = function (d) {
    if (!this.is("loading")) {
        if (!mediator.is_zoomed) {
            var current_node = canvas.chart.selectAll("#headstart-chart circle")
                    .filter(function (x) {
                        if (d !== null) {
                            if (config.use_area_uri) {
                                return (x.area_uri == d.area_uri);
                            } else {
                                return (x.title == d.area);
                            }
                        } else {
                            return null;
                        }
                    });

            d3.event.stopPropagation();
            mediator.current_bubble.zoomin(current_node.data()[0]);
        }
    }
};


// add #id element to foreignObject and adjust various other attributes
papers.prepareForeignObject = function (nodes) {
    nodes.append("foreignObject")
            .attr({
                "id": "article_metadata",
                "width": function (d) {
                    return d.width + "px";
                },
                "height": function (d) {
                    return d.height + "px";
                }
            }).append("xhtml:body")
            .html(function (d) {
                return paperTemplate({
                    'metadata_height': (config.content_based) ? (d.height) : (d.height * 0.75),
                    'metadata_width': d.width * 0.8,
                    'd': d,
                    'base_unit': config.base_unit
                });
            });

    $(".metadata #title").hyphenate("en");
    $(".metadata #details").hyphenate("en");
    $(".metadata #in").hyphenate("en");
};


// create the path or "border" for papers
papers.createPaperPath = function (x, y, width, height, correction_x, correction_y, drawType) {

    if(drawType == "dataset") {
        return this.createDatasetPath(x, y, width, height, correction_x)
    }

    if (!correction_x) {
        correction_x = config.dogear_width;
    }

    if (!correction_y) {
        correction_y = config.dogear_height;
    }

    var h = width * (1 - correction_x);
    var l = width * correction_x;
    var v = height * (1 - correction_y);

    var path = "M " + x + " " + y + " h " + h + " l " + l + " " +
            (height * correction_y) +
            " v " + v + " h " + (-1 * width) + " v " + (-1 * height);

    return path;
};

// create the path or "border" for datasets
papers.createDatasetPath = function (x, y, width, height, correction) {
    let r = correction ? correction * 10 : 10
    let corner = correction ? correction * 10 : 10
    let x_left = corner
    let x_right = width - corner
    let y_bottom = height - corner
    let y_top = corner
    return `M ${x},${y_top} \
    A ${r},${r} 0 0,1 ${x_left},${0} \
    L ${x_right},${0} \
    A ${r},${r} 0 0,1 ${width},${y_top} \
    L ${width},${y_bottom} \
    A ${r},${r} 0 0,1 ${x_right},${height} \
    L ${x_left},${height} \
    A${r},${r} 0 0,1 ${0},${y_bottom} \
    L ${0},${y_top} Z`
};

papers.applyForce = function () {
    let self = this;

    canvas.force_areas.start();

    if (config.is_force_areas) {
        canvas.force_areas.alpha(config.area_force_alpha);
    } else {
        canvas.force_areas.alpha(0);
    }

    var areas_count = 0;
    var ticks_per_render_areas = 10;
    var multiplier_areas = ticks_per_render_areas+1;

    requestAnimationFrame(function render() {
        var alpha = canvas.force_areas.alpha();
        
        for (var i = 0; i < ticks_per_render_areas; i++) {
            canvas.force_areas.tick();
        }

        mediator.current_bubble.areas_array.forEach(function (a, i) {

            if (a.x - a.r < 0 ||
                    a.x + a.r > canvas.current_vis_size ||
                    a.y - a.r < 0 ||
                    a.y + a.r > canvas.current_vis_size) {

                a.x += (canvas.current_vis_size / 2 - a.x) * alpha * multiplier_areas;
                a.y += (canvas.current_vis_size / 2 - a.y) * alpha * multiplier_areas;
            }


            mediator.current_bubble.areas_array.slice(i + 1).forEach(function (b) {
                self.checkCollisions(a, b, alpha * multiplier_areas);
            });
        });

        self.drawEntity("g.bubble_frame", alpha, areas_count);

        areas_count++;
        
        if (alpha > 0) {
            requestAnimationFrame(render);
        } else {
            self.drawEntity("g.bubble_frame", alpha, areas_count, true);
        }

    });

    canvas.force_papers.start();

    if (config.is_force_papers) {
        canvas.force_papers.alpha(config.papers_force_alpha);
    } else {
        canvas.force_papers.alpha(0);
    }

    var papers_count = 0;
    var ticks_per_render_papers = 15;
    var multiplier_areas = ticks_per_render_papers + 1;
    
    requestAnimationFrame(function render() {
        var alpha = canvas.force_papers.alpha();
        
        for (var i = 0; i < ticks_per_render_papers; i++) {
            canvas.force_papers.tick();
        }

        mediator.current_bubble.data.forEach(function (a, i) {
            var current_area = "";

            for (let area in mediator.current_bubble.areas_array) {
                if (config.use_area_uri) {
                    if (mediator.current_bubble.areas_array[area].area_uri == a.area_uri) {
                        current_area = mediator.current_bubble.areas_array[area];
                        break;
                    }
                } else {
                    if (mediator.current_bubble.areas_array[area].title == a.area) {
                        current_area = mediator.current_bubble.areas_array[area];
                        break;
                    }
                }
            }

            var paper_a = self.constructCircle(a);

            var distance = Math.sqrt(
                    Math.pow(current_area.x - paper_a.x, 2) +
                    Math.pow(current_area.y - paper_a.y, 2)
                    );

            if (distance > Math.abs(current_area.r - paper_a.r)) {
                paper_a.y += (current_area.y - paper_a.y) * alpha * multiplier_areas;
                paper_a.x += (current_area.x - paper_a.x) * alpha * multiplier_areas;
                a.x = paper_a.x - a.width / 2;
                a.y = paper_a.y - a.height / 2;
            }

            mediator.current_bubble.data.slice(i + 1).forEach((b) => {

                var paper_b = self.constructCircle(b);

                self.checkCollisions(paper_a, paper_b, alpha * multiplier_areas);

                a.x = paper_a.x - a.width / 2;
                a.y = paper_a.y - a.height / 2;
                b.x = paper_b.x - b.width / 2;
                b.y = paper_b.y - b.height / 2;
            });
        });

        self.drawEntity("g.paper", alpha, papers_count);

        papers_count++;
        
        if (alpha > 0) {
            requestAnimationFrame(render);
        } else {
            self.drawEntity("g.paper", alpha, papers_count, true);
        }
    });
};

// construct circle around paper
papers.constructCircle = function (a) {

    var paper_a = {};
    paper_a.x = a.x + a.width / 2;
    paper_a.y = a.y + a.height / 2;
    paper_a.r = (a.diameter / 2) * 1.2;

    return paper_a;
};

// figure out translate coordinates
papers.drawEntity = function (entity, alpha, count, forced=false) {

    if (forced || alpha > 0.09 && count % 2 === 0 ||
            alpha <= 0.09 && alpha >= 0.08 && count % 2 === 0 ||
            alpha <= 0.08 && alpha >= 0.07 && count % 4 === 0 ||
            alpha <= 0.07 && alpha >= 0.06 && count % 4 === 0 ||
            alpha <= 0.06 && alpha >= 0.05 && count % 6 === 0 ||
            alpha <= 0.05 && alpha >= 0.04 && count % 6 === 0 ||
            alpha <= 0.04 && alpha >= 0.03 && count % 8 === 0 ||
            alpha <= 0.03 && alpha >= 0.02 && count % 8 === 0 ||
            alpha <= 0.02 && alpha >= 0.01 && count % 10 === 0 ||
            alpha <= 0.01 && count % 10 === 0) {

        canvas.chart.selectAll(entity)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
    }
};



// test for collisions of papers, so they dont overlap
papers.checkCollisions = function (a, b, alpha) {
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
};

papers.shrinkPaper = function (d, holder) {

    if (!mediator.is_zoomed) {
        return;
    }

    var holder_div = holder ? holder : d3.select(this);

    this.resizePaper(d, holder_div, 1, "rgb(255, 255, 255)", "0.25");

    holder_div.selectAll("p")
            .attr("class", "large highlightable");
    
    holder_div.selectAll(".readers")
            .style("height", "15px")
            .style("margin-top", "5px");

    d.resized = false;
    holder_div.on("mouseover", function (d) {
        mediator.publish("paper_mouseover", d, this);
    });
};

papers.resizePaper = function (d, holder_div, resize_factor, color) {
    let current_div = holder_div.node();
    let current_g_paper = d3.select(current_div.parentNode.parentNode.parentNode);
    let current_foreignObject = current_g_paper.select("foreignObject");
    let current_path = current_g_paper.select("path#region");
    let current_dogear = current_g_paper.select("path.dogear");

    var current_size = d.height * mediator.circle_zoom;
    var max_size = canvas.current_vis_size / 2;

    if (current_size * resize_factor > max_size) {
        resize_factor = max_size / current_size;
    }

    //current_g.parentNode.appendChild(current_g);
    toFront(current_g_paper.node());

    let region = this.createPaperPath(0, 0, d.width * mediator.circle_zoom * resize_factor, d.height * mediator.circle_zoom * resize_factor, undefined, undefined, d.resulttype);
    let dogear = this.createDogearPath(d.width * (1 - config.dogear_width) * mediator.circle_zoom * resize_factor,
                                        0,
                                        d.width * mediator.circle_zoom * resize_factor,
                                        d.height * mediator.circle_zoom * resize_factor,
                                        undefined,
                                        undefined,
                                        d.resulttype);

    current_foreignObject
            .attr("width", d.width * mediator.circle_zoom * resize_factor + "px")
            .attr("height", d.height * mediator.circle_zoom * resize_factor + "px")
            .style("width", d.width * mediator.circle_zoom * resize_factor + "px")
            .style("height", d.height * mediator.circle_zoom * resize_factor + "px");

    current_path
            //.style("fill-opacity", opacity)
            .style("fill", color)
            .attr("d", region);

    current_dogear.attr("d", dogear);

    let height = (config.content_based) ? (d.height * mediator.circle_zoom * resize_factor + "px") :
            (d.height * mediator.circle_zoom * resize_factor - 20 + "px");

    holder_div.select("div.metadata")
            .attr("height", height)
            .attr("width", d.width * mediator.circle_zoom * resize_factor * (1 - config.dogear_width) + "px")
            .style("height", height)
            .style("width", d.width * mediator.circle_zoom * resize_factor * (1 - config.dogear_width) + "px");

    holder_div.select("div.readers")
            .style("width", d.width * mediator.circle_zoom * resize_factor + "px");
};

// called far too often
papers.enlargePaper = function (d, holder_div) {

    this.mouseoverpaper();

    if (d.resized || !mediator.is_zoomed) {
        return;
    }

    mediator.publish("record_action", d.id, "enlarge_paper", config.user_id, d.bookmarked + " " + d.recommended, null);

    let resize_factor = 1.2;

    holder_div = d3.select(holder_div);

    holder_div.selectAll("p")
            .attr("class", "larger");
    
    holder_div.selectAll(".readers")
            .style("height", "25px")
            .style("margin-top", "5px");

    let metadata = holder_div.select("div.metadata");

    if (metadata.node().offsetHeight < metadata.node().scrollHeight) {
        resize_factor = this.calcResizeFactor(metadata);
    }

    this.resizePaper(d, holder_div, resize_factor, "rgb(255, 255, 255)", "1");

    holder_div
            .on("click", (d) => {

                if (!mediator.is_zoomed) {
                    return mediator.bubbles.makePaperClickable(d);
                } else {

                    if (!d.paper_selected) {
                        mediator.publish("paper_holder_clicked", d);

                        this.resetPaths();

                        var current_paper = d3.selectAll("path#region")
                                .filter(function (x) {
                                    return d.id === x.id;
                                });

                        current_paper.attr("class", "framed");
                    } else {
                        //mediator.publish("list_title_click", d);
                    }

                    d.paper_selected = true;
                    mediator.current_enlarged_paper = d;
                    mediator.publish("record_action", d.id, "click_on_paper", config.user_id, d.bookmarked + " " + d.recommended, null);
                    d3.event.stopPropagation();
                }
            })
            .on("mouseout", (d) => {
                this.mouseoutpaper(d, holder_div);
            });

    mediator.current_circle = canvas.chart.selectAll("#headstart-chart circle")
            .filter(function (x) {
                if (config.use_area_uri) {
                    return (x.area_uri == d.area_uri);
                } else {
                    return (x.title == d.area);
                }
            });

    mediator.current_circle
            .on("click", (d) => {
                mediator.publish("currentbubble_click", d);
                this.resetPaths();
            });

    d.resized = true;
};

papers.currentbubble_click = function (d) {
    mediator.publish("paper_current_bubble_clicked", d);

    if (mediator.current_enlarged_paper !== null) {
        mediator.current_enlarged_paper.paper_selected = false;
    }

    mediator.current_enlarged_paper = null;
    mediator.publish("record_action", d.id, "click_paper_list_enlarge", config.user_id, d.bookmarked + " " + d.recommended, null);

    d3.event.stopPropagation();
};

papers.calcResizeFactor = function (metadata) {
    var current_paper = metadata.node();
    var new_height = current_paper.scrollHeight;
    var new_width = current_paper.offsetWidth;

    var ratio_old = config.paper_width_factor / config.paper_height_factor;
    var ratio_new = new_height / new_width;

    while (ratio_new.toFixed(1) > ratio_old.toFixed(1)) {
        new_height -= Math.pow(config.paper_height_factor, 3);
        new_width += Math.pow(config.paper_width_factor, 3);
        ratio_new = new_height / new_width;
    }

    return new_width / current_paper.offsetWidth;
};

// creates the dog-ears path for the papers
papers.createDogearPath = function (x, y, width, height, correction_x, correction_y, drawType) {

    if(drawType == "dataset") {
        return undefined
    }

    if (!correction_x) {
        correction_x = config.dogear_width;
    }

    if (!correction_y) {
        correction_y = config.dogear_height;
    }

    var v = height * correction_x;
    var h = width * correction_y;

    var path = "M " + x + " " + y + " v " + v + " h " + h;

    return path;
};

papers.framePaper = function(p) {
    d3.selectAll("path#region")
      .filter(function(x) {
          return x.id === p.id;
      })
      .attr("class", "framed");
};

papers.onWindowResize = function() {
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

      $("#area_title>h2").css("font-size", canvas.calcTitleFontSize());
      $("#area_title>h2").hyphenate('en');
      $("#area_title_object>body").dotdotdot({wrap:"letter"});

      d3.selectAll("g.paper")
        .attr("transform", (d) => {
          d.x_zoomed = mediator.resized_scale_x(d.x_zoomed);
          d.y_zoomed = mediator.resized_scale_y(d.y_zoomed);
          d.x = mediator.resized_scale_x(d.x);
          d.y = mediator.resized_scale_y(d.y);
          if (mediator.is_zoomed === true) {
            return "translate(" + d.x_zoomed + "," + d.y_zoomed + ")";
          } else {
            return "translate(" + d.x + "," + d.y + ")";
          }
        });

      var paper_holders = d3.selectAll("div.paper_holder");

      paper_holders.each((d) => {
        d.diameter = canvas.diameter_size(d.internal_readers);
        d.width = config.paper_width_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.height = config.paper_height_factor*Math.sqrt(Math.pow(d.diameter,2)/2.6);
        d.top_factor = (1-config.dogear_width);

        d.width_zoomed = d.width * mediator.circle_zoom;
        d.height_zoomed = d.height * mediator.circle_zoom;

        d.resize_width = (mediator.is_zoomed)?(d.width_zoomed):(d.width);
        d.resize_height = (mediator.is_zoomed)?(d.height_zoomed):(d.height);
      });

      d3.selectAll("#region")
        .attr("d", (d) => {
          return papers.createPaperPath(0, 0, d.resize_width, d.resize_height, undefined, undefined, d.resulttype);
        });

      d3.selectAll("path.dogear")
        .attr("d", (d) => {
          return papers.createDogearPath(d.resize_width*d.top_factor, 0, d.resize_width, d.resize_height, undefined, undefined, d.resulttype);
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
          if(!mediator.is_zoomed) {
            return (config.content_based)?(d.resize_height):(d.resize_height * 0.8 + "px");
          } else {
            return (config.content_based)?(d.resize_height + "px"):(d.resize_height - 20 + "px");
          }
        });

      d3.selectAll("div.readers")
        .style("height", (d) => {
          if (mediator.is_zoomed === false) {
            return d.resize_height * 0.2 + "px";
          } else {
            return "15px";
          }
        })
        .style("width", function(d) {
          return d.resize_width + "px";
        });
}

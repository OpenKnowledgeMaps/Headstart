// StateMachine for Streamgraph UI element in Headstart
// Filename: streamgraph.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import { mediator } from 'mediator';
import { io } from 'io';
import { canvas } from 'canvas';
//streamgraph vis: colors, margin, padding, max ticks on x-axis
const streamgraph_margin = {top: 20, right: 50, bottom: 70, left: 50};
const stream_colors = ["#28a2a3", "#671A54", "#CC3380", "#7acca3", "#c999ff", "#ffe199"
        , "#ccfff2", "#99DFFF", "#FF99AA", "#c5d5cf", "#FFBD99", "#FFE699"];
const axis_padding_left = -30;
const axis_padding_bottom = 35;
const max_ticks_x = 8;
const label_border_width = 5; //width labels
const label_round_factor = 4; //border-radius labels
const line_helper_margin = -10; //relative to mouse position
const tooltip_offset_top = -150; //relative to mouse position
const tooltip_offset_left = -10; //relative to mouse position

const tooltipTemplate = require('templates/streamgraph/tooltip.handlebars');

export const streamgraph = StateMachine.create({

    events: [
        {name: "start", from: "none", to: "show"}
    ],

    callbacks: {

        onstart: function () {
        }
    }
});

streamgraph.setupStreamgraph = function (streamgraph_data) {
    
    let streamgraph_width = canvas.current_vis_width - streamgraph_margin.left - streamgraph_margin.right,
        streamgraph_height = canvas.current_vis_size - streamgraph_margin.top - streamgraph_margin.bottom,
        parsed_data = JSON.parse(streamgraph_data),
        label_positions = [];
    
    let stack = d3.layout.stack()
            .offset("silhouette")
            .values(function (d) {
                return d.values;
            })
            .x(function (d) {
                return d.date;
            })
            .y(function (d) {
                return d.value;
            });

    let nest = d3.nest()
            .key(function (d) {
                return d.key;
            });

    let area = d3.svg.area()
            .interpolate("cardinal")
            .x(function (d) {
                return x(d.date);
            })
            .y0(function (d) {
                return y(d.y0);
            })
            .y1(function (d) {
                return y(d.y0 + d.y);
            });

    let x = d3.time.scale()
            .range([0, streamgraph_width]);

    let y = d3.scale.linear()
            .range([streamgraph_height, 0]);

    let z = d3.scale.ordinal()
            .range(stream_colors);
    
    let amended_data = this.amendData(parsed_data);
    let transformed_data = this.transformData(amended_data);
    let nested_entries = nest.entries(transformed_data);
    let streams = stack(nested_entries);

    x.domain(d3.extent(transformed_data, function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(transformed_data, function (d) {
            return d.y0 + d.y;
        })]);
    
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%Y"))
            .ticks(d3.time.year, Math.ceil(parsed_data.x.length/max_ticks_x));

    var yAxis = d3.svg.axis()
            .scale(y)
            .tickFormat(d3.format("d"))
            .tickSubdivide(0);
    
    if(y.domain()[1] <= 8) {
        yAxis.ticks(y.domain()[1]);
    }
    
    let streamgraph_subject = this.drawStreamgraph(streams, area, z);   
    this.drawAxes(streamgraph_subject, xAxis, yAxis, streamgraph_width, streamgraph_height);
    let series = streamgraph_subject.selectAll(".streamgraph-area");
    this.drawLabels(series, x, y, streamgraph_width, streamgraph_height, label_positions);
    this.setupTooltip(streamgraph_subject, x);
    this.setupLinehelper();
}

streamgraph.zoomed = function() {
  d3.select(".streamgraph-chart").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

streamgraph.initMouseListeners = function() {
    d3.selectAll('.stream')
            .on("click", function (d, i) {
                mediator.publish("stream_clicked", d.key, d3.select(this).style('fill'));
            })
            
    d3.select('#' + config.tag)
            .on("click", function (d) {
                if (event.target.className.baseVal === "container-headstart" ||
                    event.target.className.baseVal === "vis-col" ||
                    event.target.id === "headstart-chart" ||
                    event.target.className.baseVal === "streamgraph-canvas" ||
                    event.target.className.baseVal === "streamgraph-chart" ||
                    event.target.className.baseVal === "zoom") {   
                    mediator.publish("streamgraph_chart_clicked");
                }
            })
}

streamgraph.markStream = function() {
    if(mediator.current_stream === null) {
        return;
    }
    d3.selectAll(".stream")
        .attr("class", function (d) {
            return d.key !== mediator.current_stream ? 'stream lower-opacity' : 'stream';
        })    
}

streamgraph.reset = function () {
     d3.selectAll(".stream").transition()
        .duration(100)
        .attr('class', 'stream')
}

//Add an empty entry at the beginning and the end of each stream to improve display
streamgraph.amendData = function(json_data) {
    //Add entries to x axis
    let x_array = json_data.x
    x_array.unshift((parseInt(x_array[0]) - 1).toString());
    x_array.push((parseInt(x_array[x_array.length -1]) + 1).toString());
    
    //Add entries to y axis
    json_data.subject.forEach(function (element) {
        element.y.unshift(0);
        element.y.push(0);
    });
    
    return json_data;
}

streamgraph.transformData = function(json_data) {
    let transformed_data = [];

    json_data.subject.forEach(function (element) {
        let count = 0;
        element.y.forEach(function (data_point) {
            transformed_data.push({key: element.name, value: data_point, date: new Date(json_data.x[count])})
            count++;
        })
    })
    
    return transformed_data;
}

streamgraph.drawStreamgraph = function (streams, area, z) {
    
    let self = this;
    
    let zoom = d3.behavior.zoom()
        .scaleExtent([1, 5])
        .on("zoom", self.zoomed);
    
    let streamgraph_subject = d3.select("#streamgraph_subject")
            .append("g")
            .classed("streamgraph-chart", true)
            .attr("transform", "translate(" + streamgraph_margin.left
                                    + "," + streamgraph_margin.top + ")")    
            
    if(config.streamgraph_zoom) {
        streamgraph_subject.call(zoom);
    }
    
    streamgraph_subject.append("rect")
        .classed("zoom", true)
        .attr("width", d3.select("#streamgraph_subject").attr("width"))
        .attr("height", d3.select("#streamgraph_subject").attr("height"))
        .style("fill", "none")
        .style("pointer-events", "all")
        

    let series = streamgraph_subject.selectAll(".stream")
            .data(streams)
            .enter().append("g")
            .attr("class", "streamgraph-area")


    series.append("path")
            .attr("class", "stream")
            .attr("d", function (d) {
                return area(d.values);
            })
            .style("fill", function (d, i) {
                return z(i);
            });
            
    return streamgraph_subject;
}

streamgraph.drawLabels = function (series, x, y, streamgraph_width, streamgraph_height, label_positions) {
    let self = this;
    let text = d3.select(".streamgraph-chart").selectAll("text.label")
            .data(series.data())
            .enter()
            .append("text")
            .attr("dy", "10")
            .classed("label", true)
            .text(function (d) {
                if(d.key === "") {
                    d.key = "NO_LABEL";
                }
                return d.key 
            })
            .attr("transform", function (d) {
                return self.initialPositionLabel(this, d, x, y, streamgraph_width, label_positions)
            })
    
    text.on("mouseover", function (d) {
        self.stream_mouseover(d)
    })

    text.on("mouseout", function () {
        self.stream_mouseout();
    })

    text.on("mousemove", function (d) {
        self.stream_mousemove(d3.event, d, x)
    })

    text.on("click", function (d) {
        let current_stream = d3.selectAll(".stream").filter(function (el) {
            return el.key === d.key;
        })

        let color = current_stream.style('fill');
        mediator.publish("stream_clicked", d.key, color);
    })
    
    let repositioned_labels = self.repositionOverlappingLabels(label_positions);
    
    d3.select(".streamgraph-chart").selectAll("text.label")
            .attr("transform", function (d) {
                var current_label = repositioned_labels.find(obj => {
                    return obj.key === d.key;
                })               
                return('translate(' + current_label.x + ',' + current_label.y + ')')
            })
    
    let setTM = function(element, m) {
        element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m))
    }
    
    let labels = d3.selectAll(".label")
    labels[0].forEach(function (label) {
        let cur_d = label.__data__;
        
        let bbox = label.getBBox();
        let ctm = label.getCTM();
        
        let rect = d3.select('.streamgraph-chart').insert('rect','text.label')
            .classed("label-background", true)
            .attr('x', bbox.x - streamgraph_margin.left - label_border_width)
            .attr('y', bbox.y - streamgraph_margin.top - label_border_width)
            .attr('width', bbox.width + label_border_width*2)
            .attr('height', bbox.height + label_border_width*2)
            .attr('rx', label_round_factor)
        
        rect.on("mouseover", function () {
            self.stream_mouseover(cur_d)
        })
        
        rect.on("mouseout", function () {
            self.stream_mouseout();
        })
        
        rect.on("mousemove", function (d, i) {
            self.stream_mousemove(d3.event, cur_d, x)
        })
        
        rect.on("click", function () {
             let current_stream = d3.selectAll(".stream").filter(function (el) {
                return el.key === cur_d.key;
            })

            let color = current_stream.style('fill');
            mediator.publish("stream_clicked", cur_d.key, color);
        })
    
        setTM(rect[0][0], ctm)
    })
}

streamgraph.initialPositionLabel = function(self, d, x, y, streamgraph_width, label_positions) {
    let max_value = d3.max(d.values, function (x) { return x.y })
    let text_width = self.getBBox().width;
    let text_height = self.getBBox().height;
    let final_x, final_y;
    d.values.forEach(function (element) {
        if(element.y === max_value) {
            final_x = x(element.date) - text_width/2;
            final_y = y(element.y  + element.y0) 
                    + ((y(element.y0) - y(element.y  + element.y0))/2) 
                    - text_height/2;
        }
        if(final_x < 0) {
            final_x = 0;
        } else if ((final_x + text_width) > streamgraph_width) {
            final_x = streamgraph_width - text_width;
        }
    })

    label_positions.push({key: d.key, x: final_x, y: final_y, width: text_width, height: text_height, center_x: (final_x + text_width/2)});

    return "translate(" + final_x + ", " + final_y + ")";
}

streamgraph.repositionOverlappingLabels = function(label_positions) {
    
    let self = this;
    let move_up = true;
    let cloned_label_positions = label_positions.slice(0);
    
    let grouped_labels = this.sortAndGroupLabels(cloned_label_positions);
    let current_group = 0;
    
    grouped_labels.forEach(function (element) {
        if(element.group === 0) {
            return;
        }
        
        if(element.group !== current_group) {
            current_group = element.group;
            move_up = !move_up;
        }
        
        grouped_labels.forEach(function (element_left) {
            if(element_left.group < element.group) {
                let overlap = self.hasOverlap(element_left, element);
                if(overlap > 0) {
                    if(move_up) {
                        element.y = element.y - overlap;
                    } else {
                        element.y = element.y + overlap;
                    }
                }
            }
        })
    })
    
    label_positions.map(function (label) {
        grouped_labels.map(function (f) {
              if (f.key === label.key) {
                   label.y = f.y
              }
       })
               return label;
    })
    
    return label_positions;
}

streamgraph.hasOverlap = function(rect1, rect2) {
    
    if (rect1.x <= (rect2.x + rect2.width) &&
          rect2.x <= (rect1.x + rect1.width) &&
          rect1.y <= (rect2.y + rect2.height) &&
          rect2.y <= (rect1.y + rect1.height)) {
      return rect2.height + label_border_width*2;
    }
        
    return 0;
}

streamgraph.sortAndGroupLabels = function(label_positions) {
    
    //Sort and group labels first
    let compare = function(a, b) {
        if (a.center_x === b.center_x) {
            if(a.y < b.y) {
                return -1;
            }
            if(a.y > b.y) {
                return 1;
            }
        } else if(a.center_x < b.center_x) {
            return -1;
        } else if (a.x > b.x) {
            return 1;
        }
        return 0;
    }
    
    let sorted_labels = label_positions.sort(compare);
    let previous_x = -1;
    let current_group = 0;
    sorted_labels.forEach(function (element, i) {
        if(previous_x === element.center_x || i === 0) {
            element.group = current_group;
        } else {
            element.group = current_group++ + 1;
        }
        previous_x = element.center_x;
    })
    
    return sorted_labels;
}

streamgraph.drawAxes = function(streamgraph_subject, xAxis, yAxis, streamgraph_width, streamgraph_height) {
    
    streamgraph_subject.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + streamgraph_height + ")")
            .call(xAxis);

    streamgraph_subject.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"));
    
    streamgraph_subject.append("text")
            .attr("class", "axis-label x")
            .attr("x", streamgraph_width/2)
            .attr("y", streamgraph_height + axis_padding_bottom)
            .attr("text-anchor", "middle")
            .text("Jahr")
    
    streamgraph_subject.append("text")
            .attr("class", "axis-label y")   
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + axis_padding_left + "," 
                                            + streamgraph_height/2 + ")rotate(-90)")
            .text("Anzahl Dokumente")
}

streamgraph.setupTooltip = function(streamgraph_subject, x) {
    
    let self = this;
    
    d3.select("#" + config.tag)
            .append("div")
            .attr("id", "tooltip")
            .attr("class", "tip hidden")
            .style("top", $('#headstart-chart').offset().top + "px");
    
    streamgraph_subject.selectAll(".stream")
            .on("mouseover", function (d) {
                self.stream_mouseover(d);
            })
            .on("mouseout", function () {               
                self.stream_mouseout();
            })
            .on("mousemove", function (d, i) {
                self.stream_mousemove(d3.event, d, x);
            })
}

streamgraph.stream_mouseover = function(el) {
    if(typeof el === "undefined") {
        return;
    }
    
    d3.selectAll(".stream").transition()
            .duration(100)
            .attr("class", function (d, j) {
                let stream_class = 'stream';
                if(d.key !== el.key) {
                    stream_class = 'stream lower-opacity';
                }
                if (typeof mediator.current_stream !== "undefined" && mediator.current_stream === d.key) {
                    stream_class = 'stream';
                }
                return stream_class;
            })
    
}

streamgraph.stream_mouseout = function() {
    if(mediator.current_stream === null) {
        d3.selectAll(".stream").transition()
            .duration(100)
            .attr('class', 'stream')
    } else {
        d3.selectAll(".stream").transition()
            .duration(100)
            .attr("class", function (d, j) {
                let stream_class = 'stream';
                if(typeof mediator.current_stream !== "undefined" && d.key !== mediator.current_stream) {
                    stream_class = 'stream lower-opacity';
                }
                if (typeof mediator.current_stream !== "undefined" && mediator.current_stream === d.key) {
                    stream_class = 'stream';
                }
                return stream_class;
            })
    }

    d3.select('#tooltip').classed("hidden", true);
}

streamgraph.stream_mousemove = function (current_event, d, x) {
    if(typeof d === "undefined") {
        return;
    }
    
    let realx = current_event.clientX;
    let realy = current_event.clientY;
    let invertedx = x.invert(realx - $('#streamgraph_subject').offset().left - streamgraph_margin.left);
    let xDate = invertedx.getFullYear();
    let current_stream = d3.selectAll(".stream").filter(function (el) {
        return el.key === d.key;
    })
    
    let color = current_stream.style('fill');
    let cur_d = current_stream.data()[0];
    
    var all_years = d3.sum(d.values, function(cur_d) { return cur_d.value });
    cur_d.values.forEach(function (f) {
        var year = (f.date.toString()).split(' ')[3];
        if (xDate == year) {
            d3.select("#tooltip")
                    .style("left", (realx + tooltip_offset_left) + "px")
                    .style("top", (realy + tooltip_offset_top) + "px")
                    .html( function () {
                        return tooltipTemplate({year: year, color: color, keyword: f.key, current_year: f.value, all_years: all_years})
                    })
                    .classed("hidden", false);
        }
    });
}

streamgraph.setupLinehelper = function() {
    let line_helper = d3.select("#headstart-chart")
            .append("div")
            .attr("class", "line_helper")
            .style("height", canvas.current_vis_size)
    
    let move_line = function(event) {
        line_helper.style("left", (event.clientX + line_helper_margin) + "px");
    }

    d3.select(".streamgraph-chart")
            .on("mousemove", function () {
                move_line(d3.event);
            })
            .on("mouseover", function () {
                move_line(d3.event);
            });
}
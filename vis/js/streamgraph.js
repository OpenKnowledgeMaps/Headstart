// StateMachine for Streamgraph UI element in Headstart
// Filename: streamgraph.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import { mediator } from 'mediator';
import { io } from 'io';
import { canvas } from 'canvas';
//streamgraph vis: colors, margin, padding, max ticks on x-axis
const streamgraph_margin = {top: 20, right: 50, bottom: 70, left: 50};
const stream_colors = ["#28a2a3", "#671A54", "#d5c4d0", "#99e5e3", "#F1F1F1"
        , "#dbe1ee", "#CC3380", "#99DFFF", "#FF99AA", "#c5d5cf", "#FFBD99", "#FFE699"];
const axis_padding_left = -30;
const axis_padding_bottom = 35;
const max_ticks_x = 8;
const label_border_width = 5; //width labels
const label_round_factor = 5; //border-radius labels
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
        parsed_data = JSON.parse(streamgraph_data);
    
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
    let series = streamgraph_subject.selectAll(".streamgraph-area");
    this.drawLabels(series, x, y);
    this.drawAxes(streamgraph_subject, xAxis, yAxis, streamgraph_width, streamgraph_height);
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
    if(mediator.stream_clicked === null) {
        return;
    }
    d3.selectAll(".stream")
        .attr("class", function (d) {
            return d.key !== mediator.stream_clicked ? 'stream lower-opacity' : 'stream';
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

streamgraph.drawLabels = function (series, x, y) {
    let self = this;
    
    let text = d3.select(".streamgraph-chart").selectAll("text")
            .data(series.data())
            .enter()
            .append("text")
            .attr("dy", "10")
            .classed("label", true)
            .text(function (d) { return d.key })
            .attr("transform", function (d) {
                let max_value = d3.max(d.values, function (x) { return x.y })
                let text_width = this.getBBox().width;
                let text_height = this.getBBox().height;
                let final_x, final_y;
                d.values.forEach(function (element) {
                    if(element.y === max_value) {
                        final_x = x(element.date) - text_width/2;
                        final_y = y(element.y  + element.y0) 
                                + ((y(element.y0) - y(element.y  + element.y0))/2) 
                                - text_height/2;
                    }
                })
                return "translate(" + final_x + ", " + final_y + ")";
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
    
    let setTM = function(element, m) {
        element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m))
    }
    
    let labels = d3.selectAll(".label")
    labels[0].forEach(function (label) {
        let cur_d = label.__data__;
        
        let bbox = label.getBBox();
        let ctm = label.getCTM();
        
        let rect = d3.select('.streamgraph-chart').insert('rect','text')
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
    
    d3.select("#visualization")
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
    if(mediator.stream_clicked !== null || typeof el === "undefined") {
        return;
    }
    
    d3.selectAll(".stream").transition()
            .duration(100)
            .attr("class", function (d, j) {
                return d.key != el.key ? 'stream lower-opacity' : 'stream';
            })
    
}

streamgraph.stream_mouseout = function() {
    if(mediator.stream_clicked === null) {
        d3.selectAll(".stream").transition()
            .duration(100)
            .attr('class', 'stream')
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
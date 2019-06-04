// StateMachine for Streamgraph UI element in Headstart
// Filename: streamgraph.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import { mediator } from 'mediator';
import { io } from 'io';
import { canvas } from 'canvas';

//import * as d3label from 'd3-area-label';

export const streamgraph = StateMachine.create({

    events: [
        {name: "start", from: "none", to: "show"}
    ],

    callbacks: {

        onstart: function () {
        }
    }
});

streamgraph.drawStreamgraph = function (streamgraph_data) {

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

    let colors = ["#2856A3", "#671A54", "#d5c4d0", "#99e5e3", "#F1F1F1", "#dbe1ee", "#CC3380", "#99DFFF", "#FF99AA", "#c5d5cf", "#FFBD99", "#FFE699"]

    let json_data = JSON.parse(streamgraph_data);

    let parsed_data = [];

    json_data.subject.forEach(function (element) {
        let count = 0;
        element.y.forEach(function (data_point) {
            parsed_data.push({key: element.name, value: data_point, date: new Date(json_data.x[count])})
            count++;
        })
    })
    
    let tooltip = d3.select("#visualization")
            .append("div")
            .attr("class", "tip")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("top", $('#headstart-chart').offset().top + "px");

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
            .range([0, canvas.available_width]);

    var y = d3.scale.linear()
            .range([canvas.current_vis_size - 10, 0]);

    var z = d3.scale.ordinal()
            .range(colors);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.timeYears, 1);

    var yAxis = d3.svg.axis()
            .scale(y);

    let nested_entries = nest.entries(parsed_data);
    let streams = stack(nested_entries);

    x.domain(d3.extent(parsed_data, function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(parsed_data, function (d) {
            return d.y0 + d.y;
        })]);

    let streamgraph_subject = d3.select("#streamgraph_subject")

    let series = streamgraph_subject.selectAll(".stream")
            .data(streams)
            .enter().append("g")
            .attr("class", "area")


    series.append("path")
            .attr("class", "stream")
            .attr("d", function (d) {
                return area(d.values);
            })
            .style("fill", function (d, i) {
                return z(i);
            });

    series.append("text")
            .attr("dy", "10")
            .classed("label", true)
            .text(function (d) {
                return d.key;
            })
            .attr("transform", function (d, i) {
                let max_value = d3.max(d.values, function (x) { return x.y })
                let text_width = this.clientWidth;
                let text_height = this.getBBox().height;
                let final_x, final_y;
                d.values.forEach(function (element) {
                    if(element.y === max_value) {
                        final_x = x(element.date) - text_width;
                        final_y = y(element.y  + element.y0) + ((y(element.y0) - y(element.y  + element.y0))/2) - text_height/2;
                    }
                })
                return "translate(" + final_x + ", " + final_y + ")";
            })
    
    let setTM = function(element, m) {
        element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m))
    }
    
    let labels = d3.selectAll(".label")
    labels[0].forEach(function (label, i) {
        let bbox = label.getBBox();
        let ctm = label.getCTM();
        
        let border_width = 5;
        
        let rect = d3.select(series[0][i]).insert('rect','text')
            .attr('x', bbox.x - border_width)
            .attr('y', bbox.y - border_width)
            .attr('width', bbox.width + border_width*2)
            .attr('height', bbox.height + border_width*2)
            .attr('rx', '5')
            .style("stroke-width", "10")
            .style("stroke", "white")
            .style("fill", "white")
            .style("fill-opacity", "1")
    
        setTM(rect[0][0], ctm)
    })
    
    streamgraph_subject.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (canvas.current_vis_size - 50) + ")")
            .call(xAxis);


    streamgraph_subject.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(20,0)")
            .call(yAxis.orient("left"));

    streamgraph_subject.selectAll(".stream")
            .attr("opacity", 1)
            .on("mouseover", function (d, i) {
                streamgraph_subject.selectAll(".stream").transition()
                        .duration(100)
                        .attr("opacity", function (d, j) {
                            return j != i ? 0.6 : 1;
                        })
            })
            .on("mouseout", function (d, i) {
                streamgraph_subject.selectAll(".stream").transition()
                        .duration(100)
                        .attr("opacity", '1');

                tooltip.style("visibility", "hidden");

            })
            .on("mousemove", function (d, i) {

                var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch

                let mouse = d3.mouse(this);
                let mousex = mouse[0];
                let mousey = mouse[1];
                var invertedx = x.invert(mousex);
                var xDate = invertedx.getFullYear();
                d.values.forEach(function (f) {
                    var year = (f.date.toString()).split(' ')[3];
                    if (xDate == year) {
                        tooltip
                                .style("left", mousex + "px")
                                .style("top", mousey + "px")
                                .html("<div class='year'>" + year + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + f.value + "</div>")
                                .style("visibility", "visible");
                    }
                });
            })

    let line_helper = d3.select("#headstart-chart")
            .append("div")
            .attr("class", "line_helper")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
            .style("height", canvas.current_vis_size)
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "lightgray");

    d3.select("#headstart-chart")
            .on("mousemove", function () {
                line_helper.style("left", (d3.mouse(this)[0] + 5) + "px")
            })
            .on("mouseover", function () {
                line_helper.style("left", (d3.mouse(this)[0] + 5) + "px")
            });
}
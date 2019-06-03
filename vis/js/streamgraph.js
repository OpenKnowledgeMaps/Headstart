// StateMachine for Streamgraph UI element in Headstart
// Filename: streamgraph.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import {
    mediator
} from 'mediator';
import { io } from 'io';
import { canvas } from 'canvas';

export const streamgraph = StateMachine.create({

    events: [
        { name: "start", from: "none", to: "show"}
    ],

    callbacks: {

        onstart: function() {
        }
    }
});

/*streamgraph.createStreamgraphData = function(json_data) {
    let return_array = [];
    
    json_data.forEach(function (d) {
        let new_json = {label: d.name, data: d.y}
        return_array.push(new_json);
    })
    
    return return_array;
}*/

streamgraph.drawStreamgraph = function(streamgraph_data) {
    
    let stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });
    
    let nest = d3.nest()
        .key(function(d) { return d.key; });
    
    let colors = ["#2856A3", "#671A54", "#d5c4d0", "#99e5e3", "#F1F1F1", "#dbe1ee", "#CC3380", "#99DFFF", "#FF99AA", "#c5d5cf", "#FFBD99", "#FFE699"]
    
    let json_data = JSON.parse(streamgraph_data);
    
    let parsed_data = [];
            
    json_data.subject.forEach(function(element) {
        let count = 0;
        element.y.forEach(function (data_point) {
            parsed_data.push({key: element.name, value: data_point, date: new Date(json_data.x[count])})
            count++;
        })
    })
    
    console.log("Data converted");
    
    let area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });
    
    let x = d3.time.scale()      
                .range([0, canvas.available_width]);

    var y = d3.scale.linear()
                .range([canvas.current_vis_size-10, 0]);

    var z = d3.scale.ordinal()
                .range(colors);
    
    let streams = stack(nest.entries(parsed_data));
    
    x.domain(d3.extent(parsed_data, function(d) { return d.date; }));
    y.domain([0, d3.max(parsed_data, function(d) { return d.y0 + d.y; })]);
    
    let streamgraph_subject = d3.select("#streamgraph_subject")
    
    streamgraph_subject.selectAll(".stream")
        .data(streams)
      .enter().append("path")
        .attr("class", "stream")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });
    
    /*let json_data = JSON.parse(streamgraph_data);    
    let x_labels = json_data.x;
    let y_data_subject = this.createStreamgraphData(json_data.subject);
    let y_data_area = this.createStreamgraphData(json_data.area);
    
    var options = {
        backgroundColor: '#fff',
        //colors: ["#fff", "#00f"],
        //colors: [ "rgba(40,86,163,0.6)", "rgba(241,241,241,0.6)"],
        //colors: ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#fffac8', '#aaffc3', '#808000', '#ffd8b1', '#808080', '#ffffff'],
        //colors: ["#FFFF00","#1CE6FF","#FF34FF","#FF4A46","#008941","#006FA6","#A30059","#FFDBE5","#7A4900","#0000A6","#63FFAC","#B79762","#004D43","#8FB0FF","#997D87","#5A0007","#809693","#FEFFE6","#1B4400","#4FC601","#3B5DFF","#4A3B53","#FF2F80","#61615A","#BA0900","#6B7900","#00C2A0","#FFAA92","#FF90C9","#B903AA","#D16100","#DDEFFF","#000035","#7B4F4B","#A1C299","#300018","#0AA6D8","#013349","#00846F","#372101","#FFB500","#C2FFED","#A079BF","#CC0744","#C0B9B2","#C2FF99","#001E09","#00489C","#6F0062","#0CBD66","#EEC3FF","#456D75","#B77B68","#7A87A1","#788D66","#885578","#FAD09F","#FF8A9A","#D157A0","#BEC459","#456648","#0086ED","#886F4C","#34362D","#B4A8BD","#00A6AA","#452C2C","#636375","#A3C8C9"],
        //colors:["rgb(2,63,165)","rgb(125,135,185)","rgb(190,193,212)","rgb(214,188,192)","rgb(187,119,132)","rgb(142,6,59)","rgb(74,111,227)","rgb(133,149,225)","rgb(181,187,227)","rgb(230,175,185)","rgb(224,123,145)","rgb(211,63,106)","rgb(17,198,56)","rgb(141,213,147)","rgb(198,222,199)","rgb(234,211,198)","rgb(240,185,141)","rgb(239,151,8)","rgb(15,207,192)","rgb(156,222,214)","rgb(213,234,231)","rgb(243,225,235)","rgb(246,196,225)","rgb(247,156,212)"],
        //colors:["#023FA5","#7D87B9","#BEC1D4","#D6BCC0","#BB7784","#FFFFFF", "#4A6FE3","#8595E1","#B5BBE3","#E6AFB9","#E07B91","#D33F6A", "#11C638","#8DD593","#C6DEC7","#EAD3C6","#F0B98D","#EF9708", "#0FCFC0","#9CDED6","#D5EAE7","#F3E1EB","#F6C4E1","#F79CD4"],
        //colors: ["rgb(255,0,0)", "rgb(228,228,0)", "rgb(0,255,0)", "rgb(0,255,255)", "rgb(176,176,255)", "rgb(255,0,255)", "rgb(228,228,228)", "rgb(176,0,0)", "rgb(186,186,0)", "rgb(0,176,0)", "rgb(0,176,176)", "rgb(132,132,255)", "rgb(176,0,176)", "rgb(186,186,186)", "rgb(135,0,0)", "rgb(135,135,0)", "rgb(0,135,0)", "rgb(0,135,135)", "rgb(73,73,255)", "rgb(135,0,135)", "rgb(135,135,135)", "rgb(85,0,0)", "rgb(84,84,0)", "rgb(0,85,0)", "rgb(0,85,85)", "rgb(0,0,255)", "rgb(85,0,85)", "rgb(84,84,84)"],
        //colors:["#586e75", "#b58900", "#cb4b16", "#dc322f", "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900", "#fdf6e3", "#586e75", "#657b83"],
        //colors: ["#9E9EA2", "#9AC4B3", "#CAD93F", "#84D2F4", "#E4B031", "#58595B", "#569D79", "#569DD2", "#E57438", "#48B24F", "#50AED3", "#4770B3"],
        //colors: ['#E41A1C', '#007000', '#984EA3', '#DDDDDD', '#FF7F00','#FFFF33','#A65628', '#F781BF','#999999','#B71570','#377EB8','#60D360','#FF7F00'],
        //colors: ["#FFEF40", "#663A1A", "#33CCC7", "#FF4040", "#5BCC33", "#F1F1F1", "#2856A3", "#FF9E40", "#CC339C"],
        //colors: ["#33CCC9", "#FF4040", "#F9FF99", "#541A67", "#F1F1F1", "#A32929", "#FF99AA", "#28671A", "#99FFE6", "#2856A3", "#FFBD99", "#FF9E40"], 
        colors: ["#2856A3", "#671A54", "#d5c4d0", "#99e5e3", "#F1F1F1", "#dbe1ee", "#CC3380", "#99DFFF", "#FF99AA", "#c5d5cf", "#FFBD99", "#FFE699"], 
        colorHighlight: true,
        responsive: true,
        colorInterpolation: "palette",
        labelMinimumSize: 0,
        labelFixedSize: 12,
        stroke: true,
        strokeWidth: 4,
        strokeColor: "rgb(255,255,255, 0.4)",
        //scaleDivisions: 10,
        scaleShowVerticalLines: true,
        scaleShowHorizontalLines: true,
        scaleGridLineWidth: 1,
        curve: true,
        curveTension: 0.1,
        labelFontFamily: '"Lato", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif',
        colorHighlightMultiplier: 0.9,
        labelFontColor: "rgba(0,0,0,1)",
        labelPlacementMethod: "maxHeight",
        multiTooltipTemplate: "Jahr: <%= xLabel %>" +
        " | Publikationen: <%= value %> | Gesamt: <%= sum %> | Max/Jahr: <%= maxHeight %> | Schlagwort: <%= tooltipData %>",
    }
    
    
    let drawChart = function(id, data, options) {
        let ctx = document.getElementById(id).getContext('2d');
        let newChart = new Chart(ctx).Streamgraph(data, options);
    }
    
    drawChart('streamgraph_subject', {labels: x_labels, datasets: y_data_subject}, options);
    //drawChart('streamgraph_area', {labels: x_labels, datasets: y_data_area}, options);*/
}

// StateMachine for Streamgraph UI element in Headstart
// Filename: streamgraph.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import {
    mediator
} from 'mediator';
import { io } from 'io';

export const streamgraph = StateMachine.create({

    events: [
        { name: "start", from: "none", to: "show"}
    ],

    callbacks: {

        onstart: function() {
        }
    }
});

streamgraph.createStreamgraphData = function(json_data) {
    let return_array = [];
    
    json_data.forEach(function (d) {
        let new_json = {label: d.name, data: d.y}
        return_array.push(new_json);
    })
    
    return return_array;
}

streamgraph.drawStreamgraph = function(streamgraph_data) {
    
    let json_data = JSON.parse(streamgraph_data);    
    let x_labels = json_data.x;
    let y_data_subject = this.createStreamgraphData(json_data.subject);
    let y_data_area = this.createStreamgraphData(json_data.area);
    
    var options = {
        backgroundColor: '#fff',
        colors: [ "rgba(40,86,163,0.6)", "rgba(241,241,241,0.6)"],
        colorHighlight: true,
        responsive: true,
        colorInterpolation: "gradient",
        labelMinimumSize: 0,
        labelFixedSize: 12,
        sroke: true,
        strokeWidth: 4,
        strokeColor: "rgb(255,255,255, 0.4)",
        scaleDivisions: 10,
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
        " | Publikationen: <%= value %> | Summe aller Publikationen für diess Schlagwort: <%= sum %> | höchste jährliche Publikationsrate für dieses Schlagwort: <%= maxHeight %> | Schlagwort: <%= tooltipData %>",
    }
    
    
    let drawChart = function(id, data, options) {
        let ctx = document.getElementById(id).getContext('2d');
        let newChart = new Chart(ctx).Streamgraph(data, options);
    }
    
    drawChart('streamgraph_subject', {labels: x_labels, datasets: y_data_subject}, options);
    drawChart('streamgraph_area', {labels: x_labels, datasets: y_data_area}, options);
}

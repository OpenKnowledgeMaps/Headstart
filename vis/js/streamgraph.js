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
            d3.select('#headstart-chart')
            .append('canvas')
                .attr('width', '800')
                .attr('height', '400')
                .attr('id', 'streamgraph')
        }
    }
});

streamgraph.drawStreamgraph = function(streamgraph_data) {
    
    let json_data = JSON.parse(streamgraph_data);
    
    let x_labels = json_data.x;
    
    let y_data = []; 
    
    json_data.subject.forEach(function (d) {
        let new_json = {label: d.name, data: d.y}
        y_data.push(new_json);
    })
    
    let data = {
        labels: x_labels,
        datasets: y_data
    };
    
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

    let ctx = document.getElementById('streamgraph').getContext('2d');
    let newChart = new Chart(ctx).Streamgraph(data, options);
}

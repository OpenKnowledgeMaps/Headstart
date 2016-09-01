require("./stylesheets/main.scss")

import $ from 'jquery';
import './lib/highlightRegex.min.js';
import '../node_modules/jquery-dotdotdot/src/jquery.dotdotdot.min.js';

import { Headstart } from "./js/vis";

$(function() {
    var myHeadstart = new Headstart(
        "", //host
        "", //path
        "visualization", //append to tag
        [{
            title: "edu1",
            file: "vis/data/educational-technology.csv"
        }, {
            title: "edu2",
            file: "vis/data/edu2.csv"
        }, {
            title: "edu3",
            file: "vis/data/edu3.csv"
        }, {
            title: "edu4",
            file: "vis/data/edu4.csv"
        }, {
            title: "edu5",
            file: "vis/data/edu5.csv"
        }] //data
        , {
            title: "Overview of Educational Technology",
            paper_max_scale: 1,
            paper_min_scale: 1,
            bubble_max_scale: 1,
            bubble_min_scale: 1,
            input_format: "csv",
            use_area_uri: false,
            base_unit: "readers",
            is_force_areas: false,
            url_prefix: "http://mendeley.com/catalog/",
            show_timeline: false,
            show_dropdown: true,
            show_intro: false
        } //options
    )
})

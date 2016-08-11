import $ from 'jquery';
import Handlebars from 'handlebars';

import { HeadstartFSM } from "./headstart";

let namespace = "headstart";

export var Headstart = function(host, path, tag, files, options) {

  let vis_directory = "vis/";
  let lib_directory = "lib/";
  let templ_path = host + path + vis_directory + "templates/";

  let viz = $("#"+tag);

  var compiledTemplate = Handlebars.getTemplate(templ_path, "headstart");
  var html = compiledTemplate();
  viz.append(html);

  compiledTemplate = Handlebars.getTemplate(templ_path, "info_modal");
  let info_modal = compiledTemplate();
  viz.append(info_modal);

  compiledTemplate = Handlebars.getTemplate(templ_path, "iframe_modal");
  let iframe_modal = compiledTemplate();
  viz.append(iframe_modal);


  document.getElementById(tag).className = namespace;

  let headstart = new HeadstartFSM(host, path, tag, files, options);

  headstart.start();

}

export function initVar(variable, default_value) {
  return typeof variable !== 'undefined' ? variable : default_value;
}

// ------------------------------------------------------------
// functions which are not being called at the moment, but might
// mausrad -> zoomen
export function redraw() {
  chart.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
}

export function redraw_drag(x, y, dx, dy) {
  console.log("redraw_drag");
  chart.attr("transform",
          "translate(" + dx + ", " + dy + ")");
}

Handlebars.getTemplate = function(template_path, name) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        $.ajax({
            url : template_path + name + '.handlebars',
            success : function(data) {
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }
                Handlebars.templates[name] = Handlebars.compile(data);
            },
            async : false
        });
    }
    return Handlebars.templates[name];
};

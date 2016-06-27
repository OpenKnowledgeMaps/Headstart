var headstart = null;
var namespace = "headstart";

Headstart = function(host, path, tag, files, options) {
  
  var vis_directory = "vis/";
  var lib_directory = "lib/";

  var lib_sources = [
     {source: "browser_detect.js"}
       ,{source: "state-machine.js"}
       ,{source: "mediator.min.js"}
       ,{source: "highlightRegex.min.js"}
       ,{source: "jquery.dotdotdot.min.js"}
       ,{source: "jquery.hypher.js"}
       ,{source: "de.js"}
       ,{source: "d3.v3.js", important: true}
   ];

  var script_sources = [
    {source: "intro.js"}
     ,{source: "popup.js"}
     ,{source: "bubbles.js"}
     ,{source: "papers.js"}
     ,{source: "list.js"}
     ,{source: "headstart.js", final: true}
   ]

  viz = $("#"+tag);

  var compiledTemplate = Handlebars.getTemplate('headstart');
  var html = compiledTemplate();
  viz.append(html);

  compiledTemplate = Handlebars.getTemplate("info_modal");
  info_modal = compiledTemplate();
  viz.append(info_modal);

  compiledTemplate = Handlebars.getTemplate("iframe_modal");
  iframe_modal = compiledTemplate();
  viz.append(iframe_modal);

  addScript = function(source, tag, async) {
    var current_script = document.createElement('script');
    current_script.type = 'text/javascript';
    current_script.src = source;
    current_script.async = async;
    return document.getElementsByTagName(tag)[0].appendChild(current_script);
  }

  addCss = function(source, tag) {
    var current_css = document.createElement('link');
    current_css.type = 'text/css';
    current_css.rel = 'stylesheet';
    current_css.href = source;
    return document.getElementsByTagName(tag)[0].appendChild(current_css);
  }
  
  // document.getElementById(tag).className = namespace;
  
  addCss(host + path + vis_directory + 'style.css', 'head');

  lib_sources.forEach(function(script_source, i) {
    var current_script = addScript(host + path + vis_directory + lib_directory + script_source.source, 'head', false);
    if (typeof script_source.important !== 'undefined') {
      current_script.onload = function() {
        script_sources.forEach(function(script_source) {
          var source = host + path + vis_directory + script_source.source;
          var this_script = addScript(source, 'head', false);
          if (typeof script_source.final !== 'undefined') {
              this_script.onload = function() {
                  headstart = new HeadstartFSM(
                         host
                         , path
                         , tag
                         , files
                         , options
                   );

                   headstart.start();
               }
          }
        })
      }
    }

  })
  
}

function initVar(variable, default_value) {
  return typeof variable !== 'undefined' ? variable : default_value;
}

// ------------------------------------------------------------
// functions which are not being called at the moment, but might
// mausrad -> zoomen
function redraw() {
  chart.attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
}

function redraw_drag(x, y, dx, dy) {
  console.log("redraw_drag");
  chart.attr("transform",
          "translate(" + dx + ", " + dy + ")");
}

Handlebars.getTemplate = function(name) {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        $.ajax({
            url : "vis/templates/" + name + '.handlebars',
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
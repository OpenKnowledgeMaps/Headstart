var lib_directory = "lib/";

var lib_sources = [
   {source: "browser_detect.js"}
     ,{source: "jquery-1.8.1.min.js"}
     ,{source: "state-machine.js"}
     ,{source: "d3.v3.js", important: true}
 ];

var divs = [
   "main"
   ,"subdiscipline_title"
   ,"chart"
   ,"papers_list_container"
   ,"paper_frame"
 ];

var script_sources = [
   "intro.js"
   ,"popup.js"
   ,"bubbles.js"
   ,"papers.js"
   ,"list.js"
   ,"headstart.js"
 ]

// this is the starting point for the visualisation
addDiv = function(id, append_tag) {
  var current_div = document.createElement('div');
  current_div.id = id;
  return document.getElementById(append_tag).appendChild(current_div);
}

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

addCss('http://' + host + path + 'style.css', 'head');

lib_sources.forEach(function(script_source, i) {
  var current_script = addScript('http://' + host + path + lib_directory + script_source.source, 'head', false);

  if (typeof script_source.important !== 'undefined') {
    current_script.onload = function() {
      divs.forEach(function(name) {
        addDiv(name, tag);
      })

      script_sources.forEach(function(script_source) {
        var this_script = 'http://' + host + path + script_source;
        addScript(this_script, 'head', false);
      })
    }
  }

})

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

// not being called?
function showCatalogEntry(d, i) {
  d3.select("#paper_frame")
          .style("display", "block")

  d3.select("#catalouge_entry")
          .attr("src", "http://www.mendeley.com/research/" + d.url)

  d3.event.stopPropagation();
}

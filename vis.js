/*
 * Head Start
 *
 * @author Peter Kraker peter.kraker@tugraz.at
 *
 * Head Start gives you an overview of research fields.
 * The visualization presents you with the main areas in the field, and lets you
 * zoom into the most important publications within each area. Currently,
 * Head Start is available for the field of Educational Technology, but there
 * are more to come!
 *
 * Head Start is a prototype and has been successfully tested with Chrome 22,
 * Firefox 15, and Safari 5.1. Unfortunately, Internet Explorer and Opera are
 * not supported at this point.
 *
 * Head Start is based on readership co-occurrence. The method is discussed
 * in:
 * mendeley.com/research/harnessing-user-library-statistics-research-evaluation-knowledge-domain-visualization
 *
 * The visualization is based on D3.js by Mike Bostock.
 *
 */

function initVar(variable, default_value) {
  return typeof variable !== 'undefined' ? variable : default_value;
}

// ------------------------------------------------------------
// functions which are not being called at the moment, but might
// mausrad -> zoomen
function redraw() {
    headstart.chart.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
}

function redraw_drag(x, y, dx, dy) {
    console.log("redraw_drag");
    headstart.chart.attr("transform",
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

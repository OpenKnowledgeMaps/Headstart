var headstart = null;
var namespace = "headstart";

Headstart = function(host, path, tag, files, options) {

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

  document.getElementById(tag).className = namespace;
  
  headstart = new HeadstartFSM(
         host
         , path
         , tag
         , files
         , options
   );
  
   headstart.start();

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
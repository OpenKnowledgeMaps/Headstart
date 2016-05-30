(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['headstart'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"container-fluid\">\r\n    <div class=\"row\">\r\n        <div class=\"col-md-6\">\r\n            <div id=\"subdiscipline_title\"></div>\r\n            <div id=\"headstart-chart\"></div>\r\n            <div id=\"paper_frame\"></div>\r\n        </div>\r\n        <div class=\"col-md-4\">\r\n            <div id=\"papers_list_container\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"col-md-2\"></div>\r\n</div>";
},"useData":true});
templates['list_container'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"row\">\r\n    <div class=\"col-xs-12\" id=\"show_hide_container\">\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-2\" id=\"left_arrow\">▼</div>\r\n            <div class=\"col-xs-8\" id=\"show_hide_label_container\">\r\n                <strong id=\"show_hide_label\">Show list</strong>\r\n            </div>\r\n            <div class=\"col-xs-2\" id=\"right_arrow\"\">▼</div>\r\n        </div>\r\n        <div class=\"row\">\r\n            <div class=\"col-xs-4\" id=\"input_container\" style=\"display: block;\">\r\n                <input type=\"text\" size=\"15\">\r\n            </div>\r\n            <div class=\"col-xs-8\" id=\"sort_container\" style=\"display: none;\">\r\n                <ul class=\"filter pull-right\"></ul>\r\n            </div>\r\n        </div>\r\n    </div>\r\n<div class=\"col-xs-12\" id=\"papers_list\" style=\"display: none;\"></div>\r\n";
},"useData":true});
})();

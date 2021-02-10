import "markjs";

export const BrowserDetect = require("exports-loader?BrowserDetect!../lib/browser_detect.js");

/**
 * Determines the actual height of the element
 * @param {element} element
 * @return {height} height
 */
export function getRealHeight(element) {
  var height = 0;
  if (element.children().length > 0) {
    var temp = $("<div></div>");
    temp.append(element.children());
    height = element.height();
    element.append(temp.children());
  } else {
    var html = element.html();
    element.html("");
    height = element.height();
    element.html(html);
  }
  return height;
}

d3.selection.prototype.appendHTML = d3.selection.enter.prototype.appendHTML = function (
  HTMLString
) {
  return this.select(function () {
    return this.appendChild(
      document.importNode(
        new DOMParser().parseFromString(HTMLString, "text/html").body
          .childNodes[0],
        true
      )
    );
  });
};

// -------------------------------------
// -------- General helpers ------------
// -------------------------------------

/**
 * Helper function to initialise the variables in headstart.js
 */
export const BrowserDetect = require("exports?BrowserDetect!../lib/browser_detect.js")

export function initVar(variable, default_value) {
    return typeof variable !== 'undefined' ? variable : default_value;
}

/**
 * Move nodes backwards in DOM
 */
export function toBack(node) {
    node.parentNode.insertBefore(node, node.parentNode.childNodes[1]);
}

/**
 * Move nodes forward in DOM
 */
export function toFront(node) {
    node.parentNode.appendChild(node);
}

/**
 * Debounce any function
 */
export function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// -------------------------------------
// ---------- Text Modification --------
// -------------------------------------

export function highlight(str) {

    let new_str = "";

    for (var i = 0, len = str.length; i < len; i++) {
        new_str += str[i] + "[\\u00AD]*";
    }

    let value = new RegExp(new_str, "i");

    $('.highlightable, .large.highlightable, .list_details.highlightable').highlightRegex(value, {
        attrs: { 'style': "background:yellow" }
    });
}

export function clear_highlights() {
    $('.highlightable').highlightRegex();
}

const Hypher = require('hypher');
const english = require('hyphenation.en-us');
export const h = new Hypher(english);

// -------------------------------------
// -------------- Drawing --------------
// -------------------------------------

/**
 * Determines the actual height of the element
 * @param {element} element
 * @return {height} height
 */
export function getRealHeight(element) {
    var height = 0;
    if (element.children().length > 0) {
        var temp = $('<div></div>');
        temp.append(element.children());
        height = element.height();
        element.append(temp.children());
    } else {
        var html = element.html();
        element.html('');
        height = element.height();
        element.html(html);
    }
    return height;
}

// functions which are not being called at the moment, but might
// mausrad -> zoomen
export function redraw() {
    chart.attr("transform",
        "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

export function redraw_drag(x, y, dx, dy) {
    console.log("redraw_drag");
    chart.attr("transform",
        "translate(" + dx + ", " + dy + ")");
}
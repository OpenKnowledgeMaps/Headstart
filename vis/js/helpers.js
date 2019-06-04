import 'lib/highlightRegex.min.js';

// -------------------------------------
// -------- General helpers ------------
// -------------------------------------

export const BrowserDetect = require("exports-loader?BrowserDetect!../lib/browser_detect.js");

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


/*
 * just a wrapper to avoid confusing function call
 */
export function hideSibling(circle) {
    d3.select(circle.nextSibling).style("visibility", "hidden");
}


/**
 * Debounce any function
 */
export function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        let context = this,
                args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}

// -------------------------------------
// ---------- Text Modification --------
// -------------------------------------

export function sortBy(field) {
    d3.selectAll("#list_holder")
            .sort(function (a, b) {
                if (field === "year") {
                    return stringCompare(a[field], b[field], "desc");
                } else if (field === "citations" || field === "readers" || field === "tweets") {
                    return stringCompare(a[field], b[field], "desc");
                } else {
                    return stringCompare(a[field], b[field], "asc");
                }
            });
}

function stringCompare(a, b, sort_order) {
    if (typeof a == 'undefined' || typeof b == 'undefined') {
        return;
    } else if (typeof a == 'string' && typeof b == 'string') {
        if (a === "" || a === null)
            return 1;
        if (b === "" || b === null)
            return -1;
        
        
        if (sort_order === "desc") {
            let c = a;
            a = b;
            b = c;
        }
        
        a = a.toLowerCase();
        b = b.toLowerCase();
        
        if (a === b)
            return 0;
  
        return a < b ? -1 : 1;
    } else if ((typeof a === "string" && typeof b === "number") || (typeof a === "number" && typeof b === "string")) {
        
        if (a === "N/A" || a === "n/a" || typeof a !== "number")
            return 1;
        if (b === "N/A" || b === "n/a" || typeof b !== "number")
            return -1;
        if (a === b)
            return 0;

        if (sort_order === "desc") {
            return d3.descending(a, b);
        } else {
            return d3.ascending(a, b);
        }
    
    } else if (typeof a == 'number' && typeof b == 'number') {
        if (sort_order === "desc") {
            return d3.descending(a, b);
        } else {
            return d3.ascending(a, b);
        }
    } else {
        if (sort_order === "desc") {
            return d3.descending(a, b);
        } else {
            return d3.ascending(a, b);
        }
    }
}

export function highlight(str) {

    let new_str = "";

    for (var i = 0, len = str.length; i < len; i++) {
        new_str += str[i] + "[\\u00AD]*";
    }

    let value = new RegExp(new_str, "i");

    $('.highlightable, .large.highlightable, .list_details.highlightable').highlightRegex(value, {
        attrs: {'style': "background:yellow"}
    });
}

export function clear_highlights() {
    $('.highlightable').highlightRegex();
}

// const Hypher = require('hypher').default;
// const english = require('hyphenation.en-us');
// export const h = new Hypher(english);

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

export function updateTags(current_context, overall_context, div, attribute, display) {
    div.html("");
    if(attribute === "none") return;
       
    for(let element in current_context) {
        let statistic = current_context[element];

        if(statistic.share <= 0) {
            continue;
        }

        div
        .style("display", function () { return ((display)?("block"):("none")) })
        .append("span")
            .html(statistic.id)
            .attr("class", function () {
                let overall_statistic = overall_context.filter(function (el) {
                    return statistic.id === el.id;
                });

                let current_overall_statistic = overall_statistic[0];

                if (statistic.share <= current_overall_statistic.share) {
                    return "lower_value";
                } else {
                    return "higher_value"
                }

            })
            .attr("title", statistic.name)
    }

}

// functions which are not being called at the moment, but might
// mausrad -> zoomen
// export function redraw() {
//     chart.attr("transform",
//         "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
// }

// export function redraw_drag(x, y, dx, dy) {
//     console.log("redraw_drag");
//     chart.attr("transform",
//         "translate(" + dx + ", " + dy + ")");
// }

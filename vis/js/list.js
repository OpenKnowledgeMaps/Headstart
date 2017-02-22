// StateMachine for List UI element in Headstart
// Filename: list.js
import StateMachine from 'javascript-state-machine';

import config from 'config';
import { mediator } from 'mediator';
import { debounce, highlight, clear_highlights, sortBy, getRealHeight } from 'helpers';

const listTemplate = require('templates/list/list_explorer.handlebars');
const selectButtonTemplate = require('templates/list/select_button.handlebars');
const listEntryTemplate = require("templates/list/list_entry.handlebars");

export const list = StateMachine.create({

    events: [
        { name: "start",  from: "none",    to: "hidden"  },
        { name: "show",   from: "hidden",  to: "visible" },
        { name: "hide",   from: "visible", to: "hidden"  },
        { name: "toggle", from: "hidden",  to: "visible" },
        { name: "toggle", from: "visible", to: "hidden"  },
    ],

    callbacks: {
        onbeforestart: function( event, from, to) {
            this.width = config.list_width;
            this.papers_list = null;
            this.drawList();
            this.populateList();
            this.initListMouseListeners();
            sortBy(config.sort_options[0]);
        },

        onshow: function() {
            d3.select("#sort_container").style("display", "block");
            d3.select("#papers_list").style("display", "block");
            d3.select("#left_arrow").text("\u25B2");
            d3.select("#right_arrow").text("\u25B2");
            d3.select("#show_hide_label").text(config.localization[config.language].hide_list);
        },

        onhide: function() {
            d3.select("#sort_container").style("display", "none");
            d3.select("#papers_list").style("display", "none");
            d3.select("#left_arrow").text("\u25BC");
            d3.select("#right_arrow").text("\u25BC");
            d3.select("#show_hide_label").text(config.localization[config.language].show_list);
        },

        onbeforetoggle: function() {
            if(this.current == "visible") {
               this.hide();
               mediator.publish("record_action","none", "hide_list", config.user_id, "none", null);
            } else  {
                this.show();
                mediator.publish("record_action","none", "show_list", config.user_id, "none", null);
            }
        }
    }
});

list.drawList = function() {
    // Load list template
    let list_explorer = listTemplate({show_list:config.localization[config.language].show_list});
    $("#list_explorer").append(list_explorer);

    // Set localized values
    $("#filter_input")
    .attr("placeholder", config.localization[config.language].search_placeholder)
    .on("input", (event) => {
        if($("#filter_input").val() !== "") {
          $("#searchclear").show();
        } else {
          $("#searchclear").hide();
        }
        debounce(this.filterList(event.target.value.split(" ")), config.debounce);
      });

    $("#searchclear").click(() => {
        $("#filter_input").val('');
        $("#searchclear").hide();
        debounce(this.filterList([""]), config.debounce);
    });

    // Add sort options
    var container = d3.select("#sort_container>ul");
    var first_element = true;
    for (let option in config.sort_options) {
      if (first_element) {
        addSortOption(container, config.sort_options[option], true);
        first_element = false;
      } else {
        addSortOption(container, config.sort_options[option], false);
      }
    }

    this.fit_list_height();
    if(!config.render_bubbles) d3.select(window).on("resize", () => { this.fit_list_height(); });

    this.papers_list = d3.select("#papers_list");
};

list.fit_list_height = function() {
  var paper_list_avail_height = null;
  const PAPER_LIST_CORRECTION = 10;
  if (!config.render_bubbles) {
    var parent_height = getRealHeight($("#" + config.tag));
    var available_height = 0;
    if (parent_height === 0) {
      available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      available_height = $("#" + config.tag).height();
    }
    available_height = available_height - 1;
    $(".list-col").width("100%");
    $(".container-headstart").css({"min-width":"300px"});
    paper_list_avail_height = available_height - $("#explorer_header").height() - PAPER_LIST_CORRECTION;
  } else {
    paper_list_avail_height = $("#subdiscipline_title").outerHeight(true) + $("#headstart-chart").outerHeight(true) - $("#explorer_header").height() - PAPER_LIST_CORRECTION;
  }
  $("#papers_list").height(paper_list_avail_height);
};

let addSortOption = function(parent, sort_option, selected) {

    let checked_val = "";
    let active_val = "";

    if (selected) {
        checked_val = "checked";
        active_val = "active";
    } else {
        checked_val = "";
        active_val = "";
    }

    let button = selectButtonTemplate({
        id: "sort_" + sort_option,
        checked: checked_val,
        label: config.localization[config.language][sort_option],
        active: active_val
    });
    $("#sort-buttons").append(button);


    // Event listeners
    $("#sort_" + sort_option).change(function() {
        sortBy(sort_option);
        mediator.publish("record_action","none", "sortBy",
          config.user_id, "listsort", null, "sort_option=" + sort_option);
    });
};

list.initListMouseListeners = function() {
    $("#show_hide_button")
        .on("mouseover", function() {
            $("#show_hide_button").addClass("hover");
        })
        .on("mouseout", function() {
            $("#show_hide_button").removeClass("hover");
        })
        .on("click", function() {
            mediator.publish("list_toggle");
        });

    d3.selectAll("#paper_list_title").on("click", function(d) {
        mediator.publish("list_title_clickable", d);
    });
};

list.getPaperNodes = function(list_data) {
    let list_entry = listEntryTemplate();

    return this.papers_list.selectAll("div")
        .data(list_data)
        .enter()
        .append("div")
        .attr("id", "list_holder")
        .html(list_entry)
        .sort(function(a, b) {
            return b.readers - a.readers; });
};

list.updateByFiltered = function() {
    list.papers_list.selectAll("#list_holder")
      .style("display", function (d) {
          return d.filtered_out ? "none" : "inline";
      });
};

list.filterListByAreaURIorArea = function(area) {
    list.papers_list.selectAll("#list_holder")
      .filter(function (x) {
          return (config.use_area_uri) ? (x.area_uri != area.area_uri) : (x.area != area.title);
      })
      .style("display", "none");
};

list.filterListByArea = function(area) {
    d3.selectAll("#list_holder")
      .filter(function (x) {
          return (config.use_area_uri) ? (x.area_uri == area.area_uri) : (x.area == area.title);
      })
      .style("display", function (d) {
          return d.filtered_out ? "none" : "inline";
      });
};

list.populateMetaData = function(nodes) {
    nodes[0].forEach(function(elem) {
        var list_metadata = d3.select(elem).select(".list_metadata");

        list_metadata.select("#paper_list_title")
            .html(function(d) {
                return d.title;
            });

        list_metadata.select(".outlink")
            .attr("href", function(d) {
                return d.outlink;
            })
            .on("click", function() { d3.event.stopPropagation(); });

        list_metadata.select("#open-access-logo_list")
                .style("display", function (d) {
                    if (d.oa === false) {
                        return "none";
                    }
                });

        var paper_link = list_metadata.select(".link2");

        paper_link.style("display", function (d) {
                    if (d.oa === false) {
                        return "none";
                    }
                });

        paper_link.attr("href", function (d) {
            return d.oa_link;
        });

        list_metadata.select(".list_authors")
            .html(function(d) {
                return d.authors_string; });

        list_metadata.select(".list_published_in")
            .html(function(d) {
                return d.published_in; });

        list_metadata.select(".list_pubyear")
            .html(function(d) {
                return " (" + d.year + ")"; });

        // Following part should probably be moved to a separate function
        var paper_title = d3.select(elem).select("#list_title");
        paper_title.filter(function(d) {
                return d.recommended == 1 && d.bookmarked != 1;
            })
            .append("span")
            .attr("class", "recommended")
            .html("recommended")
            .append("span")
            .html(" ");

        if (config.is_adaptive) {
            paper_title.filter(function(d) {
                    return (d.bookmarked != 1);
                })
                .append("span")
                .attr("class", "tobookmark")
                .attr("id", "bookmark")
                .html("Add to schedule")
                .on("click", function(d) {
                    mediator.publish("bookmark_added", d);
                    d3.event.stopPropagation();
                });
        }

        paper_title.filter(function(d) {
                return (d.bookmarked == 1);
            })
            .append("span")
            .attr("class", "bookmarked")
            .attr("id", "bookmark")
            .html("Already in your schedule X")
            .on("click", function(d) {
                mediator.publish("bookmark_removed", d);
                d3.event.stopPropagation();
            });
    });
};

list.createAbstracts = function(nodes) {
    nodes[0].forEach((elem) => {
        d3.select(elem).select("#list_abstract")
            .html((d) => {
                return this.createAbstract(d, config.abstract_small);
            });
    });

    this.createHighlights(this.current_search_words);
};

list.populateReaders = function(nodes) {
    nodes[0].forEach(function(elem) {
        var areas = d3.select(elem).select("#list_area");
        var readers = d3.select(elem).select(".list_readers");

        areas.select(".area_tag").html(function() {
            return config.localization[config.language].area + ":";
        });

        areas.select(".area_name").html(function(d) {
            return d.area;
        });

        if (!config.content_based) {
            readers.select(".num_readers")
                .html(function(d) {
                    return d.readers;
                });
            readers.select(".list_readers_entity")
                .html(config.base_unit);

        } else {
            readers.style("line-height", "0px");
        }
    });
};


list.populateList = function() {
    var list_data = mediator.current_bubble.data;
    list_data.filter(function(el){
        return el !== null;
    });

    var paper_nodes = this.getPaperNodes(list_data);

    this.populateMetaData(paper_nodes);
    this.createAbstracts(paper_nodes);
    this.populateReaders(paper_nodes);
};

list.filterList = function (search_words) {
    this.current_search_words = search_words;

    search_words = search_words.map(function (e) {
        e = e.trim().toLowerCase();
        return e;
    });

    this.createHighlights(search_words);

    // Full list of items in the map/list
    let all_list_items = d3.selectAll("#list_holder");
    let all_map_items = d3.selectAll(".paper");
    //TODO why not mediator.current_circle
    let current_circle = d3.select(mediator.current_zoom_node);

    let filtered_list_items = all_list_items
            .filter(function (d) {
                if (mediator.is_zoomed === true) {
                    if (config.use_area_uri && mediator.current_enlarged_paper === null) {
                        return current_circle.data()[0].area_uri == d.area_uri;
                    } else if (config.use_area_uri && mediator.current_enlarged_paper !== null) {
                       return mediator.current_enlarged_paper.id == d.id;
                    } else {
                        return current_circle.data()[0].title == d.area;
                    }
                } else {
                    return true;
                }
            });

    // Filter out items based on searchterm
    let filtered_map_items = all_map_items
                .filter(function (d) {
                            if (mediator.is_zoomed === true) {
                                if (config.use_area_uri) {
                                    return current_circle.data()[0].area_uri == d.area_uri;
                                } else {
                                    return current_circle.data()[0].title == d.area;
                                }
                            } else {
                                return true;
                            }
                        });

    // Deal with selected papers in list
    let selected_list_items = filtered_list_items
        .filter(function(d) {
            if (d.paper_selected === true) {
                return true;
            }
        });

    if (selected_list_items[0].length === 0) {
        selected_list_items = filtered_list_items;
    }

    if (search_words[0].length === 0) {
        selected_list_items.style("display", "block");
        filtered_map_items.style("display", "block");

        mediator.current_bubble.data.forEach(function (d) {
            d.filtered_out = false;
        });

        return;
    }

    selected_list_items.style("display", "inline");
    filtered_map_items.style("display", "inline");

    mediator.publish("record_action", "none", "filter", config.user_id, "filter_list", null, "search_words=" + search_words);

    this.hideEntries(all_list_items, search_words);
    this.hideEntries(all_map_items, search_words);

};

list.hideEntries = function(object, search_words) {
    object
            .filter(function (d) {
                let abstract = d.paper_abstract.toLowerCase();
                let title = d.title.toLowerCase();
                let authors = d.authors_string.toLowerCase();
                let journals = d.published_in.toLowerCase();
                let year = d.year;
                let word_found = true;
                let count = 0;
                if (typeof abstract !== 'undefined') {
                    while (word_found && count < search_words.length) {
                        word_found = (abstract.indexOf(search_words[count]) !== -1 ||
                            title.indexOf(search_words[count]) !== -1 ||
                            authors.indexOf(search_words[count]) !== -1 ||
                            journals.indexOf(search_words[count]) !== -1 ||
                            year.indexOf(search_words[count]) !== -1);
                        count++;
                    }
                    d.filtered_out = word_found ? false : true;
                    return d.filtered_out;
                } else {
                    d.filtered_out = true;
                    return false;
                }
            })
            .style("display", "none");
};

list.createHighlights = function (search_words) {
    if(typeof search_words === "undefined") {
        return;
    }

    clear_highlights();
    search_words.forEach(function (str) {
        highlight(str);
    });
};

// called quite often
list.createAbstract = function(d, cut_off) {
    if (typeof d.paper_abstract === "undefined")
        return "";

    if(cut_off) {
        if(d.paper_abstract.length > cut_off) {
            return d.paper_abstract.substr(0,cut_off) + "...";
        }
    }
    return d.paper_abstract;
};

list.addBookmark = function(d) {
    $.getJSON(this.headstart_server + "services/addBookmark.php?user_id=" + config.user_id + "&content_id=" + d.id, function(data) {
        console.log("Successfully added bookmark");

        mediator.publish("record_action", d.id, "add_bookmark", config.user_id, d.bookmarked + " " + d.recommended, data);

        d.bookmarked = true;

        d3.selectAll("#bookmark").filter(function(x) {
                return x.id == d.id;
            })
            .attr("class", "bookmarked")
            .html("Already in your schedule X")
            .on("click", function(d) {
                mediator.publish("bookmark_removed", d);
                d3.event.stopPropagation();
            });

        d3.selectAll("#region").filter(function(x) {
                return x.id == d.id;
            })
            .attr("class", "framed_bookmarked");
    });
};

list.removeBookmark = function(d)  {
  $.getJSON(this.headstart_server + "services/addBookmark.php?user_id=" + config.user_id + "&content_id=" + d.id, function(data) {
        console.log("Successfully removed bookmark");

        mediator.publish("record_action",d.id, "remove_bookmark", config.user_id, d.bookmarked + " " + d.recommended, data);

        d.bookmarked = false;

        d3.selectAll("#bookmark").filter(function(x) {
         return x.id == d.id;
       })
            .attr("class", "tobookmark")
            .html("Add to schedule")
             .on("click", function (d) {
                mediator.publish("bookmark_added", d);
               d3.event.stopPropagation();
             });

        d3.selectAll("#region").filter(function (x) {
          return x.id == d.id;
        })
            .attr("class", function (d) {
              return (d.recommended)?("framed_recommended"):("unframed");
            });
      });
};

list.makeTitleClickable = function(d) {
    mediator.publish("list_click_paper_list", d);
    mediator.publish("record_action", d.id, "click_paper_list", config.user_id, d.bookmarked + " " + d.recommended, null);
    d3.event.stopPropagation();
};



list.enlargeListItem = function(d) {
    if(mediator.current_enlarged_paper !== null) {
      if(mediator.current_enlarged_paper.id == d.id) {
        return;
      } else {
        this.reset();
        mediator.current_enlarged_paper.paper_selected = false;
      }
    }

    this.setListHolderDisplay(d);

    this.papers_list.selectAll("#list_abstract")
                    .html(this.createAbstract(d,config.abstract_large));

    this.createHighlights(this.current_search_words);

    this.setImageForListHolder(d);
    d.paper_selected = true;
};

list.setListHolderDisplay = function(d) {
  this.papers_list.selectAll("#list_holder")
    .filter(function (x) {
        if (config.use_area_uri) {
          return (x.area_uri == d.area_uri);
        } else {
          return (x.area == d.area);
        }
    })
  .style("display", function (d) { return d.filtered_out?"none":"inline"; })
        .select(".list_entry").attr("class", "list_entry_full");

  this.papers_list.selectAll("#list_holder")
    .filter(function (x) {
      return (x.id != d.id);
    })
  .style("display", "none");
};

// recreates abstracts, if we zoom out from circle
list.reset = function() {

    d3.selectAll("#list_abstract")
    .html((d) => {
        return this.createAbstract(d, config.abstract_small);
    });

    this.createHighlights(this.current_search_words);

    d3.selectAll(".list_entry_full").attr("class", "list_entry");

    if (mediator.current_enlarged_paper !== null) {
      this.notSureifNeeded();
    }
};

list.checkIfFileAvailable = function(fileurl) {
    var http = new XMLHttpRequest();
    http.open('HEAD', fileurl, false);
    http.send();
    if (http.status != 404) {
        return true;
    } else {
        return false;
    }
};

// display a preview image of paper and page if preview image is
// available
list.loadAndAppendImage = function(image_src, page_number) {
    if(this.checkIfFileAvailable(image_src)) {
        let paper_frame = d3.select("#images_holder");

        paper_frame.append("div")
            .attr("id", "preview_page_index")
            .html("Page " + page_number);

        paper_frame.append("img")
            .attr("id", "preview_page")
            .attr("src", image_src);
        return true;
    } else {
        return false;
    }
};

list.writePopup = function(pdf_url) {
    $("#pdf_iframe").attr('src', 'about:blank');
    setTimeout(function() {
        $("#pdf_iframe")
            .attr("src", function() {
                let viewer = config.server_url + "services/pdfjs-hypothesis/web/viewer.html";
                return viewer + "?file=" + pdf_url; //#view=FitH
            })
            .attr("scrolling", "no");
    }, 100);

    $("#spinner-iframe").hide();
    $("#pdf_iframe").show();
};


list.populateOverlay = function(d) {
    let this_d = d;
    if (config.preview_type == "image") {
        $("#spinner-images").show();
        $("#images_holder").hide();
        $("#status").hide();
        $("#images_modal").modal({keyboard:true});

        let images_finished = false;
        let counter = 1;

        while (!images_finished) {
            let image_src = "paper_preview/" + d.id + "/page_" + counter + ".png";
            if (!this.loadAndAppendImage(image_src, counter)) {
                images_finished = true;
            }
            counter++;
        }

        $("#spinner-images").hide();
        $("#images_holder").show();
    } else if (config.preview_type == "pdf") {
        let filename = this_d.id + ".PDF";
        let pdf_url = filename.replace("/", "__");
        $("#status").hide();

        if (this.checkIfFileAvailable(config.server_url + "paper_preview/" + pdf_url)) {
            this.writePopup(config.server_url + "paper_preview/" + pdf_url);
            $("#iframe_modal").modal({keyboard:true});
        } else {
            $("#spinner-iframe").show();
            $("#pdf_iframe").hide();
            $("#iframe_modal").modal({keyboard:true});

            let article_url = d.oa_link;

            $.getJSON(config.server_url + "services/getPDF.php?url=" + article_url + "&filename=" + pdf_url, (data) => {
                if (data.status === "success") {
                    this.writePopup(config.server_url + "paper_preview/" + pdf_url);
                } else if (data.status === "error") {
                     $("#spinner-iframe").hide();
                     $("#status").html("Sorry, we were not able to retrieve the PDF for this publication. You can get it directly from <a href=\"" + this_d.outlink + "\" target=\"_blank\">this website</a>.");
                     $("#status").show();
                }

            }).fail((d, textStatus, error) => {
                console.error("getJSON failed, status: " + textStatus + ", error: "+error);
                $("#spinner-iframe").hide();
                $("#status").html("Sorry, we were not able to retrieve the PDF for this publication. You can get it directly from <a href=\"" + this_d.outlink + "\" target=\"_blank\">this website</a>.");
                $("#status").show();
            });
        }
    }
};

list.setImageForListHolder = function(d) {

    var current_item = this.papers_list.selectAll("#list_holder")
        .filter(function(x) {
            return (x.id == d.id);
        });

    let image_src = "paper_preview/" + d.id + "/page_1.png";
    let pdf_preview = require("images/preview_pdf.png");
    if (config.preview_type == "image") {
        if (this.checkIfFileAvailable(image_src)) {
            current_item.append("div")
            .attr("id", "preview_image")
            .style("width", config.preview_image_width_list + "px")
            .style("height", config.preview_image_height_list + "px")
            .style("background", "url(" + image_src + ")")
            .style("background-size", config.preview_image_width_list + "px, " + config.preview_image_height_list + "px")
            .on("mouseover", function() {
                mediator.publish("preview_mouseover", current_item);
            })
            .on("mouseout", function() {
                mediator.publish("preview_mouseout", current_item);
            })
            .append("div")
            .attr("id", "transbox")
            .style("width", config.preview_image_width_list + "px")
            .style("height", config.preview_image_height_list + "px")
            .html("Click here to open preview")
            .on("click", function() {
                mediator.publish("list_show_popup", d);
            });
        }
    } else {
        if(d.oa === false) {
            return;
        }

        current_item.append("div")
            .attr("id", "preview_image")
            .style("width", config.preview_image_width_list + "px")
            .style("height", config.preview_image_height_list + "px")
            .style("background", "url(" + pdf_preview + ")")
            .style("background-size", config.preview_image_width_list + "px, " + config.preview_image_height_list + "px")
            .on("mouseover", function() {
                mediator.publish("preview_mouseover", current_item);
            })
            .on("mouseout", function() {
                mediator.publish("preview_mouseout", current_item);
            })
            .append("div")
            .attr("id", "transbox")
            .style("width", config.preview_image_width_list + "px")
            .style("height", config.preview_image_height_list + "px")
            .html("Click here to open preview")
            .on("click", function() {
                mediator.publish("list_show_popup", d);
            });
    }

            // EVENTLISTENERS
        current_item.select("#paper_list_title")
            .on("click", function(d) {
                mediator.publish("list_title_click", d);
            });
};

list.createOutlink = function(d) {

    var url = false;
    if (config.url_prefix !== null) {
        url = config.url_prefix + d.url;
    } else if (typeof d.url != 'undefined') {
        url = d.url;
    }

    return url;
};

list.title_click = function (d) {

      var url = d.outlink;
      if (url === false) {
          d3.event.stopPropagation();
          return;
      }

      mediator.publish("record_action",d.id, "click_on_title", config.user_id, d.bookmarked + " " + d.recommended, null, "url=" + d.url);

      window.open(url, "_blank");
      d3.event.stopPropagation();
    };

// Yes it is currently needed. :D
list.notSureifNeeded = function() {
    var list_holders_local =
        this.papers_list.selectAll("#list_holder")
        .filter(function(d) {
            return (mediator.current_enlarged_paper.id == d.id);
        });

    list_holders_local.select("#paper_list_title")
        // EVENTLISTENERS
        .on("click", function(d) {
            mediator.publish("list_title_clickable", d);
        });

    var image_node = list_holders_local.select("#preview_image").node();
    if (image_node !== null) {
        image_node.parentNode.removeChild(image_node);
    }
};


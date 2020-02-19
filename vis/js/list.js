// StateMachine for List UI element in Headstart
// Filename: list.js
import StateMachine from 'javascript-state-machine';
import "../lib/jquery-ui.min.js";


import config from 'config';
import {
    mediator
} from 'mediator';
import {
    debounce,
    highlight,
    clear_highlights,
    sortBy,
    getRealHeight,
    updateTags
} from 'helpers';
import { io } from 'io';

const listTemplate = require('templates/list/list_explorer.handlebars');
const selectButtonTemplate = require('templates/list/select_button.handlebars');
const listEntryTemplate = require("templates/list/list_entry.handlebars");
const listEntryTemplateLinkedCat = require("templates/list/linkedcat/list_entry_linkedcat.handlebars");
const listEntryTemplateCris = require("templates/list/cris/list_entry_cris.handlebars");
const listSubEntryTemplateCris = require("templates/list/cris/list_subentry_cris.handlebars");
const listSubEntryStatisticsTemplateCris = require("templates/list/cris/list_subentry_statistics_cris.handlebars");
const listSubEntryStatisticDistributionTemplateCris = require("templates/list/cris/list_subentry_statistic_distribution_cris.handlebars");
const doiOutlinkTemplate = require("templates/list/doi_outlink.handlebars");
const listMetricTemplate = require('templates/list/list_metrics.handlebars');
const filterDropdownEntryTemplate = require("templates/list/filter_dropdown_entry.handlebars");
const showHideLabel = require("templates/list/show_hide_label.handlebars")
const sortDropdownEntryTemplate = require("templates/list/sort_dropdown_entry.handlebars");
const legendTemplate = require("templates/toolbar/cris_legend.handlebars");

export const list = StateMachine.create({

    events: [{
        name: "start",
        from: "none",
        to: "hidden"
    }, {
        name: "show",
        from: "hidden",
        to: "visible"
    }, {
        name: "hide",
        from: "visible",
        to: "hidden"
    }, {
        name: "toggle",
        from: "hidden",
        to: "visible"
    }, {
        name: "toggle",
        from: "visible",
        to: "hidden"
    }, ],

    callbacks: {
        onbeforestart: function(event, from, to) {
            this.width = config.list_width;
            this.papers_list = null;
            this.drawList();
            this.populateList();
            this.initListMouseListeners();
            if(config.initial_sort === null) {
              sortBy(config.sort_options[0]);
            } else {
              sortBy(config.initial_sort);
            }
            this.current_search_words = []
            this.current_filter_param = ''
            debounce(this.count_visible_items_to_header, config.debounce)()
        },

        onshow: function() {
            d3.select("#sort_container").style("display", "inline-block");
            d3.select("#papers_list").style("display", "block");
            d3.select("#left_arrow").text("\u25B2");
            d3.select("#right_arrow").text("\u25B2");
            d3.select("#show_hide_label").html(showHideLabel({
                show_or_hide_list: config.localization[config.language].hide_list,
                items: config.localization[config.language].items,
                item_count: this.list_item_count,
            }));
            this.fit_list_height();
            list.count_visible_items_to_header();
        },

        onhide: function() {
            d3.select("#sort_container").style("display", "none");
            d3.select("#papers_list").style("display", "none");
            d3.select("#left_arrow").text("\u25BC");
            d3.select("#right_arrow").text("\u25BC");
            d3.select("#show_hide_label").html(showHideLabel({
                show_or_hide_list: config.localization[config.language].show_list,
                items: config.localization[config.language].items,
                item_count: this.list_item_count,
            }));
            list.count_visible_items_to_header();
        },

        onbeforetoggle: function() {
            if (this.current == "visible") {
                this.hide();
                mediator.publish("record_action", config.files[mediator.current_file_number].file, "List", "hide", config.user_id, "none", null);
            } else {
                this.show();
                mediator.publish("record_action", config.files[mediator.current_file_number].file, "List", "show", config.user_id, "none", null);
            }
        }
    }
});

list.drawList = function() {
    let self = this;

    // Load list template
    let list_explorer = listTemplate({
        show_list: config.localization[config.language].show_list,
        filter_dropdown: config.filter_menu_dropdown,
        filter_by_label: config.localization[config.language].filter_by_label,
        items: config.localization[config.language].items,
        dropdown: config.sort_menu_dropdown,
        sort_by_label: config.localization[config.language].sort_by_label,
    });
    $("#list_explorer").append(list_explorer);
    
    // Set localized values
    let timer;
    let delay = 300;
    $("#filter_input")
        .attr("placeholder", config.localization[config.language].search_placeholder)
        .on("input", (event) => {
            if ($("#filter_input").val() !== "") {
                $("#searchclear").show();
            } else {
                $("#searchclear").hide();
            }
            window.clearTimeout(timer);
            timer = window.setTimeout(function() {
                debounce(self.filterList(event.target.value.split(" ")), config.debounce);
            }, delay);
        
        });

    $("#searchclear").click(() => {
        $("#filter_input").val('');
        $("#searchclear").hide();
        debounce(this.filterList([""]), config.debounce);
    });

    // Add sort button options
    var container = d3.select("#sort_container>ul");
    const numberOfOptions = config.sort_options.length;
    if(!config.sort_menu_dropdown) {
        var first_element = true;
        for (var i = 0; i < numberOfOptions; i++) {
            if (first_element) {
                addSortOptionButton(container, config.sort_options[i], true);
                first_element = false;
            } else {
                addSortOptionButton(container, config.sort_options[i], false);
            }
        }
    } else {
        let initial_sort_option = (config.initial_sort === null)?(config.sort_options[0]):(config.initial_sort)
        $('#curr-sort-type').text(config.localization[config.language][initial_sort_option])
        for(var i=0; i<numberOfOptions; i++) {
            if(i === 0) {
                addSortOptionDropdownEntry(config.sort_options[i], true)
            } else {
                addSortOptionDropdownEntry(config.sort_options[i], false)
            }
        }
    }

    // Add filter options
    if(config.filter_menu_dropdown) {
        $('#curr-filter-type').text(config.localization[config.language]['all'])
        for (var i = 0; i < config.filter_options.length; i++) {
            if (i === 0) {
                self.addFilterOptionDropdownEntry(config.filter_options[i], true);
            } else {
                self.addFilterOptionDropdownEntry(config.filter_options[i], false);
            }
        }
    }

    if (!config.render_bubbles) d3.select(window).on("resize", () => {
        this.fit_list_height();
    });

    this.papers_list = d3.select("#papers_list");
};

list.count_visible_items_to_header = function() {
    var count = 0
    let current_circle = d3.select(mediator.current_zoom_node)
    d3.selectAll("#list_holder").filter(function(d) {
        if (mediator.is_zoomed === true) {
            if (config.use_area_uri && mediator.current_enlarged_paper === null) {
                return current_circle.data()[0].area_uri == d.area_uri;
            } else if (config.use_area_uri && mediator.current_enlarged_paper !== null) {
                return mediator.current_enlarged_paper.id == d.id;
            } else {
                return current_circle.data()[0].title == d.area;
            }
        } else if (config.is_streamgraph) {
            return this.style.display !== "none";
        } else {
            return true;
        }
    }).each(function (d) {
        if (!d.filtered_out) {
            count++
        }
    })
    $('#list_item_count').text(count)

}

list.fit_list_height = function() {
    var paper_list_avail_height = null;
    const PAPER_LIST_CORRECTION = -10;
    if (!config.render_bubbles) {
        var parent_height = getRealHeight($("#" + config.tag));
        var available_height = 0;
        if (parent_height === 0) {
            available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        } else {
            available_height = $("#" + config.tag).height();
        }

        $(".list-col").width("100%");
        $(".container-headstart").css({
            "min-width": "300px"
        });
        paper_list_avail_height = available_height - $("#explorer_header").outerHeight(true);
    } else {
        paper_list_avail_height = 
                $("#subdiscipline_title").outerHeight(true)
                    + $("#headstart-chart").outerHeight(true)
                    - $("#show_hide_button").outerHeight(true) 
                    - $("#explorer_options").outerHeight(true)
                    + ($(".legend").outerHeight(true) || 0)
                    - PAPER_LIST_CORRECTION
                    - (parseInt($("#papers_list").css("padding-top"), 10) || 0)
    }
    $("#papers_list").height(paper_list_avail_height);
};

list.changeHeaderColor = function(color) {
    d3.select("#explorer_options")
            .style("border-bottom", "5px solid " + color)
}

list.resetHeaderColor = function() {
    d3.select("#explorer_options")
            .style("border-bottom", "")
}

let addSortOptionDropdownEntry = function(sort_option, first_item) {
    let entry = sortDropdownEntryTemplate({
        sort_by_string: config.localization[config.language].sort_by_label,
        sorter_label: config.localization[config.language][sort_option],
    })
    var newEntry = $(entry).appendTo('#sort-menu-entries')
    if(first_item === true && config.initial_sort === null) {
        newEntry.addClass('active')
    } else if (config.initial_sort === sort_option) {
        newEntry.addClass('active')
    }
    
    newEntry.on("click", () => {
        sortBy(sort_option)
        mediator.publish("record_action", config.localization[config.language][sort_option], "List", "sortBy", config.user_id, "listsort", null, "sort_option=" + sort_option)
        $('#curr-sort-type').text(config.localization[config.language][sort_option])
        $('.sort_entry').removeClass('active');
        newEntry.addClass("active")
    })
}

let addSortOptionButton = function(parent, sort_option, selected) {

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
        mediator.publish("record_action", config.localization[config.language][sort_option], "List", "sortBy",
            config.user_id, "listsort", null, "sort_option=" + sort_option);
    });
};

list.addFilterOptionDropdownEntry = function (filter_option, first_item) {
    let entry = filterDropdownEntryTemplate({
        filter_by_string: config.localization[config.language].filter_by_label,
        filter_label: config.localization[config.language][filter_option]
    })
    var newEntry = $(entry).appendTo('#filter-menu-entries')
    if(first_item === true) {
        newEntry.addClass('active')
    }
    
    newEntry.on("click", () => {
        this.filterList(undefined, filter_option)
        $('#curr-filter-type').text(config.localization[config.language][filter_option])
        $('.filter_entry').removeClass('active');
        newEntry.addClass("active")
    })
}

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
    if ((config.list_sub_entries)) {
        let list_entry = listEntryTemplateCris();

        return this.papers_list.selectAll("div")
            .data(list_data)
            .enter()
            .append("div")
            .attr("id", "list_holder")
            .html(list_entry)
            .sort(function(a, b) {
                return b.internal_readers - a.internal_readers;
            });
            
    } else if(config.service === "linkedcat") {
        let list_entry = listEntryTemplateLinkedCat();

        return this.papers_list.selectAll("div")
            .data(list_data)
            .enter()
            .append("div")
            .attr("id", "list_holder")
            .html(list_entry)
            .sort(function(a, b) {
                return b.internal_readers - a.internal_readers;
            });
    } else {
        let list_entry = listEntryTemplate();

        return this.papers_list.selectAll("div")
            .data(list_data)
            .enter()
            .append("div")
            .attr("id", "list_holder")
            .attr("class", function (d) {
                if (d.resulttype === "dataset") {
                    return "resulttype-dataset";
                } else {
                    return "resulttype-paper";
                }
            })
            .html(list_entry)
            .sort(function(a, b) {
                return b.internal_readers - a.internal_readers;
            });
        }
};

list.updateByFiltered = function() {
    list.papers_list.selectAll("#list_holder")
        .style("display", function(d) {
            return d.filtered_out ? "none" : "inline";
        });
};

list.filterListByAreaURIorArea = function(area) {
    list.papers_list.selectAll("#list_holder")
        .filter(function(x) {
            return (config.use_area_uri) ? (x.area_uri != area.area_uri) : (x.area != area.title);
        })
        .style("display", "none");
};

list.filterListByArea = function(area) {
    d3.selectAll("#list_holder")
        .filter(function(x) {
            if (config.use_area_uri) {
                //TODO: hotfix for issue with backlinks for older maps
                let curr_area_uri = (Array.isArray(x.area_uri)) ? (x.area_uri[0]) : (x.area_uri);
                let target_area_uri = (Array.isArray(area.area_uri)) ? (area.area_uri[0]) : (area.area_uri);
                return curr_area_uri == target_area_uri;
            } else {
                return x.area == area.title;
            }
        })
        .style("display", function(d) {
            return d.filtered_out ? "none" : "inline";
        });
};

list.filterListByKeyword = function(keyword) {
    d3.selectAll("#list_holder").style("display", "none");
    
    d3.selectAll("#list_holder")
        .filter(function(x) {
            if (typeof x.subject_orig === "undefined") {
                x.subject_orig = "";
            }
            let keywords = x.subject_orig.split("; ");
            let contains_keyword = keywords.includes(keyword);
            return contains_keyword
        })
        .style("display", function(d) {
            return d.filtered_out ? "none" : "inline";
        });
};

list.updateVisualDistributions = function(attribute, context) {
    let nodes = d3.selectAll("#list_holder");
    nodes[0].forEach(function(elem) {
        let d = d3.select(elem).datum();
        let overall_context = context.distributions_all[attribute];
        let current_context = context.distributions_papers[d.id][attribute];
        let list_visual_distributions = d3.select(elem).select(".list_visual_dstributions");
        
        updateTags(current_context, overall_context, list_visual_distributions, attribute, true);
        
    })
    
};

list.populateMetaData = function(nodes) {
    nodes[0].forEach(function(elem) {
        var list_metadata = d3.select(elem).select(".list_metadata");

        list_metadata.select(".list_title")
            .attr("class", function(d) {
                if (d.oa) {
                    return "list_title oa"
                } else {
                    return "list_title"
                }
            })

        list_metadata.select("#file-icon_list")
            .style("display", function (d) {
                if (d.resulttype == "dataset") {
                    return "none"
                }
                else {
                    return "inline"
                }
            })

        list_metadata.select("#dataset-icon_list")
            .style("display", function (d) {
                if (d.resulttype == "dataset") {
                    return "inline"
                }
                else {
                    return "none"
                }
            })

        list_metadata.select("#paper_list_title")
            .html(function(d) {
                return d.title;
            });

        list_metadata.select(".outlink")
            .attr("href", function(d) {
                return d.outlink;
            })
            .attr("class", function(d){
                if(d.oa){
                    return "oa-link oa-link-hidden"
                }
                return "outlink"
            })
            .on("click", function() {
                d3.event.stopPropagation();
            });

        list_metadata.select("#open-access-logo_list")
            .style("display", function(d) {
                if (d.oa === false) {
                    return "none";
                }
            });
              
        var paper_link = list_metadata.select(".link2");
        
        paper_link.style("display", function(d) {
            if (d.oa === false || d.resulttype == "dataset") {
                return "none";
            }
        });

        paper_link.on("click", function(d) {
            mediator.publish("list_show_popup", d);
        });
        /*paper_link.attr("href", function (d) {
            return "#";
        });*/

        list_metadata.select(".list_authors")
            .html(function(d) {
                return d.authors_string;
            });

        list_metadata.select(".list_published_in")
            .html(function(d) {
                //Remove the "in" if there is no publication name
                if (d.published_in === "") {
                    var parent = $(this.parentNode);
                    $(".list_in", parent).css("display", "none");
                }

                return d.published_in;
            })
        list_metadata.select(".list_pubyear")
            .html(function(d) {
                if(d.year !== "") {
                    return " (" + d.year + ")";
                } else {
                    return "";
                }
            });

        if (config.doi_outlink) {
            list_metadata.select(".doi_outlink")
            .html(function (d) {
                var has_doi = !(typeof d.doi === "undefined" || d.doi === "")
                return doiOutlinkTemplate({
                    has_doi,
                    link_label: config.localization[config.language].link,
                    link: has_doi ? "https://dx.doi.org/"+d.doi : d.link,
                    link_text: has_doi ? d.doi : d.link,
                })
            })
        } else if (config.url_outlink) {
            list_metadata.select(".doi_outlink")
            .html(function (d) {
                let has_url = false;
                return doiOutlinkTemplate({
                    has_url,
                    link_label: config.localization[config.language].link,
                    link: d.outlink,
                    link_text: d.outlink,
                })
            })
        }

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
    this.attachClickHandlerAbstract(false);
};

list.populateReaders = function(nodes) {
    let _this = this;
    nodes[0].forEach(function(elem) {
        var areas = d3.select(elem).select("#list_area");
        var readers = d3.select(elem).select(".list_readers");
        var keywords = d3.select(elem).select("#list_keywords");
        var list_metrics = d3.select(elem).select(".list_metrics");

        if(config.hide_keywords_overview) {
            keywords.style("display", "none");
        }

        if (config.show_keywords) {
            _this.fillKeywords(keywords, "keywords", "subject_orig");
        }
        
        if (config.service === "linkedcat") {
            let basic_classifications = d3.select(elem).select("#list_basic_classification");
            _this.fillKeywords(basic_classifications, "basic_classification", "bkl_caption");
        }
        
        if(config.show_area) {
            areas.select(".area_tag").html(function() {
                return config.localization[config.language].area + ":";
            });

            areas.select(".area_name").html(function(d) {
                return d.area;
            });
        }

        if (!config.content_based && config.base_unit !== "" && !config.metric_list) {
            readers.select(".num_readers")
                .html(function(d) {
                    return d.num_readers;
                });
            readers.select(".list_readers_entity")
                .html(config.base_unit);

        } else {
            readers.style("line-height", "0px");
        }

        if (config.metric_list) {
            list_metrics.html(function (d) {
                return listMetricTemplate({
                    tweets_label: config.localization[config.language].tweets_count_label,
                    tweets_count: d.cited_by_tweeters_count,
                    readers_label: config.localization[config.language].readers_count_label,
                    readers_count: d['readers.mendeley'],
                    citations_label: config.localization[config.language].citations_count_label,
                    citations_count: d.citation_count,
                })
            })
            if(!config.content_based) {
                $(".list_metrics_" + config.base_unit).addClass("scaled-metric")
            }
        }
    });
};

list.populateExternalVis = function(nodes) {
    nodes[0].forEach(function(elem) {
        let external_vis = d3.select(elem).select(".conceptgraph");
        
        if(!config.list_show_external_vis) {
            external_vis.style("display", "none")
        } else {
            external_vis.select("a")
                    .attr("href", function (d) {
                        return d.external_vis_link;
                    })
        }
    })
};

list.fillKeywords = function(tag, keyword_type, metadata_field) {
    tag.select(".keyword_tag").html(function() {
                return config.localization[config.language][keyword_type] + ":";
            });

    tag.select(".keywords").html(function(d) {
        return ((d.hasOwnProperty(metadata_field)) ? (d[metadata_field]) : (""))
    });
};

list.populateList = function() {
    var list_data = mediator.current_bubble.data;
    list_data.filter(function(el) {
        return el !== null;
    });

    var paper_nodes = this.getPaperNodes(list_data);
    this.populateMetaData(paper_nodes);
    this.createAbstracts(paper_nodes);
    this.populateReaders(paper_nodes);
    this.populateExternalVis(paper_nodes);
};

list.filterList = function(search_words, filter_param) {
    if (search_words === undefined) {
        search_words = this.current_search_words
    } else {
        mediator.publish("record_action", search_words.join(), "List", "search", config.user_id, "filter_list", null, "search_words=" + search_words);
    }

    if (filter_param === undefined) {
        filter_param = this.current_filter_param     
    } else {
        mediator.publish("record_action", filter_param, "List", "filter", config.user_id, "filter_list", null, "filter_param=" + filter_param);
    }
    
    this.current_search_words = search_words;

    search_words = search_words.map(function(e) {
        e = e.trim().toLowerCase();
        return e;
    });

    this.createHighlights(search_words);

    // Full list of items in the map/list
    let all_list_items = d3.selectAll("#list_holder");
    let all_map_items = d3.selectAll(".paper");
    //TODO why not mediator.current_circle
    let current_circle = d3.select(mediator.current_zoom_node);

    // Find all the list items, that without any filtering should be in the view
    let normally_visible_list_items = all_list_items
        .filter(function(d) {
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

    // Find items that, without any filtering, should be in the view
    let normally_visible_map_items = all_map_items
        .filter(function(d) {
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

    //Find if any paper was selected previously
    let selected_list_items = normally_visible_list_items
        .filter(function(d) {
            if (d.paper_selected === true) {
                return true;
            }
        });

    //If it wasn't then treat every normally visible paper as selected
    if (selected_list_items[0].length === 0) {
        selected_list_items = normally_visible_list_items;
    }

    //Even if the search box isn't empty make everything visible
    selected_list_items.style("display", "inline");
    normally_visible_map_items.style("display", "inline");

    //set everything that should be visible to unfiltered
    all_list_items.each(function (d) {
        d.filtered_out = false
    })

    // Now actually do the filtering (i.e. remove some object from list and map)
    this.hideEntriesByWord(all_list_items, search_words);
    this.hideEntriesByWord(all_map_items, search_words);

    this.hideEntriesByParam(all_list_items, filter_param);
    this.hideEntriesByParam(all_map_items, filter_param);
    
    debounce(this.count_visible_items_to_header, config.debounce)()
};

// Returns true if document has parameter or if no parameter is passed
list.findEntriesWithParam = function (param, d) {
    if (param === 'open_access') {
        return d.oa
    } else if (param === 'publication') {
        return d.resulttype === 'publication'
    } else if (param === 'dataset') {
        return d.resulttype === 'dataset'
    } else {
        return true
    }
    
}

// These functions only hide items. They shouldn't unhide them.
list.hideEntriesByParam = function (object, param) {
    var self = this
    object.filter(function (d) {
        if (!self.findEntriesWithParam(param, d)) {
            d.filtered_out = true
            return true
        }
        return false
    })
    .style("display", "none")
}

list.hideEntriesByWord = function(object, search_words) {
    object
        .filter(function(d) {
            let abstract = (config.list_sub_entries)?(d.abstract_search.toString().toLowerCase()):(d.paper_abstract.toString().toLowerCase());
            let title = d.title.toString().toLowerCase();
            let authors = d.authors_string.toString().toLowerCase();
            let journals = d.published_in.toString().toLowerCase();
            let year = d.year.toString();
            let word_found = true;
            let keywords = (d.hasOwnProperty("subject_orig")) ? (d.subject_orig.toString().toLowerCase()) : ("");
            let i = 0;
            while (word_found && i < search_words.length) {
                word_found = (abstract.indexOf(search_words[i]) !== -1 ||
                    title.indexOf(search_words[i]) !== -1 ||
                    authors.indexOf(search_words[i]) !== -1 ||
                    journals.indexOf(search_words[i]) !== -1 ||
                    year.indexOf(search_words[i]) !== -1 ||
                    keywords.indexOf(search_words[i]) !== -1
                );
                i++;
            }
            if (word_found === false) {
                d.filtered_out = true
                return true
            }
            return false
        })
        .style("display", "none");
};

list.createHighlights = function(search_words) {
    if (typeof search_words === "undefined") {
        return;
    }

    clear_highlights();
    if( !(search_words === "") ) {
        search_words.forEach(function(str) {
            highlight(str);
        });
    }
};

// called quite often
list.createAbstract = function(d, cut_off) {
    if(config.list_sub_entries) {
        return list.createAbstractCris(d, cut_off);
    } else {
        if (typeof d.paper_abstract === "undefined")
            return "";

        if (cut_off) {
            if (d.paper_abstract.length > cut_off) {
                return d.paper_abstract.substr(0, cut_off) + "...";
            }
        }
        return d.paper_abstract;
    }
};

list.createAbstractCris = function(d, cut_off) {
    $("[data-toggle=popover]").popover({trigger: "hover"});
    
    let list_abstract_template = listSubEntryTemplateCris();
    let list_abstract = document.createElement("div");
    
    for (let [i, elem] of d.paper_abstract.entries()) {
        let current_abstract = d3.select(list_abstract)
                .append("div")
                    .attr('class', function(x) { 
                        let new_class =  "level" + elem.level;
                        let existing_class = d3.select(this).attr("class") 
                        if (existing_class === null){
                          return new_class;
                        } else {
                            return new_class + " " + existing_class;
                        }
                    })
                    .html(list_abstract_template);
        
        let subentry_title = (config.list_sub_entries_number)?((i+1) + '. ' + elem.abstract):(elem.abstract);
        
        current_abstract.select(".list_subentry_title")
                .text(subentry_title)
        
        if(config.list_sub_entries_readers) {
            current_abstract.select(".list_subentry_readers_count")
                    .text(+elem.readers)

            current_abstract.select(".list_subentry_readers_entity")
                    .text(config.base_unit)

            if(elem.readers === "0" || elem.readers === "") {
                current_abstract.select(".list_subentry_0_count").classed("list_subentry_0_count_visible", true)
            }
        } else {
            current_abstract.select(".list_subentry_readers").html("")
        }
        
        if(cut_off && d.paper_abstract.length > 1) {
            let showmore = current_abstract.select(".list_subentry_showmore")
                                .style("display", "inline-block")
                        
            showmore.select(".list_subentry_showmore_text")
                    .text(config.localization[config.language].showmore_questions_label)
            
            showmore.select(".list_subentry_showmore_num")
                    .text(function() { 
                        return d.num_subentries;
            })
            
            showmore.select(".list_subentry_showmore_verb")
                    .text(config.localization[config.language].showmore_questions_verb)
                    
            break;
        } else {
            current_abstract.select(".list_subentry_showmore")
                    .style("display", "none")
            
            if(config.list_sub_entries_statistics && elem.readers !== "0" && elem.readers !== "") {
            
                let show_statistics = current_abstract.select(".list_subentry_show_statistics")
                        .style("display", "inline-block")

                show_statistics.select(".list_subentry_show_statistics_text")
                        .text(config.localization[config.language].distributions_label)

                show_statistics.select(".list_subentry_show_statistics_numbers")
                        .text(+elem.readers + " " + config.base_unit)

                show_statistics.select(".list_subentry_show_statistics_verb")
                        .text(config.localization[config.language].show_verb_label)

                let statistics_div = current_abstract.select(".list_subentry_statistics")

                let list_subentry_statistics = listSubEntryStatisticsTemplateCris();

                let current_context = io.context.distributions_abstracts[elem.id];

                let index_elem = 1;
                for (let context_elem in current_context) {
                    if (current_context.hasOwnProperty(context_elem)) {
                        let subentry_statistics = statistics_div.append("div").html(list_subentry_statistics);
                        subentry_statistics.select(".list_subentry_statistic_title")
                            .text(index_elem + ". " + context_elem)
                        this.createAbstractStatistics(subentry_statistics, current_context[context_elem])
                        index_elem++;
                    }
                }
            }
        }
    }
    
    return list_abstract.outerHTML;
    
};

list.createAbstractStatistics = function(div, distributions) {
    
    let list_subentry_statistics_distribution = listSubEntryStatisticDistributionTemplateCris();
    distributions.forEach(function(distribution) {
        if(distribution.share > 0) {
            let div_distribution = div.append("div")
                .html(list_subentry_statistics_distribution);
            
            div_distribution.select(".list_subentry_statistic_distribution_id").text(distribution.id);
            div_distribution.select(".list_subentry_statistic_distribution_title").text(distribution.name);
            div_distribution.select(".list_subentry_statistic_distribution_number").text(distribution.share);
        }
    })

}

list.addBookmark = function(d) {
    $.getJSON(this.headstart_server + "services/addBookmark.php?user_id=" + config.user_id + "&content_id=" + d.id, function(data) {
        console.log("Successfully added bookmark");

        mediator.publish("record_action", d.title, "Bookmark", "add", config.user_id, d.bookmarked + " " + d.recommended, data);

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

list.removeBookmark = function(d) {
    $.getJSON(this.headstart_server + "services/addBookmark.php?user_id=" + config.user_id + "&content_id=" + d.id, function(data) {
        console.log("Successfully removed bookmark");

        mediator.publish("record_action", d.title, "Bookmark", "remove", config.user_id, d.bookmarked + " " + d.recommended, data);

        d.bookmarked = false;

        d3.selectAll("#bookmark").filter(function(x) {
                return x.id == d.id;
            })
            .attr("class", "tobookmark")
            .html("Add to schedule")
            .on("click", function(d) {
                mediator.publish("bookmark_added", d);
                d3.event.stopPropagation();
            });

        d3.selectAll("#region").filter(function(x) {
                return x.id == d.id;
            })
            .attr("class", function(d) {
                return (d.recommended) ? ("framed_recommended") : ("unframed");
            });
    });
};

list.makeTitleClickable = function(d) {
    mediator.publish("list_click_paper_list", d);
    mediator.publish("record_action", d.title, "List", "paper_click", config.user_id, d.bookmarked + " " + d.recommended, null);
    d3.event.stopPropagation();
};



list.enlargeListItem = function(d) {
    if (mediator.current_enlarged_paper !== null) {
        if (mediator.current_enlarged_paper.id == d.id) {
            return;
        } else {
            this.reset();
            mediator.current_enlarged_paper.paper_selected = false;
        }
    }

    if (!config.render_bubbles) {
        return;
    }

    this.setListHolderDisplay(d);

    this.papers_list.selectAll("#list_abstract")
        .filter(function(x) {
                    return (x.id === d.id);
                })
        .html(this.createAbstract(d, config.abstract_large));

    this.createHighlights(this.current_search_words);
    
    this.attachClickHandlerAbstract(true);

    this.setImageForListHolder(d);
    
    if (config.list_additional_images) {
        this.setAdditionalImagesForListHolder(d);
    }
    
    if (config.show_keywords) {
        d3.selectAll("#list_keywords")
            .filter(function(x) {
                return (x.id === d.id);
            })
            .style("display", "block");
    }
    
    if (config.list_show_external_vis) {
        d3.selectAll('.conceptgraph').style('display', 'none');
    }
    
    this.setBacklink(d);

    d.paper_selected = true;
    this.count_visible_items_to_header()
};

list.setBacklink = function(d) {
    let current_list_holder = d3.selectAll("#list_holder")
                                .filter(function(x) {
                                        return (x.id === d.id);
                                })
    current_list_holder.append("div")
                            .attr("id", "backlink_list")
                            .attr("class", "backlink-list")
                               .append("a")
                                .attr("class", "underline")
                                .text(function() {
                                    if(config.is_streamgraph) {
                                        return config.localization[config.language].backlink_list_streamgraph;
                                    } else {
                                        return config.localization[config.language].backlink_list;
                                    }
                                })
                                .on("click", function (d) {
                                    if(config.is_streamgraph) {
                                        mediator.publish('currentstream_click');
                                    } else {
                                        mediator.publish('currentbubble_click', d);
                                    }
                                })
         
    
}

list.setAdditionalImagesForListHolder = function(d) {
    let current_item = d3.selectAll("#list_holder")
            .filter(function(x) {
                return (x.id === d.id);
            })
        
        let list_images = current_item.select(".list_images")
        list_images.append("h4")
                            .html(config.localization[config.language].intro_areas_title + d.title)
        for (let item in config.list_images) {
            let image = config.list_images[item];
                    list_images.append("h5")
                        .attr("class", "list_image_title")
                        .html(function () {
                            return (+item+1) + ". " + config.scale_label[image];
                        })
                        
                    list_images
                        .append('div')
                            .attr('class', 'statistics-image')
                        .append("img")
                            .attr("class", "list_image")
                            .attr("src", function(x) {
                                return config.list_images_path + x.id + "_" + image + ".svg";
                            })
                    
                    list_images.append("div").html(legendTemplate);
        }
}

list.attachClickHandlerAbstract = function(enlarged) {
    if(!config.list_sub_entries)
        return;
    
    $("[data-toggle=popover]").popover({trigger: "hover"});
    
    let list_holder = d3.selectAll("#list_holder");
    
    if(enlarged) {
        list_holder[0].forEach(function (element) {
            let current_list_holder = d3.select(element);
            
            current_list_holder.selectAll(".list_subentry_show_statistics").on("click", function() {
                let click_div = d3.select(d3.event.currentTarget);
                let parent_div = d3.select(d3.event.currentTarget.parentElement);
                let statistics_div = parent_div.select(".list_subentry_statistics")
                if(statistics_div.style("display") === "none") {
                    mediator.publish("record_action", parent_div.select(".list_subentry_title").text(), "List", "show_statistics", config.user_id, "none", null);
                    statistics_div.style("display", "block")
                    click_div.select(".list_subentry_show_statistics_arrow_down").style("display", "none");
                    click_div.select(".list_subentry_show_statistics_arrow_up").style("display", "inline-block");
                    click_div.select(".list_subentry_show_statistics_verb")
                        .text(config.localization[config.language].hide_verb_label)
                } else {
                    mediator.publish("record_action", parent_div.select(".list_subentry_title").text(), "List", "hide_statistics", config.user_id, "none", null);
                    statistics_div.style("display", "none")
                    click_div.select(".list_subentry_show_statistics_arrow_down").style("display", "inline-block");
                    click_div.select(".list_subentry_show_statistics_arrow_up").style("display", "none");
                    click_div.select(".list_subentry_show_statistics_verb")
                        .text(config.localization[config.language].show_verb_label)
                }
            })
        })
    } else {
               
        list_holder.select(".list_subentry_showmore").on("click", function(d) {
            mediator.publish("list_click_paper_list", d);
            mediator.publish("record_action", d.title, "List", "paper_click", config.user_id, d.bookmarked + " " + d.recommended, null);
            d3.event.stopPropagation();
        })
    }
}

list.setListHolderDisplay = function(d) {
    this.papers_list.selectAll("#list_holder")
        .filter(function(x) {
            if (config.use_area_uri) {
                return (x.area_uri == d.area_uri);
            } else {
                return (x.area == d.area);
            }
        })
        .style("display", function(d) {
            return d.filtered_out ? "none" : "inline";
        })
        .select(".list_entry").attr("class", "list_entry_full");

    if(!config.list_show_all_papers) {
        this.papers_list.selectAll("#list_holder")
            .filter(function(x) {
                return (x.id != d.id);
            })
            .style("display", "none");
    }
};

// recreates abstracts, if we zoom out from circle
list.reset = function() {

    d3.selectAll("#list_abstract")
        .html((d) => {
            return this.createAbstract(d, config.abstract_small);
        });
      
    this.createHighlights(this.current_search_words);
    this.attachClickHandlerAbstract(false);

    d3.selectAll(".list_entry_full").attr("class", "list_entry");
    if(config.hide_keywords_overview) {
        d3.selectAll("#list_keywords").style("display", "none");
    }
    d3.selectAll(".list_images").html("");
    
    if (config.list_show_external_vis) {
        d3.selectAll('.conceptgraph').style('display', 'block');
    }

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
    if (this.checkIfFileAvailable(image_src)) {
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
                if(config.use_hypothesis) {
                    return viewer + "?file=" + pdf_url; //#view=FitH
                } else {
                    return pdf_url;
                }
            })
            .attr("scrolling", "no");
    }, 100);

    $("#spinner-iframe").hide();
    $("#pdf_iframe").show();
};


list.populateOverlay = function(d) {
    let this_d = d;
    //imitating active pseudo class for grabbing cursor
    $(".modal-header").mousedown(function() {
        $(".modal-header").addClass("modal-header-active");
    });

    $(".modal-header").mouseup(function() {
        $(".modal-header").removeClass("modal-header-active");
    });
    
    if (config.preview_type == "image") {
        $("#spinner-images").show();
        $("#images_holder").hide();
        $("#status").hide();
        $("#images_modal").modal({
            keyboard: true
        });

        //making the images modal draggable and resizable
        let currentModal = document.getElementById('image-modal');
        currentModal.style.left = '0px';
        currentModal.style.top = '0px';
        $("#image-modal").draggable();


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
        let pdf_url = filename.replace(/\/|:/g, "__");
        
        $("#status").hide();

        if (this.checkIfFileAvailable(config.server_url + "paper_preview/" + pdf_url)) {
            this.writePopup(config.server_url + "paper_preview/" + pdf_url);
            $("#iframe_modal").modal({
                keyboard: true
            });

            //making the pdf modal draggable and resizable
            let currentModal = document.getElementById('pdf-modal');
            currentModal.style.left = '0px';
            currentModal.style.top = '0px';
            $("#pdf-modal").draggable();

        } else {
            $("#spinner-iframe").show();
            $("#pdf_iframe").hide();
            $("#iframe_modal").modal({
                keyboard: true
            });

            let article_url = d.oa_link;
            let possible_pdfs = "";
            if (config.service === "base") {
                possible_pdfs = d.link + ";" + d.identifier + ";" + d.relation;
            } else if (config.service === "openaire") {
                possible_pdfs  = d.link + ";" + d.fulltext;
            }

            $.getJSON(config.server_url + "services/getPDF.php?url=" + article_url + "&filename=" + pdf_url + "&service=" + config.service + "&pdf_urls=" + possible_pdfs, (data) => {

                var showError = function() {
                    var pdf_location_link = (config.service === "openaire") ? (this_d.link) : (this_d.outlink);
                    $("#status").html("Sorry, we were not able to retrieve the PDF for this publication. You can get it directly from <a href=\"" + pdf_location_link + "\" target=\"_blank\">this website</a>.");
                    $("#status").show();
                }

                if (data.status === "success") {
                    this.writePopup(config.server_url + "paper_preview/" + pdf_url);
                } else if (data.status === "error") {
                    $("#spinner-iframe").hide();
                    showError();
                }

            }).fail((d, textStatus, error) => {
                console.error("getJSON failed, status: " + textStatus + ", error: " + error);
                $("#spinner-iframe").hide();
                showError();
            });
        }
    }
};

list.setImageForListHolder = function(d) {

    var current_item = this.papers_list.selectAll("#list_holder")
        .filter(function(x) {
            return (x.id == d.id);
        });
    // EVENTLISTENERS
    current_item.select("#paper_list_title")
        .on("click", function(d) {
            mediator.publish("list_title_click", d);
        });

    let image_src = "paper_preview/" + d.id + "/page_1.png";
    let pdf_preview = require("images/preview_pdf.png");
    let concept_graph = require("images/thumbnail-concept-graph.png");
    if(config.list_show_external_vis) {
        let external_url = d.external_vis_link;
        
        let preview_image = current_item
                            .append("div")
                                .attr("id", "preview_image")
                                .classed("preview_image", true)
                    
        let image_div = preview_image.append("div")
                            .attr("id", "preview_thumbnail")
                            .classed("preview_thumbnail", true)
        
        image_div
               .append("a")
                .attr("href", external_url)
                .attr("target", "_blank") 
               .append("img")
                .attr("id", "thumbnail-concept-graph")
                .classed("thumbnail-concept-graph", true)
                .attr("src", concept_graph)
        
        let text_div = preview_image.append("div")
                            .attr("id", "preview_text")
                            .classed("preview_text", true)
        
        text_div.append("div")
                .attr("id", "concept-graph-description")
                .classed("concept-graph-description", true)
                .html('<p class="concept-graph-h">Explore connections of this document</p>'
                        +'<p>Concept Graph by Know-Center is a novel visualization tool, which represents documents and related concepts (e.g. keywords, authors) in a graph.</p>'
                        +'<p class="concept-graph-link"><a class="tryout-button" '
                        +'href="' + external_url + '" target="_blank">Try out Concept Graph</a></p>')
        
        
    } else {
    
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
            if (d.oa === false || d.resulttype === "dataset") {
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
    }

};

list.title_click = function(d) {

    var url = d.outlink;
    if (url === false || !config.is_title_clickable) {
        d3.event.stopPropagation();
        return;
    }

    mediator.publish("record_action", d.title, "List", "open_outlink", config.user_id, d.bookmarked + " " + d.recommended, null, "url=" + d.url);

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
    
    var backlink_node = list_holders_local.select("#backlink_list").node();
    if (backlink_node !== null) {
        backlink_node.parentNode.removeChild(backlink_node);
    }
};

list.scrollTop = function() {
    $("#papers_list").animate({
        scrollTop: 0
    }, 0);
}

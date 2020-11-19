// StateMachine for List UI element in Headstart
// Filename: list.js
import StateMachine from 'javascript-state-machine';
import "../lib/jquery-ui.min.js";

import config from 'config';
import { mediator } from 'mediator';
import {
    highlight,
    clear_highlights,
    getRealHeight,
} from 'helpers';

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
        onbeforestart: function() {
            this.width = config.list_width;
            if (!config.render_bubbles) {
                d3.select(window).on("resize", () => {
                    this.fit_list_height();
                });
            }
            this.current_search_words = []
            this.current_filter_param = config.filter_options[0];
        },

        onshow: function() {
            this.fit_list_height();
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

// Still used for the list resize (triggers a mediator function that changes the list height in the redux store)
list.fit_list_height = function() {
    var paper_list_avail_height = null;
    //Magic number - should be moved to config
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
            //Should be moved to config
            "min-width": "300px"
        });
        paper_list_avail_height = available_height - $("#explorer_header").outerHeight(true);
    } else {
        let title_height = $("#subdiscipline_title").outerHeight(true);
        let title_image_height = $("#title_image").outerHeight(true) || 0;
        
        // the real height after the react elements are rendered
        let showHideBtnHeight = 34;
        let filterSortHeight = 68.4;

        paper_list_avail_height = 
                Math.max(title_height, title_image_height)
                    + $("#headstart-chart").outerHeight(true)
                    - showHideBtnHeight 
                    - filterSortHeight
                    + ($(".legend").outerHeight(true) || 0)
                    - PAPER_LIST_CORRECTION
                    - (parseInt($("#papers_list").css("padding-top"), 10) || 0)
    }
    
    mediator.publish("list_height_change", paper_list_avail_height);
};

list.scrollToEntry = function(safe_id) {
    // couldn't think of a better solution now: the scroll must happen after the list is rerendered
    setTimeout(() => {
        $("#papers_list").animate({
            scrollTop: $('#' + safe_id).offset().top - $('#papers_list').offset().top
        }, 0);
    }, 80);
}

list.scrollTop = function() {
    $("#papers_list").animate({
        scrollTop: 0
    }, 0);
}

// Still used for the map filtering (the name is misleading)
list.filterList = function(search_words, filter_param) {
    if (search_words === undefined) {
        search_words = this.current_search_words
    } else {
        mediator.publish("record_action", search_words.join(), "List", "search", config.user_id, "filter_list", null, "search_words=" + search_words);
    }

    if (filter_param === undefined) {
        filter_param = this.current_filter_param;     
    } else {
        mediator.publish("record_action", filter_param, "List", "filter", config.user_id, "filter_list", null, "filter_param=" + filter_param);
    }
    
    this.current_search_words = search_words;

    search_words = search_words.map(function(e) {
        e = e.trim().toLowerCase();
        return e;
    });

    this.createHighlights(search_words);

    // Full list of items in the map
    let all_map_items = d3.selectAll(".paper");
    
    let normally_visible_map_items = all_map_items;
    
    if (!config.is_streamgraph && mediator.is_zoomed) {
        //TODO why not mediator.current_circle
        let current_circle = d3.select(mediator.current_zoom_node);
                
        // Find items that, without any filtering, should be in the view
        normally_visible_map_items = all_map_items
            .filter(function(d) {
                if (config.use_area_uri) {
                    return current_circle.data()[0].area_uri == d.area_uri;
                } else {
                    return current_circle.data()[0].title == d.area;
                }
            });
    } else if (config.is_streamgraph && mediator.current_stream !== null) {
                
        normally_visible_map_items = all_map_items
            .filter(function(d) {
                if (mediator.current_enlarged_paper !== null) {
                    return mediator.current_enlarged_paper.id == d.id;
                } else {
                    return d.subject_orig.split("; ").includes(mediator.current_stream);
                }
            });
    }
    
    normally_visible_map_items.style("display", "inline");

    all_map_items.each(function (d) {
        d.filtered_out = false
    })

    // Now actually do the filtering (i.e. remove some objects from map)
    this.hideEntriesByWord(all_map_items, search_words);
    this.hideEntriesByParam(all_map_items, filter_param);
};

// Returns true if document has parameter or if no parameter is passed
// Still used for the map filtering
list.findEntriesWithParam = function (param, d) {
    if(typeof config.filter_field === "undefined" || config.filter_field === null) {
        if (param === 'open_access') {
            return d.oa
        } else if (param === 'publication') {
            return d.resulttype === 'publication'
        } else if (param === 'dataset') {
            return d.resulttype === 'dataset'
        } else {
            return true
        }
    } else {
       if (param === "all") {
           return true;
       } else {
           return d[config.filter_field] === param;
       }
    }
}

// These functions only hide items. They shouldn't unhide them.
// Still used for the map filtering
// WARNING: do not use this for hiding react elements ('object' parameter)
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

// Still used for the map filtering
// WARNING: do not use this for hiding react elements ('object' parameter)
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
            let tags = (d.hasOwnProperty("tags")) ? (d.tags.toString().toLowerCase()) : ("");
            let comments = (d.hasOwnProperty("comments_for_filtering")) ? (d.comments_for_filtering.toString().toLowerCase()) : ("");
            let resulttype = (d.hasOwnProperty("resulttype")) ? (d.resulttype.toString().toLowerCase()) : ("");
            //TODO: make these two properties language-aware
            let open_access = (d.hasOwnProperty("oa") && d.oa === true) ? ("open access") : ("");
            let free_access = (d.hasOwnProperty("free_access") && d.free_access === true) ? ("free access") : ("");
            let i = 0;
            while (word_found && i < search_words.length) {
                word_found = (abstract.indexOf(search_words[i]) !== -1 ||
                    title.indexOf(search_words[i]) !== -1 ||
                    authors.indexOf(search_words[i]) !== -1 ||
                    journals.indexOf(search_words[i]) !== -1 ||
                    year.indexOf(search_words[i]) !== -1 ||
                    keywords.indexOf(search_words[i]) !== -1 ||
                    tags.indexOf(search_words[i]) !== -1 ||
                    comments.indexOf(search_words[i]) !== -1 ||
                    resulttype.indexOf(search_words[i]) !== -1 ||
                    open_access.indexOf(search_words[i]) !== -1 ||
                    free_access.indexOf(search_words[i]) !== -1
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

// Still used for the map highlighting
list.createHighlights = function(search_words) {
    if (typeof search_words === "undefined") {
        return;
    }

    clear_highlights();
    if( !(search_words.length === 0 || (search_words.length === 1 && search_words[0] === "")) ) {
        $(".query_term_highlight").addClass("not-highlighted");
        
        search_words.forEach(function(str) {
            highlight(str);
        });
    } else {
        if($(".query_term_highlight").hasClass("not-highlighted")){
            $(".query_term_highlight").removeClass("not-highlighted");
        }
    }
};

// Still used in the pdf preview
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
// Still used in the pdf preview
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

// Still used in the pdf preview
list.writePopup = function(pdf_url) {
    $("#pdf_iframe").attr('src', 'about:blank');
    setTimeout(function() {
        $("#pdf_iframe")
            .attr("src", function() {
                let viewer = config.server_url + "services/displayPDF.php";
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

// Still used in the pdf preview
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

            let article_url = encodeURIComponent(d.oa_link);
            let possible_pdfs = "";
            if (config.service === "base") {
                let encodeRelation = function (relation) {
                    let relation_array = relation.split("; ");
                    let encoded_array = relation_array.map(function (x) { return encodeURIComponent(x) });
                    return encoded_array.join("; ")
                }
                
                possible_pdfs = encodeURIComponent(d.link) + ";" 
                                    + encodeURIComponent(d.identifier) + ";" 
                                    + encodeRelation(d.relation);
            } else if (config.service === "openaire") {
                possible_pdfs  = encodeURIComponent(d.link) + ";" 
                                    + d.fulltext;
            }
            
            var showError = function() {
                var pdf_location_link = (config.service === "openaire") ? (this_d.link) : (this_d.outlink);
                $("#status").html(config.localization[config.language].pdf_not_loaded 
                        + " <a href=\"" + pdf_location_link + "\" target=\"_blank\">" 
                        + config.localization[config.language].pdf_not_loaded_linktext + "</a>.");
                $("#status").show();
            }

            $.getJSON(config.server_url + "services/getPDF.php?url=" + article_url + "&filename=" + pdf_url + "&service=" + config.service + "&pdf_urls=" + possible_pdfs, (data) => {

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

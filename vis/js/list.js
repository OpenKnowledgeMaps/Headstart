// StateMachine for List UI element in Headstart
// Filename: list.js
import StateMachine from 'javascript-state-machine';
import "../lib/jquery-ui.min.js";

import config from 'config';
import { mediator } from 'mediator';

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
            this.current_search_words = []
            this.current_filter_param = config.filter_options[0];
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

// Still used in the pdf preview
list.checkIfFileAvailable = function(fileurl) {
    if (mediator.modern_frontend_enabled) {
        return;
    }
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
    if (mediator.modern_frontend_enabled) {
        return;
    }
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
    if (mediator.modern_frontend_enabled) {
        return;
    }
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
        if (!mediator.modern_frontend_enabled) {
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
        }
    } else if (config.preview_type == "pdf") {
        if (!mediator.modern_frontend_enabled) {
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
    }
};

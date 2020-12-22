import { getRealHeight } from "helpers";
import config from 'config';
import { mediator } from 'mediator';
import { intros } from 'intro';

const editModalButton = require('templates/buttons/edit_button.handlebars')
const embedModalButton = require('templates/buttons/embed_button.handlebars')
const shareButton = require('templates/buttons/share_button.handlebars');
const faqsButton = require('templates/buttons/faqs_button.handlebars');
const legendTemplate = require("templates/toolbar/cris_legend.handlebars");

// functions in this module are used only for rendering modal buttons, modal windows and streamgraph

// TODO delete unused code in calcChartSize + setupCanvas + setupResizedCanvas

class Canvas {
    constructor() {
        this.available_height = null;
        this.available_width = null;
        this.current_vis_size = null;
        this.current_vis_width = null; //used in streamgraph
    }

    // Set this.available_height, this.available_width, this.current_vis_size and this.current_vis_width (for streamgraph)
    calcChartSize() {
        var parent_height = getRealHeight($("#" + config.tag));
        var subtitle_height = $("#subdiscipline_title").outerHeight(true);

        var toolbar_height = $("#toolbar").outerHeight(true) || 0;
        var title_image_height = $("#title_image").outerHeight(true) || 0;
        const CHART_HEIGHT_CORRECTION = 15;
        const CHART_HEIGHT_CORRECTION_TOOLBAR = 15;

        // Set available_height and available_width
        if (parent_height === 0) {
            this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - Math.max(subtitle_height, title_image_height) - toolbar_height;
        } else {
            this.available_height = $("#" + config.tag).height() - Math.max(subtitle_height, title_image_height) - toolbar_height;
        }

        this.available_height = this.available_height - ((toolbar_height > 0)?(CHART_HEIGHT_CORRECTION_TOOLBAR):(CHART_HEIGHT_CORRECTION));

        this.available_width = $("#" + config.tag).width() - $("#list-col").width() - $("#modals").width();

        // Set current_vis_size
        if (this.available_width > config.min_width && this.available_height > config.min_height) {
            if (this.available_width >= this.available_height) {
                this.current_vis_size = this.available_height;
            } else {
                this.current_vis_size = this.available_width;
            }
        } else {
            this.current_vis_size = this.getMinSize();
        }

        if (this.current_vis_size > config.max_height) {
            this.current_vis_size = config.max_height;
        }
        
        //Set current_vis_width for streamgraph
        if(this.available_width > config.min_width) {
            this.current_vis_width = this.available_width;
        } else {
            this.current_vis_width = config.min_width;
        }
    }

    // Size helper functions
    getMinSize() {
        if (config.min_height >= config.min_width) {
            return config.min_width;
        } else {
            return config.min_height;
        }
    }

    // auto if enough space is available, else hidden
    setOverflowToHiddenOrAuto(selector) {
        var overflow = "hidden";

        if (this.current_vis_size > this.available_height ||
                this.current_vis_size + config.list_width > this.available_width) {
            overflow = "auto";
        }

        d3.select(selector).style("overflow", overflow);
    }
    
    drawStreamgraphChart() {
        d3.select("#chart-svg").remove();       
        this.createStreamgraphCanvas();           
    }
    
    createStreamgraphCanvas() {
        let self = this;
        
        d3.select('#headstart-chart')
            .append('svg')
                .attr('width', self.current_vis_width)
                .attr('height', self.current_vis_size)
                .attr('id', 'streamgraph_subject')
                .classed('streamgraph-canvas', true)
    }
    
    initEventListenersStreamgraph() {
        d3.select(window).on("resize", () => {
            mediator.publish("window_resize");
        });
        
        this.initInfoModal();
    }
    
    initInfoModal() {
        // Info Modal Event Listener
        $('#info_modal').on('show.bs.modal', function () {
            mediator.publish("record_action", config.title, "Map", "open_info_modal", config.user_id, "open_info_modal", null, null, null);
            var current_intro = config.intro;
            var intro = (typeof intros[current_intro] != "undefined") ? (intros[current_intro]) : (current_intro)
            $('#info-title').text(intro.title);
            $('#info-body').html(intro.body);
            if (intro.dynamic) {
                $.each(intro.params, function (paramName, value) {
                    if (paramName.slice(0,4) === 'html') {
                        $('.info-modal-'+paramName).html(value)
                    } else {
                        value = (value === "true")?("yes"):(value);
                        $('.info-modal-'+paramName).text(value)
                    }
                })
            }
        });
    }

    drawModals(context) {
        $('#modals').empty()
        
        if (config.share_modal) {
            $('#modals').append(shareButton);
            $("#sharebutton").attr("title", config.localization[config.language].share_button_title);
            
            let title =  document.title;
            let url = window.location.href;
            let description = $("meta[name='description']").attr("content");
            
            d3.select(".sharebutton_twitter")
                    .attr("href", function () {
                        return "https://twitter.com/intent/tweet?"
                            + "url=" + encodeURIComponent(url)
                            + "&hashtags=" + encodeURIComponent(config.hashtags_twitter_card)
                            + "&text=" + title;
            });
            
            d3.select(".sharebutton_fb")
                    .attr("href", function () {
                        return "https://www.facebook.com/sharer/sharer.php?"
                            + "u=" + encodeURIComponent(url);
            });
            
            d3.select(".sharebutton_mail")
                    .attr("href", function () {
                        return "mailto:?subject=" + title
                            + "&body=" + description + " " + encodeURIComponent(url)
            });
            
            $(".sharebutton")
                .on('click', (event) => {
                    event.preventDefault();
                    $(".sharebuttons").toggle(0, function () {
                        if ($(this).is(':visible')) {
                            mediator.publish("record_action", config.title, "Map", "open_share_buttons", config.user_id, "open_share_buttons", null, null, null);
                            $(this).css('display','inline-block');
                            $("#sharebutton").focus();
                        } else {
                            mediator.publish("record_action", config.title, "Map", "close_share_buttons", config.user_id, "close_share_buttons", null, null, null);
                        }
                    });
                })
        }
        
        if (config.embed_modal) {
            $('#modals').append(embedModalButton)
            $("#embedlink").attr("title", config.localization[config.language].embed_button_title);
            $('#embed-title').html(config.localization[config.language].embed_title)
            $('#embed-modal-text').val(`<iframe width="1200" height="720" src="${window.location.toString().replace(/#.*/, "")}&embed=true"></iframe>`)
            $('#embed-body-text').html(config.localization[config.language].embed_body_text)
            $('#embed-button').text(config.localization[config.language].embed_button_text)
            .on('click', (event) => {
                event.preventDefault();
                mediator.publish("record_action", config.title, "Map", "open_embed_modal", config.user_id, "open_embed_modal", null, null, null);
                let embedString = $('#embed-modal-text')[0];
                embedString.focus();
                embedString.setSelectionRange(0, embedString.value.length);
                document.execCommand("copy");
                return false;
            })
        }
        
        if(config.faqs_button) {
            $('#modals').append(faqsButton)
            $('#faqs_button').on('click', event => {
                                    window.open(config.faqs_url, "_blank");
                                })
        }
        
        if (config.viper_edit_modal) {
            $('#modals').append(editModalButton)
            $('#viper-edit-screenshot').attr('src', require('images/viper-project-screenshot.png'))
            $('#edit-title').html(config.localization[config.language].viper_edit_title)
            $('#edit-modal-text').html(config.localization[config.language].viper_edit_desc_label)
            $('#edit-button-text').html(config.localization[config.language].viper_button_desc_label + " <b>" + ((context.params.acronym !== "")?(context.params.acronym + " - "):("")) + context.params.title + "</b>.")
            $('#viper-edit-button').text(config.localization[config.language].viper_edit_button_text)
            $('.viper-edit-link, viper-edit-screenshot').click(function (event) {
                event.preventDefault();
                mediator.publish("record_action", config.title, "EditModal", "click_outlink", config.user_id, "click_outlink", null, null, null);
                mediator.publish("mark_project_changed", context.id);
                window.open(`https://www.openaire.eu/search/project?projectId=${context.params.obj_id}`);
            })
        }
    }

    setupCanvas() {
        this.calcChartSize();
    }

    setupResizedCanvas() {
        this.calcChartSize(); // Calculate new this.current_vis_size
    }
    
    setupStreamgraphCanvas() {
        this.setOverflowToHiddenOrAuto("#main");
        this.calcChartSize();
        
        this.drawStreamgraphChart();
    }
    
    initEventsStreamgraph() {
        this.initEventListenersStreamgraph();
    }

    showInfoModal() {
        if (config.show_intro) {
            $("#infolink").click();
        }
    }
}

export const canvas = new Canvas();

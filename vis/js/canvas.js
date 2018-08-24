import { getRealHeight } from "helpers";
import config from 'config';
import { headstart } from 'headstart';
import { papers } from 'papers';
import { mediator } from 'mediator';
import { intros } from 'intro';
import dateFormat from 'dateformat';

const editModalButton = require('templates/buttons/edit_button.handlebars')
const embedModalButton = require('templates/buttons/embed_button.handlebars')
const shareButton = require('templates/buttons/share_button.handlebars')
const legendTemplate = require("templates/toolbar/cris_legend.handlebars");

class Canvas {
    constructor() {
        this.available_height = null;
        this.available_width = null;
        this.current_vis_size = null;

    }

    getCurrentCircle(d) {
        mediator.current_circle = canvas.chart.selectAll("#headstart-chart circle")
                .filter(function (x) {
                    if (config.use_area_uri) {
                        return x.area_uri == d.area_uri;
                    } else {
                        return x.title == d.area;
                    }
                });
    }

    // Set this.available_height, this.available_width and this.current_vis_size
    calcChartSize() {
        var parent_height = getRealHeight($("#" + config.tag));
        var subtitle_height = $("#subdiscipline_title").outerHeight(true);

        var toolbar_height = $("#toolbar").outerHeight(true) || 0;
        const CHART_HEIGHT_CORRECTION = 15;
        const CHART_HEIGHT_CORRECTION_TOOLBAR = 10;

        // Set available_height and available_width
        if (parent_height === 0) {
            this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - subtitle_height - toolbar_height;
        } else {
            this.available_height = $("#" + config.tag).height() - subtitle_height - toolbar_height;
        }

        this.available_height = this.available_height - ((toolbar_height > 0)?(CHART_HEIGHT_CORRECTION_TOOLBAR):(CHART_HEIGHT_CORRECTION));

        if (headstart.is("timeline")) {
            var timeline_height = $(".tl-title").outerHeight(true);
            this.available_height = this.available_height - timeline_height;
            this.available_width = $("#" + config.tag).width();
        } else {
            this.available_width = $("#" + config.tag).width() - $("#list_explorer").width() - $("#modals").width();
        }

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
    }

    initScales() {
        // Init all scales
        this.chart_x = d3.scale.linear();
        this.chart_y = d3.scale.linear();

        this.chart_x_circle = d3.scale.linear();
        this.chart_y_circle = d3.scale.linear();

        this.x = d3.scale.linear();
        this.y = d3.scale.linear();

        this.paper_x = d3.scale.linear();
        this.paper_y = d3.scale.linear();

        this.circle_size = d3.scale.sqrt();
        this.diameter_size = d3.scale.sqrt();
    }

    setScaleRanges() {
        // Calculate correct scaling factors and paper/circle dimensions
        const correction_factor = this.current_vis_size / config.reference_size;

        const circle_min = (config.min_area_size * correction_factor) * config.bubble_min_scale;
        const circle_max = (config.max_area_size * correction_factor) * config.bubble_max_scale;
        this.circle_size.range([circle_min, circle_max]);

        const paper_min = (config.min_diameter_size * correction_factor) * config.paper_min_scale;
        const paper_max = (config.max_diameter_size * correction_factor) * config.paper_max_scale;
        this.diameter_size.range([paper_min, paper_max]);

        // Set ranges on scales
        const padding_articles = 5;
        this.chart_x.range([padding_articles, this.current_vis_size - padding_articles]);
        this.chart_y.range([padding_articles, this.current_vis_size - padding_articles]);

        const circle_padding = circle_max / 2 + 45;
        this.chart_x_circle.range([circle_padding, this.current_vis_size - circle_padding]);
        this.chart_y_circle.range([circle_padding, this.current_vis_size - circle_padding]);

        const zoomed_article_padding = 60;
        this.x.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);
        this.y.range([zoomed_article_padding, this.current_vis_size - zoomed_article_padding]);

        const zoomed_article_padding_paper = 35;
        this.paper_x.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
        this.paper_y.range([zoomed_article_padding_paper, this.current_vis_size - zoomed_article_padding_paper]);
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

    // Draw basic SVG canvas
    // NOTE attribute width addition by number of elements
    drawSvg() {
        const svg = d3.select("#chart-svg");
        svg.attr("height", this.current_vis_size + "px")
                .attr("width", this.current_vis_size + "px");
    }

    drawTimelineSvg() {
        const svg = d3.select("#chart-svg");
        let s = this.current_vis_size * Object.keys(mediator.bubbles).length;
        svg.attr("width", s)
                .attr("height", this.current_vis_size);
        svg.attr("viewBox", "0 0 " + s + " " + this.current_vis_size);
    }

    drawChartCanvas() {
        const svg = d3.select("#chart-svg");
        this.chart = svg.append("g").attr("id", "chart_canvas");
        // Rectangle to contain nodes in force layout
        this.chart.append("rect").attr("id", "map-rect")
        this.updateChartCanvas();
    }

    updateChartCanvas() {
        d3.select("rect")
                .attr("height", this.current_vis_size)
                .attr("width", this.current_vis_size);
        
        d3.select("#headstart-chart")
                .style("width", this.current_vis_size + "px");
    }

    calcTitleFontSize() {
        if (this.current_vis_size <= 600) {
            return "12px";
        } else if (this.current_vis_size <= 1000) {
            return "14px";
        } else {
            return "16px";
        }
    }

    initEventListeners() {
        d3.select(window).on("resize", () => {
            mediator.publish("record_action", config.title, "Map", "resize", config.user_id, "resize_map", null, null, null);
            if (headstart.is("timeline")) {
                return;
            }   
            mediator.publish("window_resize");
        });

        // Info Modal Event Listener
        $('#info_modal').on('show.bs.modal', function () {
            if(!mediator.is_zoomed) {
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
            } else {
                let d = d3.select(mediator.current_zoom_node).datum();
                mediator.publish("record_action", d.title, "Bubble", "open_info_modal", config.user_id, "open_info_modal", null, null, null);
                $('#info-body').html("");
                $('#info-title').text(config.localization[config.language].intro_areas_title + d.title);
                config.scale_types.forEach(function(item, index) {
                    if(item !== "none") {
                        let info_body = d3.select('#info-body')
                        info_body.append("h5").html(index + ". " + config.scale_label[item]);
                        info_body.append('div')
                                    .attr('class', 'statistics-image')
                                 .append('img')
                                    .attr('class', 'image-area-statistics')
                                    .attr('src', './img/' + d.area_uri + '_' + item + '.svg')
                        info_body.append('div').html(legendTemplate)
                    }
                })
            }
        });
    }

    // Mouse interaction listeners
    initMouseListeners() {
        this.initMouseMoveListeners();
        this.initMouseClickListeners();
        this.initClickListenersForNav();
    }

    initMouseMoveListeners() {
        $("rect").on("mouseover", () => {
            mediator.publish("on_rect_mouseover");
        });

        $("rect").on("mouseout", () => {
            mediator.publish("on_rect_mouseout");
        });
    }

    initMouseClickListeners() {
        $("#" + config.tag + ",#chart-svg").bind('click', (event) => {
            if(event.target.className !== "sharebuttons" 
                    && event.target.className !== "btn btn-primary sharebutton" 
                    && event.target.className !== "fa fa-share-alt fa-fw") {
                $(".sharebuttons").css('display', 'none');
            }
            
            if (event.target.className === "container-headstart" ||
                    event.target.className === "vis-col" ||
                    event.target.id === "headstart-chart" ||
                    event.target.id === "chart-svg" ||
                    event.target.id === "map-rect") {
                mediator.publish('chart_svg_click');
            }
        });
    }

    initClickListenersForNav() {
        $("#timelineview").on("click", () => {
            if ($("#timelineview a").html() === "TimeLineView") {
                mediator.publish("to_timeline");
            }
        });
    }

    // Draws the header for this
    drawTitle(context) {
        let chart_title = "";

        chart_title = config.localization[config.language].default_title;
        if (config.title) {
            chart_title = config.title;
        } else if (config.create_title_from_context_style === 'viper') {
            let maxTitleLength = 47 // This should probably make it's way to a more global config
            let acronymtitle = ( (context.params.acronym !== "") ? (context.params.acronym + " - " + context.params.title) : (context.params.title) );
            let compressedTitle = ( acronymtitle.length > maxTitleLength ) ? acronymtitle.slice(0, maxTitleLength - 3) + '...' : acronymtitle
            chart_title = `Overview of <span class="truncated-project-title">${compressedTitle}</span>\
                            <span class="project-id">(${context.params.project_id})</span>`
        } else if (config.create_title_from_context) {
            let query_clean = context.query.replace(/\\(.?)/g, "$1");
            chart_title = config.localization[config.language].overview_label
                    + ' <span id="search-term-unique">' + query_clean + '</span>';
        }
           
        var subdiscipline_title_h4 = $("#subdiscipline_title h4");
        subdiscipline_title_h4.html(chart_title);

        this.drawContext(context);
        this.drawModals(context)

        if (config.show_infolink) {
            let infolink = ' <a data-toggle="modal" data-type="text" href="#info_modal" id="infolink"></a>';
            subdiscipline_title_h4.append(infolink);

            $("#infolink").html('<span id="whatsthis">' + config.localization[config.language].intro_icon  
                        +'</span> ' + config.localization[config.language].intro_label);
        }

        if (config.show_timeline) {
            let link = ' <span id="timelineview"><a href="#">TimeLineView</a></span>';
            subdiscipline_title_h4.append(link);
        }

        if (config.show_dropdown) {
            let dropdown = '<select id="datasets"></select>';

            subdiscipline_title_h4.append(" Select dataset: ");
            subdiscipline_title_h4.append(dropdown);

            $.each(config.files, (index, entry) => {
                let current_item = '<option value="' + entry.file + '">' + entry.title + '</option>';
                $("#datasets").append(current_item);
            });

            $("#datasets").val(mediator.current_bubble.file);

            $("#datasets").change(function () {
                let selected_file_number = this.selectedIndex;
                if (selected_file_number !== mediator.current_file_number) {
                    headstart.tofile(selected_file_number);
                }
            });
        }
    }

    drawModals(context) {
        $('#modals').empty()
        
        if (config.share_modal) {
            $('#modals').append(shareButton)
            
            let title =  document.title;
            let url = window.location.href;
            let description = $("meta[name='description']").attr("content");
            
            d3.select(".sharebutton_twitter")
                    .attr("href", function () {
                        return "https://twitter.com/intent/tweet?"
                            + "url=" + encodeURI(url)
                            + "&hashtags=" + encodeURI("okmaps,openscience,dataviz")
                            + "&text=" + title;
            });
            
            d3.select(".sharebutton_fb")
                    .attr("href", function () {
                        return "https://www.facebook.com/sharer/sharer.php?"
                            + "u=" + encodeURI(url);
            });
            
            d3.select(".sharebutton_mail")
                    .attr("href", function () {
                        return "mailto:?subject=" + title
                            + "&body=" + description + " " + url
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
            $('#embed-title').html(config.localization[config.language].embed_title)
            $('#embed-modal-text').val(`<iframe width="1200" height="720" src="${window.location.toString().replace(/#.*/, "")}&embed=true"></iframe>`)

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

    paramExists(param) {
        return (typeof param !== "undefined" && param !== "null" && param !== null)
    }

    drawContext(context) {
        if (config.show_context) {
            if(!this.paramExists(context.params)) {
                return;
            }
            $("#context").css({"visibility": "visible", "display": "block"});
            let modifier = "";
            if (this.paramExists(context.params.sorting)) {
                if(context.params.sorting === "most-recent") {
                    modifier = " " + config.localization[config.language].most_recent_label + " ";
                } else {
                    modifier = " "
                }
            }
            $("#num_articles").html(context.num_documents + modifier
                    + " " + config.localization[config.language].articles_label
                    + " (" + context.share_oa + " open access)" );
            
            $("#source").html(config.localization[config.language].source_label
                           + ": " + config.service_names[context.service]);

            if (config.create_title_from_context_style === 'viper') {
                $("#context-dataset_count").text(
                    `${context.num_datasets} ${config.localization[config.language].dataset_count_label}`
                )
                $("#context-paper_count").text(
                    `${context.num_papers} ${config.localization[config.language].paper_count_label}`
                )
                $("#context-funder").text(
                    `Funder: ${context.params.funder}`
                )
                $("#context-project_runtime").text(
                    `${context.params.start_date.slice(0, 4)}–${context.params.end_date.slice(0, 4)}`
                )
            }
            
            if (this.paramExists(context.params.from) && this.paramExists(context.params.to)) {

                let time_macro_display = (config.service === "doaj")?("yyyy"):("d mmm yyyy");
                let time_macro_internal = (config.service === "doaj")?("yyyy"):("yyyy-mm-dd");

                let today = new Date();
                let from = new Date(context.params.from)
                let to = new Date(context.params.to)

				today.setTime(today.getTime() + today.getTimezoneOffset()*60*1000 );
				from.setTime(from.getTime() + from.getTimezoneOffset()*60*1000 );
				to.setTime(to.getTime() + to.getTimezoneOffset()*60*1000 );

				//TODO: quick fix for date issue in snapshots, needs to be fixed
				if(this.paramExists(config.is_phantomjs)) {
					if (config.is_phantomjs) {
						return;
					}
				}

                let default_from_date = (function(service) {
                    switch(service) {
                      case 'doaj':
                        return '1809';
                      case 'pubmed':
                        return '1809-01-01';
                      case 'base':
                          return '1665-01-01';
                      default:
                          return '1970-01-01';
                    }
                  })(config.service);

                if (dateFormat(from, time_macro_internal) === default_from_date) {
                    if(dateFormat(today, time_macro_internal) === dateFormat(to, time_macro_internal)) {
                        $("#timespan").html("All time");
                    } else {
                        $("#timespan").html("Until " + dateFormat(to, time_macro_display));
                    }
                } else {

                    $("#timespan").html(
                            dateFormat(from, time_macro_display) + " - " + dateFormat(to, time_macro_display)
                    );
                }
            } else {
                $("#timespan").hide()
            }

            if(this.paramExists(config.options)) {

                let dtypes = (context.params.hasOwnProperty("document_types"))?("document_types"):("article_types");

                let document_types_string = "";

                let document_types = config.options.filter(function(obj) {
                    return obj.id == dtypes;
                });

                if(context.params.hasOwnProperty(dtypes)) {
                    let num_document_types = context.params[dtypes].length;

                    context.params[dtypes].forEach(function (type) {
                        let type_obj = document_types[0].fields.filter(function(obj) {
                            return obj.id == type;
                        })
                        document_types_string += type_obj[0].text + ", ";
                    })

                    document_types_string = document_types_string.substr(0, document_types_string.length - 2);

                    if (num_document_types > 1) {
                        $("#document_types").html(config.localization[config.language].documenttypes_label);

                        $("#document_types").attr({
                            "data-content": document_types_string
                            , "title": "The following document types were taken into consideration in the creation of this map (not all of them may appear in the map):\n\n" + document_types_string
                            , "class": "context_moreinfo"
                        })

                    } else {
                        $("#document_types").html("Document type: " + document_types_string);
                    }
                }
            } else {
                $("#document_types").hide()
            }
        } else {
            $("#num_articles").html(context.num_documents)
                              .attr("class", "");
        }
    }

    initForceAreas() {
        let padded = canvas.current_vis_size - headstart.padding;
        this.force_areas = d3.layout.force().links([]).size([padded, padded]);
    }

    initForcePapers() {
        let padded = canvas.current_vis_size - headstart.padding;
        this.force_papers = d3.layout.force().nodes([]).links([]).size([padded, padded]);
    }

    // Grid drawing methods
    // draw x and y lines in svg canvas for timelineview
    drawGrid() {
        this.drawXGrid();
        this.drawYGrid();
    }

    removeGrid() {
        $("line").remove();
    }

    drawYGrid() {
        const svg = d3.select("#chart-svg");
        var to = ((mediator.bubbles.length + 1) * this.current_vis_size);
        for (var i = 0; i <= to; i += this.current_vis_size) {
            svg.append("line")
                    .attr("x1", i)
                    .attr("x2", i)
                    .attr("y1", "0")
                    .attr("y2", "900");
        }
    }

    drawXGrid() {
        const svg = d3.select("#chart-svg");
        for (var i = 0; i <= 900; i += 50) {
            svg.append("line")
                    .attr("x1", "0")
                    .attr("x2", (mediator.bubbles.length + 1) * this.current_vis_size)
                    .attr("y1", i)
                    .attr("y2", i);
        }
    }

    // calls itself over and over until the forced layout of the papers
    // is established
    checkForcePapers() {
        if (mediator.is_in_normal_mode) {
            var checkPapers = window.setInterval(() => {
                if (
                        ((!papers.is("ready") && !papers.is("none")) ||
                                (mediator.current_bubble.is("startup") ||
                                        mediator.current_bubble.is("none") ||
                                        (mediator.current_bubble.is("start")))) &&
                        (this.force_papers.alpha() <= 0 && this.force_areas.alpha() <= 0)
                        ) {
                    papers.forced();
                    mediator.publish("check_force_papers");
                    window.clearInterval(checkPapers);
                }
            }, 10);
        }
    }

    drawGridTitles(update) {
        update = typeof update !== 'undefined' ? update : false;

        if (update === true) {
            $("#tl-titles").width(this.current_vis_size * Object.keys(mediator.bubbles).length);
            $(".tl-title").css("width", this.current_vis_size);
        } else {
            for (var i = 0; i < mediator.bubbles.length; i++) {
                $("#tl-titles").append(
                        '<div class="tl-title"><h3>' + mediator.bubbles[i].title + '</h3></div>');
            }
            $("#tl-titles").width(this.current_vis_size * Object.keys(mediator.bubbles).length);
            $(".tl-title").css("width", this.current_vis_size);
        }
    }

    drawNormalViewLink() {
        // remove event handler
        var id_timelineview = $("#timelineview");
        id_timelineview.off("click");
        // refreshes page
        var link = ' <a href="" id="normal_link">Normal View</a>';
        id_timelineview.html(link);
    }

    setupCanvas() {
        this.setOverflowToHiddenOrAuto("#main");
        this.calcChartSize();
        this.initScales();
        this.setScaleRanges();
        this.drawSvg();
        this.drawChartCanvas();
    }

    setupResizedCanvas() {
        // Set domain to old this.current_vis_size
        mediator.resized_scale_x.domain([0, this.current_vis_size]);
        mediator.resized_scale_y.domain([0, this.current_vis_size]);
        this.calcChartSize(); // Calculate new this.current_vis_size
        // Set range to new this.current_vis_size
        mediator.resized_scale_x.range([0, this.current_vis_size]);
        mediator.resized_scale_y.range([0, this.current_vis_size]);

        // Call setScaleRanges again to set the new Range of
        // this . chart_x,y chart_x,y_circle, x,y, paper_x, paper_y,
        // circle_size, diameter_size
        this.setScaleRanges();
        this.drawSvg();
        this.updateChartCanvas();
    }

    setupTimelineCanvas() {
        this.viz.empty();
        this.viz.append(timelineTemplate());

        // change heading to give an option to get back to normal view
        this.force_areas.stop();
        this.force_papers.stop();
        // clear the canvas
        $("#chart_canvas").empty();

        this.drawGridTitles();
        this.setOverflowToHiddenOrAuto("#main");
        this.drawTitle();
        this.calcChartSize();
        this.initScales();
        this.setScaleRanges();
        this.drawTimelineSvg();
        this.drawChartCanvas();
        this.drawNormalViewLink();
        this.drawGridTitles(true);
        d3.select("#headstart-chart").attr("overflow-x", "scroll");
        $("#main").css("overflow", "auto");
    }

    setupToFileCanvas() {
        this.force_areas.stop();
        this.force_papers.stop();
        // clear the canvas & list
        $("#chart_canvas").remove();
    }

    initEventsAndLayout() {
        this.initEventListeners();
        this.initMouseListeners();
        this.initForcePapers();
        this.initForceAreas();
    }

    showInfoModal() {
        if (config.show_intro) {
            $("#infolink").click();
        }
    }

    hyphenateAreaTitles() {
        $("#area_title>h2").hyphenate('en');
    }

  dotdotdotAreaTitles() {
    const check = config.hasOwnProperty('nodot');
    if ((check && config.nodot === null) || !check) {
      $("#area_title_object>body").dotdotdot({wrap:"letter"});
    }
  }

    updateCanvasDomains(data) {
        this.chart_x.domain(d3.extent(data, function (d) {
            return d.x;
        }));
        this.chart_y.domain(d3.extent(data, function (d) {
            return d.y * -1;
        }));
        this.diameter_size.domain(d3.extent(data, function (d) {
            return d.internal_readers;
        }));
    }

    updateData(data) {
        data.forEach(function (d) {
            // construct rectangles of a golden cut
            d.diameter = canvas.diameter_size(d.internal_readers);
            d.width = config.paper_width_factor * Math.sqrt(Math.pow(d.diameter, 2) / 2.6);
            d.height = config.paper_height_factor * Math.sqrt(Math.pow(d.diameter, 2) / 2.6);
            d.orig_x = d.x;
            d.orig_y = d.y;
            // scale x and y
            d.x = canvas.chart_x(d.x);
            d.y = canvas.chart_y(d.y);
        });
    }

    setDomain(prop, extent) {
        this[prop].domain(extent);
    }

    setAreaRadii(areas) {
        for (var area in areas) {
            areas[area].r = this.circle_size(areas[area].num_readers);
        }
    }

    setNewAreaCoords(new_area, area) {
        new_area.x = this.chart_x_circle(area.x);
        new_area.y = this.chart_y_circle(area.y);
    }
}

export const canvas = new Canvas();

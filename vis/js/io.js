// Class for data IO
// Filename: io.js
import config from 'config';
import { mediator } from 'mediator';
import { intros } from 'intro';

var IO = function() {
    this.test = 0;
    this.areas = {};
    this.areas_array = [];
    this.fs = [];
    this.title = "default-title";
    this.context = {};
    this.num_oa;
    this.num_papers;
    this.num_datasets;
    this.data;
};

IO.prototype = {
    // get, transform and serve data to other modules
    async_get_data: function(file, input_format, callback) {
        d3[input_format](file, (csv) => {
            callback(csv);
        });
    },

    get_server_files: function(callback) {
        $.ajax({
          type: 'POST',
          url: config.server_url + "services/staticFiles.php",
          data: "",
          dataType: 'JSON',
          success: (json) => {
            config.files = [];
            for (let i = 0; i < json.length; i++) {
              config.files.push({
                "title": json[i].title,
                "file": config.server_url + "static" + json[i].file
              });
            }
            mediator.publish("register_bubbles");
            d3[config.input_format](mediator.current_bubble.file, callback);
          }
        });
    },

    convertToFirstNameLastName: function (authors_string) {
        var authors = authors_string.split(";");
        
        for(var i = authors.length - 1; i >= 0; i--) {
            if(authors[i] === "") {
               authors.splice(i, 1);
            }
        }
        
        var authors_string = "";
        var authors_short_string = "";
        for (var i = 0; i < authors.length; i++) {            
            var names = authors[i].trim().split(",");
            var last_name = names[0].trim();
            if (names.length > 1) {
                var first_name = names[1].trim();
                
                if(config.convert_author_names === true) { 
                    authors_string += first_name + " " + last_name;
                    authors_short_string += first_name.substr(0, 1) + ". " + last_name;
                } else {
                    authors_string += last_name + ", " + first_name;
                    authors_short_string += last_name + ", " + first_name.substr(0, 1) + ". ";
                }
            } else {
                authors_string += last_name;
                authors_short_string += last_name;
            }

            if (i < (authors.length - 1)) {
                authors_string += ", ";
                authors_short_string += ", ";
            }
        }
        return { string: authors_string, short_string: authors_short_string };
    },

    setToStringIfNullOrUndefined: function (element, strng) {
        if (element === null || typeof element === "undefined") {
            return strng;
        } else {
            return element;
        }
    },

    setDefaultIfNullOrUndefined: function (object, element, defaultVal) {
        if (object[element] === null || typeof object[element] === "undefined") {
            if (config.debug) console.log(`Sanitized a value ${object[element]} of ${element} to ${defaultVal}`);
            object[element] = defaultVal;
        }
    },
    
    setContext: function(context, num_documents) {
        this.context = context;
        if(context.hasOwnProperty("params")) {
            context.params = (typeof context.params === "object")
                                ?(context.params)
                                :(JSON.parse(context.params));
        }
        this.context.num_documents = num_documents;
        this.context.share_oa = this.num_oa;
        this.context.num_datasets = this.num_datasets;
        this.context.num_papers = this.num_papers;
    },

    setInfo: function(context) {
        var current_intro = config.intro
        var intro = (typeof intros[current_intro] != "undefined") ? (intros[current_intro]) : (current_intro)
        if (intro.dynamic) { 
            intro.params = context.params
            // if organisations build pretty url list
            if (typeof intro.params.organisations != "undefined") {
                intro.params.html_organisations = intro.params.organisations.map((org) => {
                    return `<a href='${org.url}' target='_blank'>${org.name}</a>`
                }).join(', ')
                delete intro.params.organisations
            }
            intro.params.html_openaire_link = `<a href='https://www.openaire.eu/search/project?projectId=${intro.params.obj_id}' target='_blank'>Link</a>`
        }
    },

    initializeMissingData: function(data) {
        let that = this;
        let locale = config.localization[config.language];
        data.forEach((d) => {
            that.setDefaultIfNullOrUndefined(d, 'area', locale.default_area);
            that.setDefaultIfNullOrUndefined(d, 'authors', locale.default_author);
            that.setDefaultIfNullOrUndefined(d, 'file_hash', locale.default_hash);
            that.setDefaultIfNullOrUndefined(d, 'id', locale.default_id);
            that.setDefaultIfNullOrUndefined(d, 'paper_abstract', locale.default_abstract);
            that.setDefaultIfNullOrUndefined(d, 'published_in', locale.default_published_in);
            that.setDefaultIfNullOrUndefined(d, 'readers', locale.default_readers);
            that.setDefaultIfNullOrUndefined(d, 'title', locale.no_title);
            that.setDefaultIfNullOrUndefined(d, 'url', locale.default_url);
            that.setDefaultIfNullOrUndefined(d, 'x', locale.default_x);
            that.setDefaultIfNullOrUndefined(d, 'y', locale.default_y);
            that.setDefaultIfNullOrUndefined(d, 'year', locale.default_year);
            that.setDefaultIfNullOrUndefined(d, 'comments', []);
            that.setDefaultIfNullOrUndefined(d, 'subject_orig', "");
            config.scale_types.forEach((type) => {
                that.setDefaultIfNullOrUndefined(d, type, locale.default_readers);
            })
        })
    },

    prepareData: function (fs, context) {
        this.areas = {};
        this.areas_array = [];
        
        var _this = this;
        var xy_array = [];
        // convert to numbers
        var cur_data = fs;
        var num_oa = 0;
        var num_papers = 0;
        var num_datasets = 0;

        const protectedAttrs = new Set(["paper_abstract", "authors_string"]);

        cur_data.forEach(function (d) {
            //convert special entities to characters
            for (let field in d) {
                if(typeof d[field] === "string") {
                    d[field] = $("<textarea/>").html(d[field]).val();
                }
            }

            // convert authors to "[first name] [last name]"
            // var authors = d.authors.split(";");
            var authors = _this.convertToFirstNameLastName(d.authors);
            d.authors_string = authors.string;
            d.authors_short_string = authors.short_string;
            
            //replace "<" and ">" to avoid having HTML tags
            for (let field in d) {
                if(typeof d[field] === "string" && !protectedAttrs.has(field)) {
                    d[field] = d[field].replace(/</g, "&lt;");
                    d[field] = d[field].replace(/>/g, "&gt;");
                }
            }
            
            d.safe_id = _this.convertToSafeID(d.id);
            
            if(d.hasOwnProperty("snippets") && d.snippets !== "") {
                d.snippets = d.snippets.replace(/&lt;em&gt;/g, "<em>");
                d.snippets = d.snippets.replace(/&lt;\/em&gt;/g, "</em>");
                d.snippets = d.snippets.replace(/&lt;span&gt;/g, "<span>");
                d.snippets = d.snippets.replace(/&lt;\/span&gt;/g, "</span>");
                d.paper_abstract = d.snippets;
            }
            
            let prepareCoordinates = function(coordinate, digits) {
                if (isNaN(parseFloat(coordinate))) {
                    return parseFloat(0).toFixed(digits);
                }
                
                let fixed_coordinate = parseFloat(coordinate).toFixed(digits);
                
                //convert -0 to 0 so that the same location detection still works
                if (fixed_coordinate === "-" + parseFloat(0).toFixed(digits)) {
                    return parseFloat(0).toFixed(digits);
                }
                
                return fixed_coordinate
            }
            
            d.x = prepareCoordinates(d.x, 8);
            d.y = prepareCoordinates(d.y, 8);
            //if two items have the exact same location,
            // that throws off the force-based layout
            var xy_string = d.x + d.y;
            while (xy_array.hasOwnProperty(xy_string)) {
                d.y = parseFloat(d.y) + Number(0.00000001);
                xy_string = d.x + d.y;
            }

            xy_array[xy_string] = true;
            
            d.paper_abstract = _this.setToStringIfNullOrUndefined(d.paper_abstract, "");
            d.published_in = _this.setToStringIfNullOrUndefined(d.published_in, "");
            d.title = _this.setToStringIfNullOrUndefined(d.title,
                config.localization[config.language]["no_title"]);
                
            var prepareMetric = function(d, metric) {
                 if(d.hasOwnProperty(metric)) {
                     if(d[metric] === "N/A") {
                         return "n/a"
                     } else {
                         return +d[metric];
                     }
                 }
            }
            
            var prepareInternalMetric = function(d, metric) {
                if(d[metric] === "n/a" || d[metric] === "N/A") {
                     return 0;
                 } else {
                     return +d[metric];
                 }
            }
            
            var prepareSubMetric = function(d, metric) {
                let num = 0;
                d.paper_abstract.forEach(function (element) {
                    num += +element.readers;
                })
                return num;
            }

            if (config.list_sub_entries) {
                d.num_readers = prepareSubMetric(d, "readers");
                d.internal_readers = d.num_readers + 1;
            } else if (config.content_based === false && !(config.scale_by)) {
                d.num_readers = prepareMetric(d, "readers");
                d.internal_readers = prepareInternalMetric(d, "readers") + 1;
            } else if (config.scale_by) {
                d.num_readers = prepareMetric(d, config.scale_by);
                d.internal_readers = prepareInternalMetric(d, config.scale_by) + 1
            } else {
                d.num_readers = 0;
                d.internal_readers = 1;
            }
            
            d.num_subentries = 0;
            
            if (config.list_sub_entries) {
                d.abstract_search = "";
                d.paper_abstract.forEach(function(obj) {
                    d.abstract_search += obj.abstract + " ";
                    d.num_subentries++;
                })
            }
            
            if(config.metric_list) {
                d.tweets = prepareMetric(d, "cited_by_tweeters_count")
                d.citations = prepareMetric(d, "citation_count")
                d.readers = prepareMetric(d, "readers.mendeley")
            } else {
                d.readers = d.num_readers;
            }

            d.paper_selected = false;
            
            d.oa = false;
            d.free_access = false;

            if (config.service === "doaj") {
                d.oa = true;
                d.oa_link = d.link;
            } else if (config.service === "plos") {
                d.oa = true;
                var journal = d.published_in.toLowerCase();
                d.oa_link = "http://journals.plos.org/" +
                    config.plos_journals_to_shortcodes[journal]
                  + "/article/asset?id=" + d.id + ".PDF";
            } else if (typeof d.pmcid !== "undefined") {
                if (d.pmcid !== "") {
                    d.oa = true;
                    d.oa_link = "http://www.ncbi.nlm.nih.gov/pmc/articles/" + d.pmcid + "/pdf/";
                }
            } else if(config.service === "base") {
                d.oa = (d.oa_state === 1 || d.oa_state === "1")?(true):(false);
                d.oa_link = d.link;
            } else if(config.service === "openaire") {
                d.oa = (d.oa_state === 1 || d.oa_state === "1")?(true):(false);
                d.oa_link = d.link;
            } else if(config.service === "linkedcat") {
                d.oa_link = d.link;
                d.oa = (d.oa_state === 1 || d.oa_state === "1")?(true):(false);
            } else {
                d.oa = (d.oa_state === 1 || d.oa_state === "1")?(true):(false);
                d.oa_link = d.link;
                d.free_access = (d.oa_state === 3 || d.oa_state === "3")?(true):(false);
            }

            d.outlink = _this.createOutlink(d);
            
            num_oa += (d.oa)?(1):(0);
            num_papers += (d.resulttype === 'publication')?(1):(0);
            num_datasets += (d.resulttype === 'dataset')?(1):(0);
            
            if(config.list_show_external_vis) {
                d.external_vis_link = config.external_vis_url 
                                + "?vis_id=" + config.files[mediator.current_file_number].file 
                                + "&doc_id=" + d.id
                                + "&search_term=" + context.query.replace(/\\(.?)/g, "$1");
            }
            
            d.comments_for_filtering = _this.createCommentStringForFiltering(d.comments);
            
            if(config.highlight_query_terms) {
                for (let field of config.highlight_query_fields) {
                    d[field + config.sort_field_exentsion] = d[field];
                }
            }

        });
        
        this.num_oa = num_oa;
        this.num_papers = num_papers;
        this.num_datasets = num_datasets;
        
        var areas = this.areas;
        cur_data.forEach(function (d) {
            var area = (config.use_area_uri) ? (d.area_uri) : (d.area);
            if (area in areas) {
                areas[area].papers.push(d);
            } else {
                areas[area] = {};
                areas[area].title = d.area;
                areas[area].papers = [d];
            }

            d.resized = false;
        });

        this.data = cur_data;
    },
    
    createCommentStringForFiltering: function(comments) {
        let return_string = "";
        
        for(let comment of comments) {
            return_string += comment.comment + " " + comment.author;
        }
        
        return return_string;
    },
    
    convertToSafeID: function (id) {
        let id_string = id.toString();
        
        return id_string.replace(/[^a-zA-Z0-9]/g, function(s) {
            var c = s.charCodeAt(0);
            if (c === 32) return '-';
            return '__' + ('000' + c.toString(16)).slice(-4);
        });
    },

    createOutlink: function(d) {
        var url = false;
        if (config.service == "base") {
          url = d.oa_link;
        } else if (config.service == "openaire" && d.resulttype == "dataset") {
            url = config.url_prefix_datasets + d.url;
        } else if(config.url_prefix !== null) {
            url = config.url_prefix + d.url;
        } else if (typeof d.url != 'undefined') {
            url = d.url;
        }

        return url;
    }
};
//var io = new IO();
export const io = new IO();

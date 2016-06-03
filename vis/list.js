// StateMachine for List UI element in Headstart
// Filename: list.js

var list = StateMachine.create({

    events: [
        { name: "start",  from: "none",    to: "hidden"  },
        { name: "show",   from: "hidden",  to: "visible" },
        { name: "hide",   from: "visible", to: "hidden"  },
        { name: "toggle", from: "hidden",  to: "visible" },
        { name: "toggle", from: "visible", to: "hidden"  },
    ],

    callbacks: {
        onbeforestart: function( event, from, to, bubbles ) {
            this.width = headstart.list_width;
            this.papers_list = null;
            this.drawList();
            this.populateList( bubbles.data );
            this.initListMouseListeners();
            sortBy(headstart.sort_options[0]);
        },

        onshow: function( event, from, to ) {
            // if the papers_force has stopped.
            if(!papers.is("loading")) {
                d3.select("#sort_container").style("display", "block"); 
                d3.select("#papers_list").style("display", "block");
                d3.select("#left_arrow").text("\u25B2");
                d3.select("#right_arrow").text("\u25B2");
                d3.select("#show_hide_label").text(headstart.localization[headstart.language].hide_list);
            }
        },

        onhide: function( event, from, to ) {
            d3.select("#sort_container").style("display", "none");
            d3.select("#papers_list").style("display", "none");
            d3.select("#left_arrow").text("\u25BC");
            d3.select("#right_arrow").text("\u25BC");
            d3.select("#show_hide_label").text(headstart.localization[headstart.language].show_list);
        },

        onbeforetoggle: function( event, from, to ) {
            if(this.current == "visible") {
               this.hide();
               headstart.mediator.publish("record_action","none", "hide_list", headstart.user_id, "none", null);
               // headstart.recordAction("none", "hide_list", headstart.user_id, "none", null);
            } else  {
                this.show();
                headstart.mediator.publish("record_action","none", "show_list", headstart.user_id, "none", null);
                // headstart.recordAction("none", "show_list", headstart.user_id, "none", null);
            }
        }
    }
});

list.drawList = function() {
    // Load list template
    compiledTemplate = Handlebars.getTemplate('list_explorer');
    list_explorer = compiledTemplate();
    $("#list_explorer").append(list_explorer);

    // Set localized values
    $("#filter_input")
    .attr("placeholder", headstart.localization[headstart.language].search_placeholder)
    .keyup(function(event){
        debounce(filterList(event), 700)
      })

    // Add sort options
    var container = d3.select("#sort_container>ul")
    var first_element = true;
    for (option in headstart.sort_options) {
      if (first_element) {
        addSortOption(container, headstart.sort_options[option], true);
        first_element = false;
      } else {
        addSortOption(container, headstart.sort_options[option], false);
      }
    }

    this.fit_list_height();
    this.papers_list = d3.select("#papers_list");
}

list.fit_list_height = function() {
  paper_list_avail_height = $(("#"+headstart.tag)).height() - $("#explorer_header").height() - 10;
  $("#papers_list").height(paper_list_avail_height);
}

addSortOption = function(parent, sort_option, selected) {
  if (selected) {
    checked_val = "checked"
    active_val = "active"
  } else {
    checked_val = ""
    active_val = ""
  }

  compiledTemplate = Handlebars.getTemplate('select_button');
  button = compiledTemplate({id:"sort_" + sort_option,
                                     checked:checked_val,
                                     label:sort_option,
                                     active:active_val});
  $("#sort-buttons").append(button);

  // Event listeners
  $("#sort_" + sort_option).change(function(event) {
      sortBy(sort_option);
      headstart.recordAction("none", "sortBy", headstart.user_id, "listsort", null, "sort_option=" + sort_option);
    })
}

function sortBy(field) {
    d3.selectAll("#list_holder")
        .sort(function(a, b) {
            if (field == "year") {
                return stringCompare(b[field], a[field]);
            } else {
                return stringCompare(a[field], b[field]);
            }
        })
}


function stringCompare(a, b) {
  if(typeof a == 'undefined' || typeof b == 'undefined'){
    return;
  } else if(typeof a == 'string' && typeof b == 'string') {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : a == b ? 0 : -1;
  } else if(typeof a == 'number' && typeof b == 'number') {
    return d3.descending(a, b);
  }
  else {
    return d3.descending(a, b);
  }
}

list.initListMouseListeners = function() {
    $("#show_hide_button")
        .on("mouseover", function() {
            $("#show_hide_button").addClass("hover")
        })
        .on("mouseout", function() {
            $("#show_hide_button").removeClass("hover")
        })
        .on("click", function(event) {
            headstart.mediator.publish("list_toggle")
        });

    d3.selectAll("#list_title").on("click", function(d) {
        headstart.mediator.publish("list_title_clickable", d);
    });
}

list.getPaperNodes = function(list_data) {
  return list.papers_list.data(list_data).selectAll("div")
                  .data(list_data)
                  .enter().append("div")
                  .attr("id", "list_holder")
                  .sort(function(a,b) {  return b.readers - a.readers; });
}

list.populateList = function(list_data) {

    list_data.filter(function(el){
        return el !== null;
    });

    var paper_nodes = this.getPaperNodes(list_data);
    this.populateMetaData(paper_nodes);
    this.createAbstracts(paper_nodes);
    this.populateReaders(paper_nodes);
}

list.populateMetaData = function(nodes) {
  
  var paper_title = nodes.append("div")
    .attr("class", "list_metadata")
    .append("p")
    .attr("id", "list_title")
    .attr("class","highlightable")
    .html(function (d) { return "<a href=\"#\" id=\"paper_list_title\" class=\"highlightable\">" + d.title+"</a> " })
  
  paper_title.filter(function(d) {
        return d.recommended == 1 && d.bookmarked != 1;    
    })
    .append("span")
     .attr("class", "recommended")
     .html("recommended")
     .append("span")
      .html(" ")
   
  if(headstart.is_adaptive) {
    paper_title.filter(function(d) {
          return (d.bookmarked != 1);    
      })
      .append("span")
       .attr("class", "tobookmark")
       .attr("id", "bookmark")
       .html("Add to schedule")
       .on("click", function (d) {
          headstart.mediator.publish("bookmark_added",d);
         // list.addBookmark(d);      
         d3.event.stopPropagation();
       })
  }
     
  paper_title.filter(function(d) {
        return (d.bookmarked == 1);    
    })
    .append("span")
     .attr("class", "bookmarked")
     .attr("id", "bookmark")
     .html("Already in your schedule X")
     .on("click", function (d) { 
        headstart.mediator.publish("bookmark_removed", d);
       // list.removeBookmark(d);
       d3.event.stopPropagation();
     })
  
  paper_title.append("p")
    .attr("class", "list_details highlightable")
    .html(function (d) { return d.authors_string })
    .append("span")
    .attr("class", "list_in")
    .html(" in ")
    .append("span")
    .attr("class", "list_pubyear")
    .html(function (d) { return d.published_in + " (" + d.year + ")" });
}

filterList = function(event) {
  clear_highlights();
  var search_words = event.target.value.split(" ");
  search_words.forEach(function(str){
    highlight(str);
  });
  

  var filtered_data = d3.selectAll("#list_holder, .paper")
  var current_circle = d3.select(headstart.current_zoom_node);
  
    var data_circle = filtered_data
    .filter(function (d) {
      if (headstart.is_zoomed === true) {
        if (headstart.use_area_uri && headstart.current_enlarged_paper == null)
          return current_circle.data()[0].area_uri == d.area_uri;
        else if (headstart.use_area_uri && headstart.current_enlarged_paper != null)
            return headstart.current_enlarged_paper.id == d.id;
        else
          return current_circle.data()[0].title == d.area;
      } else {
        return true;
      }
    })

  if (event.target.value === "") {
    data_circle.style("display", "block")

      headstart.bubbles[headstart.current_file_number].data.forEach(function (d) {
        d.filtered_out = false;
      })

    return;
  }

  data_circle.style("display", "inline")

  var searchtext = event.target.value;
  var searchtext_processed = searchtext.trim().toLowerCase();
  var search_words = searchtext_processed.split(" ");
  
  headstart.mediator.publish("record_action","none", "filter", headstart.user_id, "filter_list", null, "search_words=" + search_words);
  // headstart.recordAction("none", "filter", headstart.user_id, "filter_list", null, "search_words=" + search_words);

  filtered_data
    .filter(function (d) {
      var abstract = d.paper_abstract.toLowerCase();
      var title = d.title.toLowerCase();
      var authors = d.authors_string.toLowerCase();
      var word_found = true;
      var count = 0;
      if(typeof abstract !== 'undefined') {
        while(word_found && count < search_words.length) {
          word_found = (abstract.indexOf(search_words[count]) !== -1
            || title.indexOf(search_words[count]) !== -1
            || authors.indexOf(search_words[count]) !== -1);
          count++;
        }
        d.filtered_out = word_found?false:true;
        return d.filtered_out;
      }
      else {
        d.filtered_out = true;
        return false;
      }
    })
  .style("display", "none")
}

list.createAbstracts = function(nodes) {
  nodes.append("div")
    .attr("class", "abstract")
    .append("p")
    .attr("id", "list_abstract")
    .attr("class","highlightable")
    .html(function (d) { return list.createAbstract(d, headstart.abstract_small) });
}

list.populateReaders = function(nodes) {
  var areas = nodes.append("div")
    .attr("class", "list_readers")
    .append("p")
    .attr("id", "list_area")
    .html(function(d) {
      return "<b>"+ headstart.localization[headstart.language].area + ":</b> " + d.area
    })
    
  if(!headstart.content_based) {
   areas.append("p")
    .attr("id", "list_readers")
    .html(function (d) {
      return d.readers
    })
  .append("span")
    .attr("class", "list_readers_entity")
    .html(" " + headstart.base_unit + "&nbsp;");
    
  } else {
    d3.selectAll("#list_area").style("margin-bottom", "7px")
    
  }
}

// called quite often
list.createAbstract = function(d, cut_off) {
    if(cut_off) {
        if(d.paper_abstract.length > cut_off) {
            return d.paper_abstract.substr(0,cut_off) + "...";
        }
    }
    return d.paper_abstract
}

list.addBookmark = function(d)  {
  $.getJSON(headstart.service_path + "addBookmark.php?"
    + "user_id=" + headstart.user_id
    + "&content_id=" +d.id,
      function(data) {
        console.log("Successfully added bookmark");
        
        headstart.mediator.publish("record_action",d.id, "add_bookmark", headstart.user_id, d.bookmarked + " " + d.recommended, data);
        // headstart.recordAction(d.id, "add_bookmark", headstart.user_id, d.bookmarked + " " + d.recommended, data);

        d.bookmarked = true;

        d3.selectAll("#bookmark").filter(function(x) {
          return x.id == d.id;
        })
            .attr("class", "bookmarked")
            .html("Already in your schedule X")
             .on("click", function (d) { 
                headstart.mediator.publish("bookmark_removed", d);
               // list.removeBookmark(d); 
               d3.event.stopPropagation();
             })
             
        d3.selectAll("#region").filter(function (x) {
          return x.id == d.id
        })
          .attr("class", "framed_bookmarked")
       }
  );
}

list.removeBookmark = function(d)  {
  $.getJSON(headstart.service_path + "removeBookmark.php?"
    + "user_id=" + headstart.user_id
    + "&content_id=" +d.id,
      function(data) {
        console.log("Successfully removed bookmark");
        
        headstart.mediator.publish("record_action",d.id, "remove_bookmark", headstart.user_id, d.bookmarked + " " + d.recommended, data);
        // headstart.recordAction(d.id, "remove_bookmark", headstart.user_id, d.bookmarked + " " + d.recommended, data);
        
        d.bookmarked = false;
        
        d3.selectAll("#bookmark").filter(function(x) {
         return x.id == d.id;
       })
            .attr("class", "tobookmark")
            .html("Add to schedule")
             .on("click", function (d) { 
                headstart.mediator.publish("bookmark_added", d);
               // list.addBookmark(d); 
               d3.event.stopPropagation();
             })
        
        d3.selectAll("#region").filter(function (x) {
          return x.id == d.id
        })
            .attr("class", function (d) {
              return (d.recommended)?("framed_recommended"):("unframed");
            })
        
      });
}

list.makeTitleClickable = function(d) {
    headstart.current_circle =  headstart.chart.selectAll("circle").
                                filter(function (x) {
                                  if (headstart.use_area_uri)
                                    return x.area_uri == d.area_uri;
                                  else
                                    return x.title == d.area;
                                });

    headstart.bubbles[headstart.current_file_number].zoomin(headstart.current_circle.data()[0]);
    headstart.bubbles[headstart.current_file_number].current = "hoverbig";
    papers.mouseoverpaper();
    this.enlargeListItem(d);
    headstart.current_enlarged_paper = d;
    
    d3.selectAll("path#region")
            .filter(function(x) {
                return x.id === d.id;
            })
                .attr("class", "framed");

    headstart.mediator.publish("record_action", d.id, "click_paper_list", headstart.user_id, d.bookmarked + " " + d.recommended, null);
    // headstart.recordAction(d.id, "click_paper_list", headstart.user_id, d.bookmarked + " " + d.recommended, null);
    
    d3.event.stopPropagation();
}

list.enlargeListItem = function(d) {
    if(headstart.current_enlarged_paper != null) {
      if(headstart.current_enlarged_paper.id == d.id) {
        return;
      } else {
        this.reset();
        headstart.current_enlarged_paper.paper_selected = false;
      }
    }

    this.setListHolderDisplay(d);

    this.papers_list.selectAll("#list_abstract")
                    .html(this.createAbstract(d,headstart.abstract_large));

    this.setImageForListHolder(d);
}

list.setListHolderDisplay = function(d) {
  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
        if (headstart.use_area_uri)
          return (x.area_uri == d.area_uri);
        else
          return (x.area == d.area);
    })
  .style("display", function (d) { return d.filtered_out?"none":"inline"});

  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.id != d.id)
    })
  .style("display", "none");
}

// recreates abstracts, if we zoom out from circle
list.reset = function() {

    d3.selectAll("#list_abstract")
    .html(function (d) {
        return list.createAbstract(d, headstart.abstract_small)
    });

    if (headstart.current_enlarged_paper !== null) {
      notSureifNeeded();
    }
}

// display a preview image of paper and page if preview image is
// available
list.loadAndAppendImage = function(image_src, page_number) {

    if (this.testImage(image_src)) {
        popup.paper_frame.select("#preview")
           .append("div")
            .attr("id", "preview_page_index")
            .style("width", headstart.preview_image_width + "px")
            .html("Page " + page_number)

        popup.paper_frame.select("#preview")
           .append("img")
            .attr("id", "preview_page")
            .attr("class", "lazy")
            .attr("src", image_src)
            .style("height", headstart.preview_image_height + "px")
            .style("width", headstart.preview_image_width + "px")

    } else {
        return false;
    }
    return true;
}

list.populateOverlay = function (d) {
    
    var this_d = d;
    
	headstart.mediator.publish("popup_toggle");
	
	$("#intro").hide();
    
    if(headstart.preview_type == "image") {
        list.loadAndAppendImage(headstart.images_path + d.id + "/page_1.png", 1);

        var images_finished = false
        , counter = 2;

        while(!images_finished) {
            var image_src = headstart.images_path + d.id + "/page_" + counter + ".png";

            if (!list.loadAndAppendImage(image_src, counter)) {
                images_finished = true;
            }

            counter++;
        }
    } else if (headstart.preview_type == "pdf") {
        
        var writePopup = function(pdf_url) {
            popup.paper_frame.select("#preview")
           .append("iframe")
           .attr("width", 781 - 4)
           .attr("height", 460 - 75)
           .attr("src", function() { 
               return pdf_url;
            })
        }
        
        var filename = this_d.id + ".PDF";
        var local_filename = filename.replace("/", "__");
        
        var full_pdf_url = headstart.images_path + local_filename;
        
        if (this.testImage(full_pdf_url)) {
            writePopup(full_pdf_url)
        } else {
            popup.paper_frame.select("#preview").append("img")
                    .attr("src", headstart.images_path + "ajax-loader.gif")
                    .style("margin", "0 auto")
                    .style("display", "block")
            
            var journal = this_d.published_in.toLowerCase();
            var url = "http://journals.plos.org/" + headstart.plos_journals_to_shortcodes[journal] + "/article/asset?id=" + filename;

            $.getJSON(headstart.service_path + "getPDF.php?url=" + url + "&filename=" + local_filename, function (local_pdf) {
                d3.select("#preview img").remove();
                writePopup(headstart.images_path + local_pdf);
            })
        }
    }
}

list.setImageForListHolder = function(d) {
  list.papers_list = d3.select("#papers_list");
  var current_item = list.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.id == d.id)
    });

  var image_src = (headstart.preview_type=="images")?(headstart.images_path + d.id + "/page_1.png"):(headstart.images_path + "/preview_pdf.png");

  if (this.testImage(image_src)) {

    current_item.append("div")
      .attr("id", "preview_image")
      .style("width", headstart.preview_image_width_list + "px")
      .style("height", headstart.preview_image_height_list+ "px")
      .style("background", "url(" + image_src + ")")
      .style("background-size", headstart.preview_image_width_list + "px, " + headstart.preview_image_height_list+ "px")
      .on("mouseover", function (d) {
        headstart.mediator.publish("preview_mouseover", current_item);
        // current_item.select("#transbox")
        // .style("display", "block");
      })
      .on("mouseout", function (d) {
        headstart.mediator.publish("preview_mouseout", current_item);
        // current_item.select("#transbox")
        // .style("display", "none");
      })
      .append("div")
        .attr("id", "transbox")
        .style("width", headstart.preview_image_width_list + "px")
        .style("height", headstart.preview_image_height_list+ "px")
        .html("Click here to open preview")
        .on("click", function(d){
          headstart.mediator.publish("list_show_popup", d);
          // this.populateOverlay;
        })
  }
  
  /*$("#list_title a").hover(function () {
      $(this).css("text-decoration", "none");
  });*/
  
  // EVENTLISTENERS
  current_item.select("#paper_list_title")
    .on("click", function(d){
      headstart.mediator.publish("list_title_click", d);
      // list.title_click();
    });
}

list.title_click = function (d) {
        
      var url = "";
      if (headstart.url_prefix != null) {
          url = headstart.url_prefix + d.url;
      } else if (typeof d.url != 'undefined') {
          url = d.url;
      } else {
          d3.event.stopPropagation();
          return
      }
      
      headstart.mediator.publish("record_action",d.id, "click_on_title", headstart.user_id, d.bookmarked + " " + d.recommended, null, "url=" + d.url);
      // headstart.recordAction(d.id, "click_on_title", headstart.user_id, d.bookmarked + " " + d.recommended, null, "url=" + d.url);
      
      window.open(url, "_blank");
      d3.event.stopPropagation();
    }

// test if preview Image is available
list.testImage = function(image_src) {

    var http = new XMLHttpRequest();
    http.open('HEAD', image_src, false);
    try {
      http.send();
    } catch (e) {
      console.log(e);
    } finally {
      return http.status != 404;
    }
}

function notSureifNeeded() {
  var list_holders_local =
    list.papers_list.selectAll("#list_holder")
    .filter(function (d) {
      return (headstart.current_enlarged_paper.id == d.id)
    });

  list_holders_local.select("#paper_list_title")
    // EVENTLISTENERS
    .on("click", function (d) {
      headstart.mediator.publish("list_title_clickable", d)
      // list.makeTitleClickable(d)
    });

  var image_node = list_holders_local.select("#preview_image").node();
  if (image_node != null)
    image_node.parentNode.removeChild(image_node);
}

highlight = function(str) {
  value = new RegExp("\\b"+str,"i");

  $('.highlightable').highlightRegex(value, {
    attrs: {'style': "background:yellow"}
  });
}

clear_highlights = function() {
  $('.highlightable').highlightRegex();
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
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

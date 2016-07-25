// StateMachine for Popup UI element in Headstart
// Filename: popup.js
var popup = StateMachine.create({
    
    events: [
        { name: "start", from:  "none",    to: "hidden"  },
        { name: "show",  from:  "hidden",  to: "visible" },
        { name: "hide",  from:  "visible", to: "hidden"  }
    ],

    callbacks: {
        onbeforestart: function( event, from, to ) {
            this.paper_frame = d3.select( "#paper_frame" );
            // this.width = 781;
            // this.height = 460;
            // this.drawPopUp();

            // var button = this.drawHideButton( paper_frame_inner );
            // button.on("click", function (d) {
            //   headstart.mediator.publish("popup_toggle");
            //   // popup.hide();
            // });

            // this.drawPreviewArea( paper_frame_inner );
            
            // this.initClickListenersForNav();
            
        },
        
        onstart: function ( event, from, to ) {

        },

        onshow: function( event, from, to ) {
          // popup.paper_frame
          //         .style ( "display", "block" )
                            
          // popup.paper_frame.select( "#preview" )
          //                  .append( "div" )
          //                  .attr  ( "id", "intro" )
          //                  .html(intro_html);
         
         headstart.mediator.publish("record_action","none", "show_popup", headstart.user_id, "none", null);
         // headstart.recordAction("none", "show_popup", headstart.user_id, "none", null);
        },

        onhide: function( event, from, to ) {
          popup.paper_frame.select("#preview").node().scrollTop = 0;
          popup.paper_frame.style("display", "none");
          var node = popup.paper_frame.select("#preview").node();
          while (node.hasChildNodes()) {
              node.removeChild(node.lastChild);
          }
          headstart.mediator.publish("record_action","none", "hide_popup", headstart.user_id, "none", null);
          // headstart.recordAction("none", "hide_popup", headstart.user_id, "none", null);
        }
    }
});

// The paper frame is the main popup element.
popup.drawPopUp = function() {

  var width = $("#" + headstart.tag).width();
  var height = $("#" + headstart.tag).height();
  
  var position = $("#" + headstart.tag).position();

    popup.paper_frame
         .style( "position", "absolute" )
         .style( "top", position.top + "px" )
         .style( "left", position.left + "px" )
         .style( "width",  width + "px" )
         .style( "height", height + "px" )
         .style( "display", "none");

    toFront(popup.paper_frame.node());

    paper_frame_inner = popup.paper_frame.append("div")
    .attr ( "id", "paper_frame_inner" )
    .style( "width",  popup.width  + "px" )
    .style( "height", popup.height + "px" )
    .style( "margin-top", function (d) {
      return headstart.current_vis_size/2 - popup.height/2 + "px";
    });
}

// Draw a "close" button for the popup and position it
// in top right corner of paper_frame.
popup.drawHideButton = function() {
    var button = paper_frame_inner.append( "div" )
                 .attr  ( "id", "paper_frame_bar" )
                 .style ( "width",  popup.width + "px" )
                 .style ( "height", headstart.preview_top_height + "px" )
                 .append( "img" )
                 .attr  ( "src", headstart.images_path + "close.png" )
                 .attr  ( "id", "close-button" )

    return button;
}

// Draws the area for the description text of the headstart project.
popup.drawPreviewArea = function( paper_frame_inner ) {

    paper_frame_inner.append("div").attr( "id", "shadow-top" );

    paper_frame_inner.append("div")
        .attr ( "id", "preview" )
        .attr ( "width",  popup.width + "px" )
        .attr ( "height", headstart.preview_page_height + "px" )
        .style( "height", headstart.preview_page_height + "px" );

    paper_frame_inner.append("div").attr( "id","shadow-bottom" );
}

/*popup.loadAndAppendImage =  function( image_src, page_number ) {

    if (list.testImage(image_src)) {
        this.paper_frame.select("#preview")
           .append("div")
            .attr("id", "preview_page_index")
            .style("width", headstart.preview_image_width + "px")
            .style("height", "20px")
            .html("Page " + page_number)

        this.paper_frame.select("#preview")
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
    
}*/

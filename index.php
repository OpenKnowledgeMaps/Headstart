<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <script type="text/javascript" src="vis/lib/jquery-1.8.1.min.js">
            </script>
            <script type="text/javascript" src="vis/vis.js"></script>
    </head>

    <body style="margin:0px; padding:0px">
        <div id="visualization"></div>
        <script>
                
                var height = ($(document).height() < 700)?(700):($(document).height());
                var width = ($(document).width() < 700)?(700):($(document).width());
                //$("#visualization").css("height", height + "px");
                
                var myHeadstart = new Headstart(
                        "http://localhost/" //host
                        , "headstart2/" //path
                        , "visualization" //append to tag
                        , [{
                                title: "dna"
                                , file: "<?php echo $_GET["id"] ?>"
                            }
                            ] //data
                        , {title: "Overview of PLOS articles for <?php echo (!isset($_GET["query"])?($_GET["id"]):($_GET["query"])) ?>"
                            , width: width
                            , height: height
                            , max_diameter_size: 45
                            , min_diameter_size: 25
                            , max_area_size: 90
                            , min_area_size: 50
                            , use_area_uri: true
                            , input_format: "json"
                            , base_unit: "views"
                            , show_timeline: false
                            , show_dropdown: false
                            , is_force_areas: true
                            , preview_type: "pdf"
                            , sort_options: ["readers", "title", "authors"]
                            } //options
                )
        </script>

    </body>
</html>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <script type="text/javascript" src="vis/lib/jquery-2.1.4.min.js"></script>
        <link rel="stylesheet" type="text/css" href="vis/lib/bootstrap.min.css">
        <script type="text/javascript" src="vis/lib/bootstrap.min.js"></script>
        <script type="text/javascript" src="vis/lib/handlebars.min-v4.0.5.js"></script>
        <script type="text/javascript" src="vis/templates/templates.js"></script>
        <script type="text/javascript" src="vis/vis.js"></script>

    </head>

    <body style="margin:0px; padding:0px">
        
        <div id="visualization"></div>
        <script>               
                var myHeadstart = new Headstart(
                        "http://localhost/" //host
                        , "headstart3/" //path
                        , "visualization" //append to tag
                        , [{
                                title: "dna"
                                , file: "<?php echo $_GET["id"] ?>"
                            }
                            ] //data
                        , {title: "Overview of PLOS articles for <?php echo (!isset($_GET["query"])?($_GET["id"]):($_GET["query"])) ?>"
                            , paper_max_scale: 1
							, paper_min_scale: 1
							, bubble_max_scale: 1
							, bubble_min_scale: 1
                            , use_area_uri: true
                            , input_format: "json"
                            , base_unit: "views"
                            , show_timeline: false
                            , show_dropdown: false
                            , preview_type: "pdf"
                            , sort_options: ["readers", "title", "authors"]
							, show_timeline: false
							, force_areas: true
							, force_areas_alpha: 0.015
                            } //options
                )
        </script>

         <div style="margin-top:20px">Built with <a href="http://github.com/pkraker/Headstart" target="_blank">Headstart</a> and <a href="http://github.com/ropensci/rplos" target="_blank">rplos</a>. All content retrieved from <a href="https://www.plos.org/publications/journals/" target="_blank">Public Library of Science Journals</a> under <a href="http://journals.plos.org/plosone/s/content-license" target="_blank">CC-BY</a>.
        </div>
    </body>
</html>
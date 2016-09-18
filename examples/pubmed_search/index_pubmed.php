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
                        , {title: "Overview of PubMed articles for <?php echo (!isset($_GET["query"])?($_GET["id"]):($_GET["query"])) ?>"
                            , max_diameter_size: 1
                            , min_diameter_size: 1
                            , max_area_size: 1
                            , min_area_size: 1
                            , use_area_uri: true
                            , input_format: "json"
                            , base_unit: "citations"
                            , show_timeline: false
                            , show_dropdown: false
                            , preview_type: "pdf"
                            , sort_options: ["readers", "title", "authors", "year"]
                            , is_force_areas: true
                            , localization: "eng_pubmed"
                            , force_areas_alpha: 0.015
                            , show_list: true
                            , is_content_based: false
                            } //options
                )
        </script>

         <div style="margin-top:20px">Built with <a href="http://github.com/pkraker/Headstart" target="_blank">Headstart</a> and <a href="https://github.com/ropensci/rentrez" target="_blank">rentrez</a>. All content retrieved from <a href="http://www.ncbi.nlm.nih.gov/pubmed" target="_blank">PubMed</a>.
        </div>
    </body>
</html>
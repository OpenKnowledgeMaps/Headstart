<!DOCTYPE html>
<?php
include 'config.php';

function curl_get_contents($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}

function checkReturn($object, $field, $default = "") {
    if(isset($object[$field])) {
        return $object[$field];
    } else {
        return $default;
    }
}

$protocol = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https:' : 'http:';
$headstart_url = $protocol . $SITE_URL . $HEADSTART_PATH;
$context_json = curl_get_contents($headstart_url . "server/services/getContext.php?vis_id=$SHEET_ID");
$context = json_decode($context_json, true);

$topic = checkReturn($context, "topic");
$main_curator_name = checkReturn($context, "main_curator_name");
$main_curator_email = checkReturn($context, "main_curator_email");
$project_name = checkReturn($context, "project_name");
$project_website = checkReturn($context, "project_website", null);
?>
<html>

<head>
    <link type="text/css" rel="stylesheet" href="map.css">
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    
    <title>Knowledge Map of <?php echo $topic ?></title>
</head>

<body class="knowledge-map" style="margin:0px; padding:0px; height:100%;">
    <div id="visualization" class="headstart"></div>
    <div id="errors" class="errors-container"></div>
    <div id="reload" class="reload-button"><i class="fas fa-redo"></i><span id="reload-text"> An update is available <br><a id="reload" class="dismiss-reload">reload now</a> or <a id="dismiss-reload" class="dismiss-reload">do it later</a></span></div>
    <script type="text/javascript">
        
        function displayErrors(errors) {
            if(errors.length > 0) {
                $("#errors").addClass("show-errors")
                
                let errors_info =
                    $("<p/>", {
                        id: "errors-info"
                        , class: "errors-info"
                        , html: '<i id="expand-icon" class="fa fa-plus-circle expand-icon" aria-hidden="true"/> The following errors were detected in the data sheet:</i>'
                    });
                $("#errors").append(errors_info);
                
                let errors_table =
                     $("<table/>", {
                         id: "errors-table"
                         , class: "errors-table errors-table-hidden"
                     });   
                
                $("#errors").append(errors_table);
                
                $("<tr/>", {
                    id: "top-row"
                    , class: "top-row"
                }).appendTo("#errors-table");

                for (let field of ["Row", "Column", "Details"]) {
                    $("<th/>", {
                        class: "error-row-top"
                        , text: field
                    }).appendTo("#top-row");

                }
                
                for (let error_num in errors) {
                    let current_id = "error-row-" + error_num;
                    $("<tr/>", {
                        id: current_id
                        , class: "error-row-entry"
                    }).appendTo("#errors-table")
                    
                    for (let field of ["row", "column", "reason"]) {
                        $("<td/>", {
                            id: "error-row-row"
                            , class: "error-row-entry"
                            , text: errors[error_num][field]
                        }).appendTo("#" + current_id)
                    }
                }
                                          
            }
            
            $("#errors-info").on("click", function () {
                $("#errors-table").toggleClass("errors-table-hidden");
                $("#expand-icon").toggleClass("fa-minus-circle");
            });
        }
        
        function updateCheck(context) {
            $.getJSON("<?php echo $headstart_url ?>server/services/GSheetUpdateAvailable.php?vis_id=<?php echo $SHEET_ID ?>&persistence_backend=<?php echo $PERSISTENCE_BACKEND ?>&gsheet_last_updated=" + encodeURIComponent(context.last_update),
                        function(output) {
                            if (output.update_available) {
                                $("#reload").addClass("show-reload-button");
                                $("#reload-text").removeClass("hide-reload-text");
                                window.clearInterval(check_update);
                            }
                        });
        }
        
        <?php if(isset($DEBUG) && $DEBUG === true): ?>
            function updateMap() {
                $.getJSON("<?php echo $headstart_url ?>server/services/updateGSheetsMap.php?q=covis&sheet_id=<?php echo $SHEET_ID ?>",
                            function(output) {
                            });
            }

            var update_map = window.setInterval(updateMap, 45000);
        <?php endif; ?>
        
        let elem = document.getElementById('visualization');
        var check_update = null;
        
        elem.addEventListener('headstart.data.loaded', function(e) {
            let errors = e.detail.data.errors;
            displayErrors(errors);
            check_update = window.setInterval(updateCheck, 6000, e.detail.data.context);
            
        });
                   
    </script>
    <script type="text/javascript" src="data-config.js"></script>
    <script type="text/javascript" src="<?php echo $headstart_url ?>dist/headstart.js"></script>
    <link type="text/css" rel="stylesheet" href="<?php echo $headstart_url ?>dist/headstart.css"></link>
    <script>
            
            data_config.server_url = "<?php echo $headstart_url ?>server/";
            data_config.files = [{
                title: 'CoVis'
                , file: "<?php echo $SHEET_ID; ?>"
            }]
            
            data_config.title = "Knowledge map of <b><?php echo $topic ?></b>";
            data_config.service_name= '<span class="backlink"><a href="https://docs.google.com/spreadsheets/d/<?php echo $SHEET_ID ?>/edit#gid=0" class="underline" target="_blank" >Spreadsheet</a></span>';
            
            data_config.intro = {
                title: "About this knowledge map"
                , body: "<p>Knowledge maps provide an instant overview of a topic by showing the main areas at a glance and resources related to each area. This makes it possible to easily identify useful, pertinent information.</p><p>Research areas are displayed as bubbles. By clicking on one of the bubbles, you can inspect the resources assigned to it. The size of the bubbles is relative to the number of resources assigned to it. Closeness of bubbles implies subject similarity. The closer two bubbles, the closer they are subject-wise. Centrality of bubbles implies subject similarity with the rest of the map, not importance. The closer a bubble is to the center, the closer it is subject-wise to all the other bubbles in the map. </p><h3>Content</h3><p>The content of this knowledge map is curated by <a class='link-popup' href='mailto:<?php echo $main_curator_email ?>'><?php echo $main_curator_name ?></a> as part of <?php if ($project_website !== null) { echo "<a href='." . $project_website . "' target='_blank' class='link-popup'>" . $project_name . "</a>"; } else { echo $project_name; } ?>. Resources are collected and annotated in <a href='https://docs.google.com/spreadsheets/d/<?php echo $SHEET_ID ?>/edit#gid=0' class='link-popup' target='_blank'>a spreadsheet</a>, which is then transformed into the knowledge map.</p><h3>Software</h3><p>The knowledge map is based on the award-winning software developed by Open Knowledge Maps. For more information and the ability to create knowledge maps based on 250+ million documents, please see <a target='_blank' class='link-popup' href='https://openknowledgemaps.org/'>openknowledgemaps.org</a>. To get in touch, please e-mail us at <a target='_blank' class='link-popup' href='mailto:info@openknowledgemaps.org'>info@openknowledgemaps.org</a></p><h3>Rights</h3><p>The curator(s) are solely responsible for the content of the knowledge map. Unless otherwise noted, all content is licensed under a <a class='link-popup' href='http://creativecommons.org/licenses/by/4.0/' target='_blank'>Creative Commons Attribution 4.0 International License</a>. The spreadsheet is made available under <a target='_blank' class='link-popup' href='https://creativecommons.org/share-your-work/public-domain/cc0/'>CC0 (Public Domain Dedication)</a>. The knowledge mapping software is open source and hosted on <a class='link-popup' href='https://github.com/OpenKnowledgeMaps/Headstart' target='_blank'>Github</a>.</p>"
    };
            
            $(document).ready(function () {
                headstart.start();
            })
        
    </script>
        
    <script>
        var calcDivHeight = function () {

            let height = $(window).height();
            let width = $(window).width();
            let calculated_height = 0;
            let calculation_method = "";

            if(height <= 730 || width < 904 || (width >= 985 && width  < 1070)) {
                calculation_method = "Height calculation min_height";
                calculated_height = 689;              
             } else if (width >= 904 && width <= 984) {
                 calculation_method = "Height calculation no. 1";
                calculated_height = 670 + (width - 904);
            } else if (height >= 890 && width >= 1070 && width < 1400) {
                calculation_method = "Height calculation no. 2";
                calculated_height = 670 + (width - 1070)/2;
            } else if (width >= 1441 && height >= 1053) {
                calculation_method = "Height calculation large";
                calculated_height = 1000; 
            } else if (height >= 988 && height < 1053 && width >= 1404 && width < 1435) {
                calculation_method = "Height calculation no. 3";
                calculated_height = 670 + (width - 1170);
            }  else {
                calculation_method = "Height calculation default";
                calculated_height = $(window).height() - $("header").outerHeight();
            }
            
            <?php if(isset($DEBUG) && $DEBUG === true): ?>
                console.log("Height: " +height);
                console.log("Width: " +width);
                console.log("Calculation method: " +calculation_method);
                console.log("Calculated height: " +calculated_height);
            <?php endif; ?>

            return calculated_height;
        }

        $(document).ready( function () {
            $(window).on("resize", function () {
                let div_height = calcDivHeight();
                $("#visualization").css("height", div_height + "px")
            });
            $(window).trigger('resize');

            $("#reload").on("click", function () {
                location.reload();
            });

            $("#dismiss-reload").on("click", function (event) {
                $("#reload-text").addClass("hide-reload-text");
                event.stopPropagation() 
            });
        });
    </script>

</body>

</html>

<!DOCTYPE html>
<?php
include 'config.php';
?>
<html>

    <head>
        <?php 
        include 'head_viper.php';
        $override_labels = array(
            "title" => "Building your map - VIPER"
        );
        ?>
        <link type="text/css" rel="stylesheet" href="./lib/bootstrap.min.css">
        <script src="./lib/jquery-2.2.4.min.js"></script>
        <script src="./lib/jquery-ui.min.js"></script>
        <link type="text/css" rel="stylesheet" href="./lib/jquery-ui.min.css">
       
        <link rel="stylesheet" href="./lib/font-awesome.min.css">
        <link type="text/css" rel="stylesheet" href="./css/openaire.css">
    </head>

    <body class="waiting-page">
        <div class="search-box">
            <div style="padding: 20px;">
            <div class="background2">
                <div class="team">
                    <p style="text-align:center; margin:0px auto 20px;"><img style="width:70px;" src="./img/viper-logo.png"></p>
                    <p class="waiting-title">Your overview for <span class="project_name"></span> is being created</p>
                    <p class="waiting-description"></p>
                    <p id="info-totals"></p>

                </div>


                <div id="progressbar"></div>
                <div id="progress"></div>
            </div>
            </div>
        </div>
        
        <?php include('footer.php'); ?>

        <script>
            $(document).ready(function () {
                if (window.dataParamsForOpening) {
                    var params = window.dataParamsForOpening
                    doSubmit(params.data, params.service_name, params.service, params.search_url)
                } else {
                    window.dataParamsForOpening = {};
                    showErrorCreation();
                }
                $(".project_name").text(params.acronymtitle);
                $("#info-totals").html("<p>This project has "
                        + params.num_publications + " publications and " + params.num_datasets + " datasets");
                $(".waiting-description").text(function () {
                    if (params.num_project_resources < 50) {
                       return "Please be patient, this takes around 15 seconds";
                    } else if (params.num_project_resources >= 50 && params.num_project_resources < 150) {
                        return "Please be patient, this takes around 30 seconds";
                    } else if (params.num_project_resources >= 150 && params.num_project_resources < 500) {
                        return "Please be patient, this may take a while";
                    } else if (params.num_project_resources >= 500) {
                        return "You have selected a very large project. This may take between 10 and 15 minutes.";
                    }
                })
            })

            var doSubmit = function (params, service_name, service, service_url) {
                params += "&today=" + new Date().toLocaleDateString("en-US");
                var openInThisWindow = function (data) {
                    console.log(data)
                    if (data.status === "success") {
                        $("#progressbar").progressbar("option", "value", 100);
                        window.clearTimeout(progessbar_timeout);

                        var file = data.id;
                        window.location.replace("project?id=" + file);
                        return false;
                    } else {
                        showErrorCreation();
                    }
                }

                if (window.dataParamsForOpening.num_project_resources <= 1) {
                    showErrorCreation();
                    return;
                }

                $.ajax({
                    // make an AJAX request
                    type: "POST",
                    url: service_url,
                    data: params,
                    success: openInThisWindow,
                    error: function (error) {
                        showErrorBackend(error);
                    }
                });
            }

            var showErrorCreation = function () {
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Creating an overview for <span class="project_name">' + window.dataParamsForOpening.acronymtitle + '</span> failed.');
                $("#progress").html(
                        `Sorry! We could not create your map, most likely because the project does not have enough resources linked to it. \n\
                        You can link further resources to this project on the OpenAIRE website. Use the button indicated in the exemplary screenshot to do so. <br><br>If you think that there is something wrong with our site, please let us know at <a href="mailto:info@openknowledgemaps.org" style="color:white; text-decoration:underline;">info@openknowledgemaps.org</a>. \n\
                        <p><a href="https://www.openaire.eu/search/project?projectId=` + window.dataParamsForOpening.obj_id + `" target="_blank"><img src="./img/viper-project-screenshot.png" class="error-building-map-image"></a>\n\
                        <p class="error-building-map-button"><a class="newsletter2" href="https://www.openaire.eu/search/project?projectId=` + window.dataParamsForOpening.obj_id + `" target="_blank">Go to the OpenAIRE project website</a></p>`
                        );
            }

            var showErrorBackend = function (error) {
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Creating an overview for <span class="project_name">' + window.dataParamsForOpening.acronymtitle + '</span> failed.');
                $("#progress").html(
                        'Sorry! Something went wrong. Please <a href=\"index.php\">try again</a> in a few minutes. If you think that there is something wrong with our site, please let us know at <a href="mailto:info@openknowledgemaps.org" style="color:white; text-decoration:underline;">info@openknowledgemaps.org</a>.'
                        )
                console.log(error)
            }
            
            $("#progressbar").progressbar();
            $("#progressbar").progressbar("value", 2);

            var tick_function = function () {

                var value = $("#progressbar").progressbar("option", "value");

                value += tick_increment;

                $("#progressbar").progressbar("option", "value", value);

                progessbar_timeout = window.setTimeout(tick_function, tick_interval * milliseconds);

                if (value >= 100) {
                    $("#progress").html("Creating your visualization takes longer than expected. Please stay tuned!")

                    $("#progressbar").progressbar("value", 5);

                }

            }
            
            var tick_interval = 1;
            var tick_increment = 2;
            var milliseconds = 500;
            
            if (window.dataParamsForOpening.num_project_resources > 50 && window.dataParamsForOpening.num_project_resources < 150) {
                tick_interval = 1;
                tick_increment = 1;
            } else if (window.dataParamsForOpening.num_project_resources >= 150 && window.dataParamsForOpening.num_project_resources < 250) {
                tick_interval = 1;
                tick_increment = 1;
                var milliseconds = 1000;
            } else if (window.dataParamsForOpening.num_project_resources >= 250 && window.dataParamsForOpening.num_project_resources < 500) {
                tick_interval = 1;
                tick_increment = 1;
                var milliseconds = 2000;
            } else if (window.dataParamsForOpening.num_project_resources > 500) {
                tick_interval = 1;
                tick_increment = 1;
                var milliseconds = 6000;
            }
            
            var progessbar_timeout = window.setTimeout(tick_function, tick_interval * milliseconds);
        </script>

    </body>

</html>

<!DOCTYPE html>
<html>

    <head>
        <title>Building Your Map</title>
        <meta http-equiv="Content-Type">
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-multiselect/0.9.13/css/bootstrap-multiselect.css">
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
        <link type="text/css" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        <link type="text/css" rel="stylesheet" href="openaire.css">
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,800' rel='stylesheet' type='text/css'>
    </head>

    <body class="waiting-page">
        <div class="search-box">
            <div style="padding: 20px;">
            <div class="background2">
                <div class="team">
                    <p style="text-align:center; margin:0px auto 20px;"><img style="width:70px;" src="viper-logo.png"></p>
                    <p class="waiting-title">Your overview for <span class="project_name"></span> is being created</p>
                    <p class="waiting-description">Please be patient this may take a while</p>
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
            })

            var doSubmit = function (params, service_name, service, service_url) {
                params += "&today=" + new Date().toLocaleDateString("en-US");
                var openInThisWindow = function (data) {
                    console.log(data)
                    if (data.status === "success") {
                        $("#progressbar").progressbar("option", "value", 100);
                        window.clearTimeout(progessbar_timeout);

                        var file = data.id;
                        window.location.replace(
                                "headstart.php?query=" +
                                encodeURIComponent(data.query) +
                                "&file=" +
                                file +
                                "&service=" +
                                service +
                                "&service_name=" +
                                service_name);
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
                        `Sorry! We could not create your map, because the project does not have enough resources linked to it. \n\
                        You can link further resources to this project on the OpenAIRE website. Use the button indicated in the exemplary screenshot to do so. \n\
                        <p><a href="https://www.openaire.eu/search/project?projectId=` + window.dataParamsForOpening.obj_id + `" target="_blank"><img src="viper-project-screenshot.png" class="error-building-map-image"></a>\n\
                        <p class="error-building-map-button"><a class="newsletter2" href="https://www.openaire.eu/search/project?projectId=` + window.dataParamsForOpening.obj_id + `" target="_blank">Go to the OpenAIRE project website</a></p>`
                        );
            }

            var showErrorBackend = function (error) {
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Creating an overview for <span class="project_name">' + window.dataParamsForOpening.acronymtitle + '</span> failed.');
                $("#progress").html(
                        'Sorry! Something went wrong. Please <a href=\"index.php\">try again</a> in a few minutes. If you think that If you think that there is something wrong with our site, please let us know at <a href="mailto:info@openknowledgemaps.org">info@openknowledgemaps.org</a>.'
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
            var progessbar_timeout = window.setTimeout(tick_function, tick_interval * milliseconds);
        </script>

    </body>

</html>

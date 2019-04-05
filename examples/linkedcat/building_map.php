<!DOCTYPE html>
<html>

    <head>
        <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
        <link type="text/css" rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">

        <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Josefin+Sans:600" rel="stylesheet"> 
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
        <link type="text/css" rel="stylesheet" href="options.css">
    </head>

    <body class="waiting-page">
        <div class="waiting-page-img">
        <div class="waiting-box">
            <div>
                <p class="waiting-title">Ihre Visualisierung über <span id="search_term"></span> wird gerade erstellt</p>
                <p class="waiting-description">Bitte haben Sie ein wenig Geduld, dieser Vorgang dauert etwa 20 Sekunden...</p>
                <p id="info-totals"></p>
            </div>

            <div id="progressbar"></div>
            <div id="progress"></div>
        </div>
        </div>

        <script>
<?php
$post_array = $_POST;
$date = new DateTime();
$post_array["today"] = $date->format('Y-m-d');

$post_data = json_encode($post_array);

echo "var post_data = " . $post_data . ";\n";
?>

            $(document).ready(function () {
                let search_params = new URLSearchParams(window.location.search)
                if (Array.from(search_params).length > 0) {
                    $("#search_term").text(post_data.q)
                    doSubmit(search_params, search_params.get("service_url"), search_params.get("service"));
                } else {
                    showErrorCreation();
                }
            })

            var doSubmit = function (params, service_url, service_name) {
                post_data.author_id = params.get("author_id");
                post_data.doc_count = params.get("doc_count");
                post_data.living_dates = params.get("living_dates");
                post_data.image_link = params.get("image_link");

                var openInThisWindow = function (data) {
                    console.log(data)
                    if (data.status === "success") {
                        $("#progressbar").progressbar("option", "value", 100);
                        window.clearTimeout(progessbar_timeout);

                        var file = data.id;
                        window.location.replace("headstart.php?query=" + data.query
                                + "&file=" + file
                                + "&service=" + params.get("service")
                                + "&service_name=" + service_name
                                + "&visualization_mode=" + params.get("visualization_mode")
                                + "&visualization_type=" + post_data.vis_type)
                        return false;
                    } else {
                        showErrorCreation();
                    }
                }

                $.ajax({
                    // make an AJAX request
                    type: "POST",
                    url: service_url,
                    data: post_data,
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
                $(".waiting-title").html('Bei der Erstellung Ihrer Visualisierung über <span>Suchbegriff</span> ist ein Fehler aufgetreten.');
                $("#progress").html('Pardon! Es ist leider etwas schief gelaufen. Wahrscheinlich gibt es zu Ihrer Suchanfrage keine Dokumente. Bitte versuchen Sie es mit einer anderen Anfrage.');
            }

            var showErrorBackend = function (error) {
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Bei der Erstellung Ihrer Visualisierung ist ein Fehler aufgetreten.');
                $("#progress").html(
                        'Pardon! Es ist leider etwas schief gelaufen. Bitte <a href=\"index.php\">versuchen Sie es in ein paar Minuten noch einmal</a>.'
                        )
                console.log(error)
            }

            $("#progressbar").progressbar();
            $("#progressbar").progressbar("value", 1);

            var tick_function = function () {

                var value = $("#progressbar").progressbar("option", "value");

                value += tick_increment;

                $("#progressbar").progressbar("option", "value", value);

                progessbar_timeout = window.setTimeout(tick_function, tick_interval * milliseconds);

                if (value >= 100) {
                    $("#progress").html("Die Erstellung Ihrer Visualisierung benötigt mehr Zeit als angenommen. Bitte haben Sie noch ein wenig Geduld.")

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

<!DOCTYPE html>
<html>

    <head>
        <?php include('head_standard.php') ?>
    </head>

    <body class="waiting-page">
        <div class="waiting-page-img">
        <div class="waiting-box">
            <div>
                <p class="waiting-title"><span id="h-label"></span> über <span id="search_term"></span> wird gerade erstellt</p>
                <p class="waiting-description">Bitte haben Sie ein wenig Geduld, dieser Vorgang dauert etwa 20 Sekunden...</p>
                <p id="info-totals"></p>
            </div>

            <div id="progressbar"></div>
            <div id="progress"></div>
        </div>
        </div>

        <script>
            var post_data;
<?php
if(!empty($_POST)) {
    $post_array = $_POST;
    $date = new DateTime();
    $post_array["today"] = $date->format('Y-m-d');

    $post_data = json_encode($post_array);

    echo "post_data = " . $post_data . ";\n";
}
?>
            $(document).ready(function () {
                if (window.post_data) {
                    post_data = window.post_data;
                }
                let search_params = new URLSearchParams(window.location.search)
                if (Array.from(search_params).length > 0) {
                    $("#search_term").text(post_data.q)
                    $("#h-label").text(function () {
                        return ((post_data.vis_type === "overview")?("Ihre Knowledge Map"):("Ihr Zeitstrahl"))
                    })
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
                $(".waiting-title").html('Bei der Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Zeitstrahls")) + '</span> über <span>' + post_data.q + '</span> ist ein Fehler aufgetreten.');
                $("#progress").html('Pardon! Es ist leider etwas schief gelaufen. Wahrscheinlich gibt es zu Ihrer Suchanfrage keine Dokumente. Bitte versuchen Sie es mit einem anderen Stichwort erneut.'
                       
            
                +'<a href="index.php">'
                    +'<button class="search-btn shadow">'
                        +'Neues Stichwort ausprobieren'
                    +'</button></a>'
            +'<div style="text-align: center; margin-top: 2%;">'
                +'<a style="border-bottom: 1px solid #2856a3; text-decoration: none;" href="browse.php" target="_blank">Browse Knowledge Maps zu ausgewählten Themen</a>'
                                +'</div>');
            }

            var showErrorBackend = function (error) {
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Bei der Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Zeitstrahls")) + '</span> über <span>' + post_data.q + '</span> ist ein Fehler aufgetreten.');
                $("#progress").html(
                        'Pardon! Es ist leider etwas schief gelaufen.<br><a href=\"index.php\">Bitte versuchen Sie es in ein paar Minuten noch einmal</a>.'
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
                    $("#progress").html('Die Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Zeitstrahls")) + '</span> benötigt mehr Zeit als angenommen. Bitte haben Sie noch ein wenig Geduld.')

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

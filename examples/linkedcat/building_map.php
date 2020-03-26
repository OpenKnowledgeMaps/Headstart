<?php
    include 'config.php';
?>
<!DOCTYPE html>
<html>

    <head>
        <?php include('head_standard.php') ?>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.13.0/js/md5.min.js" integrity="sha256-qlDpLxKXa1lzPjJ5vbWLDWbxuHT8d/ReH4E6dBDRRoA=" crossorigin="anonymous"></script>
    </head>

    <body class="waiting-page waiting-page-img">
        <div>
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
            var server_url = "<?php echo $WEBSITE_PATH . $HEADSTART_PATH; ?>server/";
            var search_params = new URLSearchParams(window.location.search);
            var search_aborted = false;
<?php if(!empty($_POST)): ?>
<?php
    $post_array = $_POST;
    $date = new DateTime();
    $post_array["today"] = $date->format('Y-m-d');
    
    $dirty_query = $post_array["q"];
    $post_array["q"] = addslashes(trim(strtolower(strip_tags($dirty_query))));

    $post_data = json_encode($post_array);

    echo "post_data = " . $post_data . ";\n";
    echo 'var dirty_query = "' . $dirty_query . '";';
?>
<?php else: ?>
       var dirty_query = post_data.q;
<?php endif; ?>
        var unique_id = md5(JSON.stringify(post_data));
        post_data.unique_id = unique_id;
        
        $(document).ready(function () {
                if (window.post_data) {
                    post_data = window.post_data;
                }
                if (Array.from(search_params).length > 0) {
                    $("#search_term").text(getSearchTermShort())
                    $("#search_term").attr("title", dirty_query);
                    $("#h-label").text(function () {
                        return ((post_data.vis_type === "overview")?("Ihre Knowledge Map"):("Ihr Streamgraph"))
                    })
                    doSubmit();
                } else {
                    showErrorCreation();
                }
            });
            
            var getSearchTermShort = function () {
                return dirty_query.length > 115 ? dirty_query.substr(0, 115) + "..." : dirty_query;
            }

            var doSubmit = function () {
                post_data.author_id = search_params.get("author_id");
                post_data.doc_count = search_params.get("doc_count");
                post_data.living_dates = search_params.get("living_dates");
                post_data.image_link = search_params.get("image_link");
                
                let processResult = function(data) {
                    console.log(data)
                    if (data.status === "success") {
                        openInThisWindow();
                    } else {
                        showErrorCreation();
                    }
                }

                $.ajax({
                    // make an AJAX request
                    type: "POST",
                    url: search_params.get("service_url"),
                    data: post_data,
                    timeout: (10 * 60 * 1000),
                    success: processResult,
                    error: function (error) {
                        showErrorBackend(error);
                    }
                });
            }
            
            function openInThisWindow() {
                $("#progressbar").progressbar("option", "value", 100);
                window.clearTimeout(progessbar_timeout);

                var file = unique_id;
                window.location.replace("headstart.php?query=" + dirty_query
                        + "&file=" + file
                        + "&service=" + search_params.get("service")
                        + "&service_name=" + search_params.get("service")
                        + "&vis_mode=" + search_params.get("vis_mode")
                        + "&vis_type=" + post_data.vis_type)
                return false;
            }
            
            function fallbackCheck() {
                $.getJSON(server_url + "services/getLastVersion.php?vis_id=" + unique_id,
                    function(output) {
                        if (output.status === "success") {
                            search_aborted = true;
                            openInThisWindow();
                        }
                    });
            }
            
            function clearFallbackInterval () {
                if(check_fallback_interval !== null) {
                    window.clearInterval(check_fallback_interval);
                }
            }

            var showErrorCreation = function () {
                clearFallbackInterval();
                
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Bei der Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Streamgraphs")) + '</span> über <span title="' + dirty_query + '">' + getSearchTermShort() + '</span> ist ein Fehler aufgetreten.');
                $("#progress").html('Pardon! Es ist leider etwas schief gelaufen. Wahrscheinlich gibt es zu Ihrer Suchanfrage keine Dokumente. Bitte versuchen Sie es mit einem anderen Stichwort erneut.'
                       
            
                +'<a href="index.php">'
                    +'<button class="search-btn shadow">'
                        +'Neues Stichwort ausprobieren'
                    +'</button></a>'
            +'<div style="text-align: center; margin-top: 5%;">'
                +'<a style="border-bottom: 1px solid #2856a3; text-decoration: none;" href="browse.php">Entdecken Sie Knowledge Maps zu Disziplinen/Themen</a>'
                                +'</div>');
            }

            var showErrorBackend = function (error) {
                //do not carry out if request is aborted
                if(search_aborted)
                    return;

                clearFallbackInterval();
                
                clearTimeout(progessbar_timeout);
                $("#progressbar").hide();
                $(".waiting-description").hide();
                $(".waiting-title").html('Bei der Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Streamgraphs")) + '</span> über <span title="' + dirty_query + '">' + getSearchTermShort() + '</span> ist ein Fehler aufgetreten.');
                if(error.status === 0) {
                    $("#progress")
                            .html('Die Verbindung zum Internet wurde unterbrochen oder die Verbindung wurde zurückgesetzt. Sie können es noch einmal versuchen, indem Sie <a class="underline" style="cursor:pointer" onClick="window.location.reload();">die Seite neu laden</a>.');
                } else {
                    $("#progress").html(
                            'Pardon! Es ist leider etwas schief gelaufen.<br><a href=\"index.php\">Bitte versuchen Sie es in ein paar Minuten noch einmal</a>.'
                            )
                }
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
                    $("#progress").html('Die Erstellung <span>' + ((post_data.vis_type === "overview")?("Ihrer Knowledge Map"):("Ihres Streamgraphs")) + '</span> benötigt mehr Zeit als angenommen. Bitte haben Sie noch ein wenig Geduld.')

                    $("#progressbar").progressbar("value", 5);

                }

            }

            var tick_interval = 1;
            var tick_increment = 2;
            var milliseconds = 500;

            var progessbar_timeout = window.setTimeout(tick_function, tick_interval * milliseconds);
            var check_fallback_interval = null;
            var check_fallback_timeout = 
            window.setTimeout(function () {
                                check_fallback_interval = window.setInterval(fallbackCheck, 4000);
                            }, 10000);
        </script>

    </body>

</html>

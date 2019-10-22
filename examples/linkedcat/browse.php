<!DOCTYPE html>
<?php
include 'config.php';
$date = new DateTime();
?>
<html>
    <head>
        <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        <link type="text/css" rel="stylesheet" href="browse.css">
    </head>
    <body>
        <div class="container">
            <h2>Browse Themenbereiche</h2>
            <p>Entdecken Sie die Sitzungsberichte der ÖAW (von 1847 bis 1918). In der Liste finden sie Knowledge Maps nach Basisklassen sortiert.</p>
            <div id="browseview" class="list-group list-group-root well">
                <div id="browseview-loading" class="loading-indicator">
                    Die Themenbereiche werden geladen und in wenigen Sekunden angezeigt <img class="loading" src="img/ajax-loader.gif">
                </div>
            </div>

        </div>

        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script>
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";

            function displayTree() {

                $.getJSON(data_config.server_url + "services/getLinkedCatBrowseTree.php",
                    function(data) {
                        for (index_top in data) {
                            let current_item = data[index_top];
                            let title = wrapMisc(current_item, current_item.bkl_top_caption);
                            let has_children = (current_item.bkl_facet.length > 0)?(true):(false);

                            $("#browseview").append('<a id="click-' + index_top + '" href="#item-' + index_top + '" class="list-group-item" data-toggle="collapse">\n\
                                '+ ((has_children)?('<i class="glyphicon glyphicon-chevron-right"></i>'):('')) + title + '\n\
                                <span class="badge badge-primary badge-pill">' + current_item.count + ' Dokumente</span>');

                            if(has_children) {
                                $("#browseview").append('<div class="list-group collapse" id="item-' + index_top + '"></div>')
                                for (index_bottom in current_item.bkl_facet) {
                                    let current_sub_item = current_item.bkl_facet[index_bottom];
                                    let title = wrapMisc(current_sub_item, current_sub_item.bkl_caption);

                                    $('<a id="click-' + index_top + '-' + index_bottom +'" href="#item-' + index_top + '-' + index_bottom +'" class="list-group-item" data-toggle="collapse">\n\
                                      '+ title + '\n\
                                      <span class="badge badge-primary badge-pill">' + current_sub_item.count + ' Dokumente</span>').appendTo("#item-" + index_top);

                                    appendClickHandler("#click-" + index_top + "-" + index_bottom, current_sub_item.map_params);
                                }
                            } else {
                                appendClickHandler("#click-" + index_top, current_item.map_params);
                            }
                        }
                        appendClickHandlerExpand();
                        $("#browseview-loading").hide();
                    }
                )
            }
            
            function wrapMisc(item, title) {
                if(item.map_params.bkl_list.length > 1) {
                    return "Weitere (" + title + ")";
                } else {
                    return title;
                }
            }
            
            function appendClickHandler(id, map_params) {
                $(id).addClass("underline");
                $(id).on('click', function (event) {
                    event.preventDefault();

                    var win = window.open("building_map.php?"
                                            + encodeURI("today=" + new Date().toLocaleDateString("en-US") 
                                                        + "&author_id="
                                                        + "&doc_count=" + map_params.doc_count
                                                        + "&living_dates="
                                                        + "&image_link="
                                                        + "&service_url=" + data_config.server_url + "services/searchLinkedCatBrowseview.php"
                                                        + "&service_name=LinkedCat"
                                                        + "&service=" + data_config.service
                                                        + "&visualization_mode=keywords")
                                        )
                    win.post_data = {
                      q: map_params.q
                      , bkl_level: map_params.bkl_level
                      , doc_count: map_params.doc_count
                      , bkl_list: map_params.bkl_list
                      , bkl_top_caption: map_params.bkl_top_caption
                      , today: "<?php echo $date->format('Y-m-d') ?>"
                      , vis_type: "overview"
                      , from: "1847-01-01"
                      , to: "1918-01-01"
                      , include_content_type: [
                            "Andere Abhandlungen",
                            "Anthologie",
                            "Bibliografie",
                            "Biografie",
                            "Briefsammlung",
                            "Katalog",
                            "Kommentar",
                            "Mehrsprachiges Wörterbuch",
                            "Mitgliederverzeichnis",
                            "Protokoll",
                            "Quelle",
                            "Reisebericht",
                            "Rezension",
                            "Statistik",
                            "Verzeichnis",
                            "Wörterbuch"]
                    }
                })
            }

            function appendClickHandlerExpand() {
                $('.list-group-item').on('click', function() {
                  $('.glyphicon', this)
                    .toggleClass('glyphicon-chevron-right')
                    .toggleClass('glyphicon-chevron-down');
                });
            }
            
            $(function() {
                
                displayTree();

            });
        </script>
        
    </body>
</html>

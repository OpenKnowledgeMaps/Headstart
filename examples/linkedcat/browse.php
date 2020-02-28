<!DOCTYPE html>
<?php
include 'config.php';
$date = new DateTime();
?>
<html>
    <head>
        <title>LinkedCat+ Visuelle Suche</title>
        <?php include('head_standard.php') ?>
        <link type="text/css" rel="stylesheet" href="browse.css">
    </head>
    <body class="browse-page bg-image-startpage">
        <div>
            <header>
                <?php include('menu.php'); ?>
            </header>

            <?php include('project-short-description.php') ?>

            <div class="browse-description">
                <h3>Disziplinen / Themen</h3>
            </div>

            <div id="browseview" class="list-group list-group-root well">
                <p class="page-description">In der Liste finden Sie Links zu <span class="info-btn2" data-toggle="popover" data-trigger="hover" data-content='Eine Knowledge Map (zu deutsch "Wissenslandkarte") gibt einen thematischen Überblick über ein Stichwort/einen Autor. Mehr Infos dazu finden Sie in den FAQs.'>Knowledge Maps<i class="fas fa-info-circle"></i></span> für die Hauptklassen der <span class="info-btn2" data-toggle="popover" data-trigger="hover" data-content='BK ist ein hierarchisches Klassifikationssystem, das speziell für wissenschaftliche Arbeiten entwickelt wurde.'>Basisklassifikation<i class="fas fa-info-circle"></i></span>. In diesen Knowledge Maps werden jene Dokumente angezeigt die von Bibliothekar*innen der jeweiligen Hauptklasse zugeordnet wurden. 
                </p>
                <div id="browseview-loading" class="loading-indicator">
                    Die Themenbereiche werden geladen und in wenigen Sekunden angezeigt 
                    <img class="loading" src="img/ajax-loader.gif">
                </div>
            </div>
        </div>
        <?php include('credits.php') ?>

        <script type="text/javascript" src="data-config_linkedcat.js"></script>
        <script>
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";

            function displayTree() {

                $.getJSON(data_config.server_url + "services/getLinkedCatBrowseTree.php",
                        function (data) {
                            for (index_top in data) {
                                let current_item = data[index_top];
                                let title = wrapMisc(current_item, current_item.bkl_top_caption);
                                let has_children = (current_item.bkl_facet.length > 0) ? (true) : (false);

                                $("#browseview").append('<a id="click-' + index_top + '" href="#item-' + index_top + '" class="list-group-item" data-toggle="collapse" title="' + title + '">\n\
                                ' + ((has_children) ? ('<i class="glyphicon glyphicon-chevron-right"></i>') : ('')) + title + '\n\
                                <span class="badge badge-primary badge-pill">' + current_item.count + ' Dokumente</span>');

                                if (has_children) {
                                    $("#browseview").append('<div class="list-group collapse" id="item-' + index_top + '"></div>')
                                    for (index_bottom in current_item.bkl_facet) {
                                        let current_sub_item = current_item.bkl_facet[index_bottom];
                                        let title = wrapMisc(current_sub_item, current_sub_item.bkl_caption);

                                        $('<a id="click-' + index_top + '-' + index_bottom + '" href="#item-' + index_top + '-' + index_bottom + '" class="list-group-item text-truncate" data-toggle="collapse" title="' + title + '">\n\
                                      ' + title + '\n\
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
                if (item.map_params.bkl_list.length > 1) {
                    return "Weitere (" + title + ")";
                } else {
                    return title;
                }
            }

            function build_q(map_params) {
                if (map_params.bkl_level === "top") {
                    return map_params.q;
                } else {
                    return map_params.bkl_top_caption + " ~> " + map_params.q;
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
                        q: build_q(map_params)
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
                $('.list-group-item').on('click', function () {
                    $('.glyphicon', this)
                            .toggleClass('glyphicon-chevron-right')
                            .toggleClass('glyphicon-chevron-down');
                });
            }

            $(function () {

                displayTree();
                $('[data-toggle="popover"]').popover();

            });
        </script>
    </body>
</html>

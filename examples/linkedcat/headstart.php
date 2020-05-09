<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head>
                <?php 
                    $id = $_GET["file"];
                    $query = $_GET["query"];
                    $vis_type = $_GET["vis_type"];
                    $vis_mode = $_GET["vis_mode"];
                    include('head_headstart.php') 
                ?>
    </head>

    <body style="margin:0px; padding:0px" class="vis-page">
        <?php if (!isset($_GET['embed']) || !$_GET['embed'] === 'true'): ?>
            <header>
                    <?php
                        $IS_HEADSTART = true;
                        include('menu.php');
                    ?>
            </header>
        
            <div class="topheader"></div>
        <?php endif; ?>
        <div id="visualization"></div>
        <script type="text/javascript" src="./js/data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script type="text/javascript" src="./js/search_options.js"></script>
        <script>
            
            let credit_text = "<p class='wtp'>Weitere Informationen zu den Visualisierungen <a class='link-popup' href='faqs'>finden Sie in den FAQs</a>. Informationen über das Projekt <a class='link-popup' href='ueber'>finden Sie hier</a>.</p><h3>Datenquelle und Software</h3><p>Diese Visualisierung wurde mit der <a class='link-popup' target='_blank' href='http://github.com/pkraker/Headstart'>Open Source Software Head Start</a> von <a target='_blank' class='link-popup' href='https://openknowledgemaps.org/'>Open Knowledge Maps</a> realisiert. Alle Daten stammen aus LinkedCat+. Die Katalogisierung des Datensatzes ist noch nicht abgeschlossen, neue Katalogisate werden laufend hinzugefügt.</p><p class='wtp'><a target='_blank' href='https://www.oeaw.ac.at'><img style='width: 100px;' src='./img/oeaw-logo.png' alt'OEAW Logo'></a><a target='_blank' href='https://www.oeaw.ac.at/acdh/'><img style='width: 100px;' src='./img/acdh-logo-white-bg.png' alt='ACDH Logo'></a><a target='_blank' href='https://openknowledgemaps.org/'><img style='width: 100px;' src='./img/Logo-Open-Knowledge-Maps-BGwhite.png' alt='Open Knowlege Maps Logo'></a></p>"
            let km_text = "<h3>Was ist eine Knowledge Map?</h3><p class='wtp'>Eine Knowledge Map (zu deutsch Wissenslandkarte) gibt einen thematischen Überblick über ein Stichwort/einen Autor. Unterthemen werden als Blasen dargestellt. Jedem Unterthema sind relevante Dokumente zugeordnet, die mit einem Klick auf die Blase angezeigt werden können. Ein Dokument wird in einer Knowledge Map nur einer Blase zugeordnet.</p><p class='wtp'>Knowledge Maps eignen sich besonders dazu, einen Überblick über ein Thema zu bekommen und relevante Konzepte und Dokumente zu entdecken.</p>"
            let sg_text = "<h3>Was ist ein Streamgraph?</h3><p class='wtp'>Ein Streamgraph zeigt die zeitliche Entwicklung der häufigsten Schlagworte zu einem Stichwort/Autor. Die Schlagworte werden als farbige Ströme (Englisch: streams) dargestellt. Jedem Strom sind relevante Dokumente zugeordnet, die mit einem Klick auf einen Stream angezeigt werden können. Ein Dokument kann in einem Streamgraph mehreren Strömen zugeordnet sein. Es kann aber auch vorkommen, dass ein Dokument keinem Strom zugeordnet ist - und zwar dann, wenn das Dokument nicht mit einem der häufigsten Schlagworte annotiert ist.</p><p class='wtp'>Die Höhe eines Streams entspricht der Anzahl der zugeordneten Dokumente zu einem bestimmten Zeitpunkt. Dabei ist zu beachten, dass die Anzahl der relativen, nicht der absoluten Höhe entspricht. Zwischen den Zeitpunkten wird der Strom interpoliert.</p><p class='wtp'>Streamgraphs eignen sich besonders dazu, die Entwicklung von Schlagwörtern über die Zeit zu analysieren und Trends zu erkennen.</p>"
                let intro_authors_overview = {
                    title: "Über diese Knowlege Map",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Diese Knowledge Map basiert auf allen Dokumenten aus Linkedcat+ des Autors <b><?php echo json_encode($_GET['query']) ?></b>.</p>' + km_text + credit_text
                }
                
                let intro_authors_timeline = {
                    title: "Über diesen Streamgraph",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Dieser Streamgraph basiert auf allen Dokumenten aus Linkedcat+ des Autors <b><?php echo json_encode($_GET['query']) ?></b>.</p>' + sg_text + credit_text
                }
                
                let intro_keywords_overview = {
                    title: "Über diese Knowlege Map",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Diese Knowledge Map basiert auf den 100 relevantesten Dokumenten aus Linkedcat+ für das Stichwort/die Stichwörter <b><?php echo json_encode($_GET['query']) ?></b> aus dem gewählten Zeitraum.</p>' + km_text + '<h3>Was ist unter relevanteste Dokumente zu verstehen?</h3><p class="wtp">In diesem Projekt verwenden wir das Relevanz-Ranking der Suchmaschinen-Software "Solr". Solr verwendet hauptsächlich die Textähnlichkeit zwischen dem Suchbegriff und den Dokument-Metadaten, um die Relevanz zu bestimmen.</p>' + credit_text 
                }
                
                let intro_keywords_timeline = {
                    title: "Über diesen Streamgraph",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp"> Dieser Streamgraph basiert auf allen Dokumenten der ausgewählten Dokumentarten aus Linkedcat+ für das Stichwort/die Stichwörter <b><?php echo json_encode($_GET['query']) ?></b> aus dem ausgewählten Zeitraum.</p>' + sg_text + credit_text
                }
                
                let intro_browseview = {
                    title: "Über diese Knowlege Map",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Diese Knowledge Map basiert auf allen Dokumenten aus Linkedcat+ die zur Hauptklasse der Basisklassifikation <b><?php echo json_encode($_GET['query']) ?></b> gehören.</p>'  + km_text + credit_text
                }
                
                
                data_config.intro = intro_keywords_overview;
            
        	data_config.files = [{
        		title: <?php echo json_encode($_GET['query']) ?>,
        		file: <?php echo json_encode($_GET['file']) ?>
        	}];
                data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
                data_config.options = options_<?php echo $_GET['service'] ?>.dropdowns;
                if(<?php echo json_encode($_GET['vis_mode']) ?> === "authors") {
                    data_config.is_authorview = true;
                }   
                if(<?php echo json_encode($_GET['vis_type']) ?> === "timeline") {
                    data_config.is_streamgraph = true;
                    //data_config.embed_modal = false;
                    data_config.show_area = false;
                    
                    if(<?php echo json_encode($_GET['vis_mode']) ?> === "authors") {
                        data_config.intro = intro_authors_timeline;
                    } else {
                        data_config.intro = intro_keywords_timeline;
                    }
                } else {
                    if (<?php echo json_encode($_GET['vis_type']) ?> === "overview") {
                        if(<?php echo json_encode($_GET['vis_mode']) ?> === "authors") {
                            data_config.intro = intro_authors_overview;
                        } else if (<?php echo json_encode($_GET['vis_mode']) ?> === "browse") {
                            data_config.intro = intro_browseview;
                        } else {
                            data_config.intro = intro_keywords_overview;
                        }
                    }
                }
                <?php if (isset($_GET['embed']) && $_GET['embed'] === 'true'): ?>
                    data_config.credit_embed = true;
                    data_config.embed_modal = false;
                <?php endif; ?>
                    
                var calcDivHeight = function () {
                    
                    let height = $(window).height();
                    let width = $(window).width();
                    let calculated_height = 0;
                    
                    if(height <= 670 || width < 904 || (width >= 985 && width  < 1070)) {
                        calculated_height = 670;
                    }  else {
                        calculated_height = $(window).height() - $("header").outerHeight();
                    }
                    
                    return calculated_height;
                }

                <?php if (!isset($_GET['embed']) || $_GET['embed'] === 'false'): ?>
                    
                    $(document).ready( function () {
                        $(window).on("resize", function () {
                            let div_height = calcDivHeight();
                            $(".overflow-vis").css("height", div_height + "px")
                            $("#visualization").css("height", div_height + "px")
                        });
                        $(window).trigger('resize');
                    });
                
                <?php endif ?>
        </script>
        <script type="text/javascript" src="<?php echo $HEADSTART_PATH; ?>dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="<?php echo $HEADSTART_PATH; ?>dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
        
        <?php if (!isset($_GET['embed']) || !$_GET['embed'] === 'true'): ?>
        <div class="createdby" style="margin: 10px; font-size: 12px;"><!--Diese Visualisierung wurde mit der Open Source Software <a href="http://github.com/pkraker/Headstart" target="_blank ">Head Start</a> von <a href="https://openknowledgemaps.org" target="_blank">Open Knowledge Maps</a> realisiert. Alle Daten stammen aus LinkedCat+.-->
        <?php endif; ?>
        </div>
    </body>
</html>
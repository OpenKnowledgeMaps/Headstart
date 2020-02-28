<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head>
                <?php include('head_headstart.php') ?>
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
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script type="text/javascript" src="search_options.js"></script>
        <script type="text/javascript" src="lib/Chart.Streamgraph.S.js"></script>
        <script>
            
            let common_text = "mmdfmdsfmn"
                let intro_authors_overview = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext Autoren Knowledge Map' + common_text + '</p>'
                }
                
                let intro_authors_timeline = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext Autoren Streamgraph</p>'
                }
                
                let intro_keywords_overview = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext Schlagwörter Knowledge Map</p>'
                }
                
                let intro_keywords_timeline = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext Schlagwörter Streamgraph</p>'
                }
                
                let intro_browseview = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext Browseview</p>'
                }
                
                
                data_config.intro = intro_keywords_overview;
            
        	data_config.files = [{
        		title: <?php echo json_encode($_GET['query']) ?>,
        		file: <?php echo json_encode($_GET['file']) ?>
        	}];
                data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
                data_config.options = options_<?php echo $_GET['service'] ?>.dropdowns;
                if(<?php echo json_encode($_GET['visualization_mode']) ?> === "authors") {
                    data_config.is_authorview = true;
                }   
                if(<?php echo json_encode($_GET['visualization_type']) ?> === "timeline") {
                    data_config.is_streamgraph = true;
                    //data_config.embed_modal = false;
                    data_config.show_area = false;
                    
                    if(<?php echo json_encode($_GET['visualization_mode']) ?> === "authors") {
                        data_config.intro = intro_authors_timeline;
                    } else {
                        data_config.intro = intro_keywords_timeline;
                    }
                } else {
                    if (<?php echo json_encode($_GET['visualization_type']) ?> === "authors") {
                        data_config.intro = intro_authors_overview;
                    } else if (<?php echo json_encode($_GET['visualization_mode']) ?> === "browse") {
                        data_config.intro = intro_browseview;
                    } else {
                        data_config.intro = intro_keywords_overview;
                    }
                }
                <?php if (isset($_GET['embed']) && $_GET['embed'] === 'true'): ?>
                    data_config.credit_embed = true;
                    data_config.embed_modal = false;
                <?php endif; ?>
        </script>
        <script type="text/javascript" src="<?php echo $HEADSTART_PATH; ?>dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="<?php echo $HEADSTART_PATH; ?>dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
        
        <?php if (!isset($_GET['embed']) || !$_GET['embed'] === 'true'): ?>
        <div class="createdby" style="margin: 10px; font-size: 12px;">Diese Visualisierung wurde mit der Open Source Software <a href="http://github.com/pkraker/Headstart" target="_blank ">Head Start</a> von <a href="https://openknowledgemaps.org" target="_blank">Open Knowledge Maps</a> realisiert. Alle Daten stammen aus LinkedCat+.
        <?php endif; ?>
        </div>
    </body>
</html>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet"> 
            <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    </head>

    <body style="margin:0px; padding:0px">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script type="text/javascript" src="search_options.js"></script>
        <script type="text/javascript" src="lib/Chart.Streamgraph.S.js"></script>
        <script>
                var intro = {
                    title: "Was ist das?",
                            body: '<div style="max-width: 1000px; width: 100%;"><div id="whatsthis-page">            \n\
                    <p class="wtp">Erklärungstext</p>'
                }
                data_config.intro = intro;
            
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
                    data_config.embed_modal = false;
                    data_config.show_area = false;
                }
        </script>
        <script type="text/javascript" src="<?php echo $HEADSTART_PATH; ?>dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="<?php echo $HEADSTART_PATH; ?>dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
         <div class="createdby" style="margin: 10px; font-size: 12px;">Diese Suche wurde mit <a href="http://github.com/pkraker/Headstart" target="_blank ">Headstart</a> realisiert. Alle Daten stammen aus LinkedCat+.
        </div>
    </body>
</html>
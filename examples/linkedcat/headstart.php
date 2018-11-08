<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet"> 
    </head>

    <body style="margin:0px; padding:0px">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script type="text/javascript" src="data-config_server.js"></script>
        <script>
        	data_config.files = [{
        		title: <?php echo json_encode($_GET['query']) ?>,
        		file: <?php echo json_encode($_GET['file']) ?>
        	}];
        </script>
        <script type="text/javascript" src="../../dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="../../dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
         <div style="margin-top:20px">Diese Suche wurde mit <a href="http://github.com/pkraker/Headstart" target="_blank ">Headstart</a> realisiert. Alle Daten stammen aus LinkedCat+.
        </div>
    </body>
</html>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body style="margin:0px; padding:0px">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script type="text/javascript" src="../search_repos/data-config_server.js"></script>
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
         <!--<div style="margin-top:20px">Built with <a href="http://github.com/pkraker/Headstart" target="_blank">Headstart</a> and <a href="http://github.com/ropensci/rplos" target="_blank">rplos</a>. All content retrieved from <a href="https://www.plos.org/publications/journals/" target="_blank">Public Library of Science Journals</a> under <a href="http://journals.plos.org/plosone/s/content-license" target="_blank">CC-BY</a>.-->
        </div>
    </body>
</html>
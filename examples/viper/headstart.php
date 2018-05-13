<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></meta>
        <link type="text/css" rel="stylesheet" href="openaire.css"></link>
        <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
    </head>

    <body style="margin:0px; padding:0px; max-width:1600px; margin: 0px auto;">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
        <script>
        	data_config.files = [{
        		title: <?php echo json_encode($_GET['query']) ?>,
        		file: <?php echo json_encode($_GET['file']) ?>
        	}];
                data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
        <script type="text/javascript" src="<?php echo $HEADSTART_PATH; ?>dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="<?php echo $HEADSTART_PATH; ?>dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
        <?php include("footer_vis.php"); ?>    
    </body>
</html>
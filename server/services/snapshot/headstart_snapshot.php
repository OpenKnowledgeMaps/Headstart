<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body style="margin:0px; padding:0px">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo $_GET['service'] ?>.js"></script>
		<script src="../../../../js/search_options.js"></script>
        <script>
            //data_config.title = '<?php echo 'Overview of <span id="search-term-unique">' . $_GET['query'] . '</span> based on <span id="num_articles"></span> ' . $_GET['service_name'] . ' articles'; ?>';
            data_config.files = [{
                    title: <?php echo json_encode($_GET['query']) ?>,
                    file: <?php echo json_encode($_GET['file']) ?>
            }];
            data_config.nodot = 1;
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "../../";
            data_config.show_context = true;
            data_config.create_title_from_context= true;
			data_config.is_phantomjs = true;
			data_config.options = options_<?php echo $_GET['service']; ?>.dropdowns;
        </script>
        <script type="text/javascript" src="../../../dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="../../../dist/headstart.css"></link>
        <script type="text/javascript">
            headstart.start();
        </script>
    </body>
</html>
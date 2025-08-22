<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js"
        integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
    </head>

    <body style="margin:0px; padding:0px">

        <div id="visualization"></div>
        <script type="text/javascript" src="data-config_<?php echo htmlspecialchars($_GET['service']) ?>.js"></script>
		<script src="../../../../js/search_options.js"></script>
        <script>
            data_config.files = [{
                    title: <?php echo json_encode($_GET['query']) ?>,
                    file: <?php echo json_encode($_GET['file']) ?>
            }];
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "../../";
            data_config.show_context = true;
            data_config.create_title_from_context= true;
            data_config.intro = "";
            if(<?php echo json_encode(isset($_GET['vis_type']) ? $_GET['vis_type'] : "") ?> === "timeline") {
                data_config.is_streamgraph = true;
                //data_config.embed_modal = false;
                data_config.show_area = false;
            } else {
                data_config.options = options_<?php echo htmlspecialchars($_GET['service']); ?>.dropdowns;
            }
        </script>
        <?php include "../../../dist/headstart.php"; ?>
        <script type="text/javascript">
            // Function to check if headstart is loaded and start it
            function initializeHeadstart() {
                if (typeof headstart !== 'undefined' && headstart.start) {
                    headstart.start();
                } else {
                    setTimeout(initializeHeadstart, 100);
                }
            }
            
            // Wait for DOM to be ready, then start checking for headstart
            document.addEventListener('DOMContentLoaded', function() {
                // Give a small delay to ensure deferred scripts have time to load
                setTimeout(initializeHeadstart, 500);
            });
        </script>
    </body>
</html>

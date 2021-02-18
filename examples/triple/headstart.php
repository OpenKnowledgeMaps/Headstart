<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <?php
          include('config_searchflow.php');
          include('search-flow/inc/visualization-header.php');
      ?>
      <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
    </head>

    <body style="margin:0px; padding:0px">
       <script type="text/javascript" src="data-config_triple.js"></script>
       <?php include('search-flow/inc/banner-browser-unsupported.php') ?>
       <?php include('search-flow/inc/banner-mobile.php') ?>
       <?php include('search-flow/inc/visualization.php') ?>
        <script>
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
            data_config.files = [{
                    title: "<?php echo $query; ?>",
                    file: "<?php echo $id; ?>"
            }];
        </script>
       <?php 
            $builtwith_string = 'Built with <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank ">Head Start</a>. All content retrieved from <a href="https://www.gotriple.eu/" target="_blank ">TRIPLE</a>.';
            include('search-flow/inc/context-builtwith.php'); 
            //$citation = "Open Knowledge Maps (2021). Overview of topic.";
            //include('search-flow/inc/context-citation.php'); 
       ?>
    </body>
</html>

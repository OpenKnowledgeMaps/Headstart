<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <?php
          $id = $_GET["id"];
          $query = $_GET["query"];
          $service = $_GET['service'];
          $has_custom_title = false;
      ?>
      <script src="https://code.jquery.com/jquery-2.1.4.min.js" integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw=" crossorigin="anonymous"></script>
    </head>

    <body style="margin:0px; padding:0px">

       <script src="search_options_triple.js"></script>
       <script>
           var fit_to_page = false;
       </script>
       
       <?php include ("search-flow/inc/knowledge-map.php") ?>
        <script type="text/javascript" src="data-config_triple.js"></script>
        <script>
            data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
            data_config.files = [{
                    title: "<?php echo $query; ?>",
                    file: "<?php echo $id; ?>"
            }];
            data_config.options = options_<?php echo $service ?>.dropdowns;
            if(<?php echo json_encode($service) ?> === "triple_sg") {
                data_config.is_streamgraph = true;
                //data_config.embed_modal = false;
                data_config.show_area = false;
            } else {
                if (<?php echo json_encode($service) ?> === "triple_km") {
                }
            }
        </script>
         <div style="margin-top:20px ">Built with <a href="https://github.com/OpenKnowledgeMaps/Headstart" target="_blank ">Head Start</a>. All content retrieved from <a href="https://www.gotriple.eu/" target="_blank ">TRIPLE</a>.
        </div>
    </body>
</html>

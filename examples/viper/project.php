<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<?php
include 'config.php';
?>
<html>
    <head>       
        <?php
        
        $id = $_GET['id'];

        $protocol = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://';
        
        $current_path = $_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']);

        $context_json = curl_get_contents($protocol . $current_path . "/" . $HEADSTART_PATH . "server/services/getContext.php?vis_id=$id");
        $context = json_decode($context_json);
        $query = $context->query;
        
        $override_labels = array(
            "tweet-text" => "Check out this visual overview of the research project $query!"
            , "title" => "Overview of the research project $query"
            , "app-name" => "VIPER"
            , "description" => "Get an overview of $query, find relevant resources, and understand their reception in different areas."
            , "twitter-type" => "summary_large_image"
            , "twitter-image" => "$SNAPSHOT_PATH$id.png"
            , "fb-image" => "$SNAPSHOT_PATH$id.png"
        );
        
        include 'head_viper.php'; 
        ?>
        
        <link type="text/css" rel="stylesheet" href="./css/openaire.css"></link>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    </head>

    <body style="margin:0px; padding:0px; max-width:1600px; margin: 0px auto;">
        
        <div id="visualization"></div>
        <script type="text/javascript" src="./js/data-config_openaire.js"></script>
        <script>
        	data_config.files = [{
        		title: "<?php echo $query; ?>",
        		file: "<?php echo $id; ?>"
        	}];
                data_config.server_url = window.location.href.replace(/[^/]*$/, '') + "<?php echo $HEADSTART_PATH; ?>server/";
        </script>
        <script type="text/javascript" src="<?php echo $HEADSTART_PATH; ?>dist/headstart.js"></script>
        <link type="text/css" rel="stylesheet" href="<?php echo $HEADSTART_PATH; ?>dist/headstart.css"></link>
        <?php if (isset($_GET['embed']) && $_GET['embed'] === 'true'){
            echo '<script>data_config.viper_credit = true</script>';
        } else {
            include("footer_vis.php");
         } ?>
        <script type="text/javascript">
            headstart.start();
        </script>
    </body>
</html>

<?php

function curl_get_contents($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}
?>

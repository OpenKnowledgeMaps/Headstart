<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

if (isset($post_params["optradio"]) && $post_params["optradio"] === "triple_km") {
  $service_integration = $post_params["optradio"];
  $post_params["vis_type"] = "overview";
  $param_types = array("from", "to", "sorting", "language", "limit");
  $repo = $post_params["optradio"];
}
if (isset($post_params["optradio"]) && $post_params["optradio"] === "triple_sg") {
  $service_integration = $post_params["optradio"];
  $post_params["vis_type"] = "timeline";
  $param_types = array("from", "to", "sorting", "language", "limit", "sg_method");
  $repo = $post_params["optradio"];
}

$result = search($service_integration, $dirty_query
                , $post_params, $param_types
                , ";", null, true
                , true, null, 3
                , "area_uri", "subject"
                , $precomputed_id, true);

echo $result

?>

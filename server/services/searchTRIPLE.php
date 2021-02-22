<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

if (isset($post_params["service"]) && $post_params["service"] === "triple_km") {
  $service_integration = $post_params["service"];
  $post_params["vis_type"] = "overview";
  $post_params["service"] = "triple";
  $param_types = array("from", "to", "sorting", "language", "limit");
}
if (isset($post_params["service"]) && $post_params["service"] === "triple_sg") {
  $service_integration = $post_params["service"];
  $post_params["vis_type"] = "timeline";
  $post_params["service"] = "triple";
  $param_types = array("from", "to", "sorting", "language", "limit", "sg_method");
}

$result = search($service_integration, $dirty_query
                , $post_params, $param_types
                , ";", null, true
                , true, null, 3
                , "area_uri", "subject"
                , $precomputed_id, true);

echo $result

?>

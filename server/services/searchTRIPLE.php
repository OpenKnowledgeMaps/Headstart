<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

if (isset($post_params["service"]) && $post_params["service"] === "triple_km") {
  $post_params["vis_type"] = "overview";
  $param_types = array("from", "to", "sorting", "language", "limit");
  $repo = $post_params["service"];
}
if (isset($post_params["service"]) && $post_params["service"] === "triple_sg") {
  $post_params["vis_type"] = "timeline";
  $param_types = array("from", "to", "sorting", "language", "limit", "sg_method");
  $repo = $post_params["service"];
}

$result = search("triple", $dirty_query
                , $post_params, $param_types
                , ";", null, true
                , true, null, 3
                , "area_uri", "subject"
                , $precomputed_id, true);

echo $result

?>

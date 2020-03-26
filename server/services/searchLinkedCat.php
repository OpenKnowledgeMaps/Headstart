<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

$result = search("linkedcat",
                 $dirty_query, $post_params,
                 array("from", "to", "include_content_type", "today", "vis_type"),
                 ";", null,
                 $transform_query_tolowercase=false, true, null, 3,
                 "area_uri", "subject", $precomputed_id, true);

echo $result

?>

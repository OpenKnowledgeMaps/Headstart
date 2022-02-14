<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$params_array = array("from", "to", "document_types", "sorting", "min_descsize");
$optional_get_params = ["repo", "coll", "vis_type", "limit"];

foreach($optional_get_params as $param) {
    if(isset($_POST[$param])) {
        $params_array[] = $param;
    }
}

$post_params = $_POST;

if (!isset($post_params["min_descsize"])) {
    $post_params["min_descsize"] = 300;
}

$result = search("base", $dirty_query
                  , $post_params, $params_array
                  , true
                  , true, null
                  , $precomputed_id, false);

echo $result

?>

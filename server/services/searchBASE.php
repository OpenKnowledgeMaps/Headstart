<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$params_array = array("document_types", "sorting", "min_descsize");
$optional_get_params = ["repo", "coll", "vis_type", "q_advanced", "lang_id", "custom_title", "exclude_date_filters", "from", "to", "custom_clustering"];


function filterEmptyString($value)
{
    // Exclude empty strings
    return $value !== '';
}

foreach($optional_get_params as $param) {
    if(isset($_POST[$param])) {
        $params_array[] = $param;
    }
}

$post_params = $_POST;

if (!isset($post_params["min_descsize"])) {
    $post_params["min_descsize"] = 300;
}
if (isset($post_params["lang_id"])) {
    $post_params["lang_id"] = array_filter($post_params["lang_id"], 'filterEmptyString');
    if (count($post_params["lang_id"]) == 0) {
        $post_params["lang_id"] = ["all-lang"];
    }
}
// ignore date filters if vis_type is set to timeline
if (isset($post_params["vis_type"]) && $post_params["vis_type"] == "timeline") {
    unset($params_array[array_search("exclude_date_filters", $params_array)]);
    unset($post_params["exclude_date_filters"]);
}
// check if exclude_date_filters is set and true
if (isset($post_params["exclude_date_filters"]) && $post_params["exclude_date_filters"] === true) {
    // Add "today" and exclude "from" and "to" from the $params_array
    $params_array = array_merge($params_array, ["today"]);
    unset($params_array["from"], $params_array["to"]);
}

// re-establish historic order for backwards ID compatibility
$historic_params_order = array("from", "to", "document_types", "sorting", "min_descsize", "repo");
$reordered_params = array();
foreach($historic_params_order as $param) {
    if (isset($post_params[$param])) {
        $reordered_params[] = $param;
    }
}
foreach($params_array as $param) {
    if (!in_array($param, $reordered_params)) {
        $reordered_params[] = $param;
    }
}
$params_array = $reordered_params;



$result = search("base", $dirty_query
                  , $post_params, $params_array
                  , true
                  , true, null
                  , $precomputed_id, false);
echo $result

?>

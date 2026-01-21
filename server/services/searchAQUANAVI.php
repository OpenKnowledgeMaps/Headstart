<?php
header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/search.php';

use headstart\library;

// Get real request parameters
$query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = $_POST["unique_id"] ?? null;

// Mock some request parameters
$post_params = $_POST;
$post_params["min_descsize"] = "0";
$post_params["lang_id"] = ["all-lang"];
$post_params["vis_type"] = "geomap";
$post_params["from"] = "1665-01-01";
$post_params["to"] = "2026-01-21";
$post_params["document_types"] = ["F"];
$post_params["sorting"] = "most-relevant";
$post_params["time_range"] = "user-defined";

// And some others...
$params_array = ["from", "to", "document_types", "sorting", "min_descsize", "lang_id"];

$is_custom_array_set = isset($post_params["custom_title"]);
if ($is_custom_array_set) {
  $params_array[] = "custom_title";
}

$result = search("aquanavi", $query, $post_params, $params_array, false, true, null, $precomputed_id, false);
echo $result
?>

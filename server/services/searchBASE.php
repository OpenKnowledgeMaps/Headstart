<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

//var_dump("!!!searchBASE start");
error_log("!!!searchBASE start");

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

//var_dump("!!!searchBASE dirty_query: " . $dirty_query);
//var_dump("!!!searchBASE precomputed_id: " . $precomputed_id);

$params_array = array("document_types", "sorting", "min_descsize");
$optional_get_params = ["repo", "coll", "vis_type", "q_advanced", "lang_id", "custom_title", "exclude_date_filters", "today", "from", "to"];
//$optional_get_params = ["repo", "coll", "vis_type", "q_advanced", "lang_id", "custom_title"];

error_log("!!!searchBASE $logString: " . print_r($params_array, true));
//error_log("!!!searchBASE params_array: " . $params_array);
//var_dump("!!!searchBASE optional_get_params: " . $optional_get_params);

error_log("!!!searchBASE _POST: " . $_POST);
error_log("!!!searchBASE _POST[exclude_date_filters]: " . $_POST["exclude_date_filters"]);

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

// check if exclude_date_filters is set and true
if (isset($post_params["exclude_date_filters"]) && $post_params["exclude_date_filters"] === true) {
    // Add "today" and exclude "from" and "to" from the $params_array
    $params_array = array_merge($params_array, ["today"]);
    unset($params_array["from"], $params_array["to"]);
}

error_log("!!!searchBASE $logString: " . print_r($params_array, true));
//error_log("$post_params: " . $params_array);



$result = search("base", $dirty_query
                  , $post_params, $params_array
                  , true
                  , true, null
                  , $precomputed_id, false);
echo $result

?>

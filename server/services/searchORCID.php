<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

// trim ORCID query
$dirty_query = trim(library\CommUtils::getParameter($_POST, "orcid"));
$precomputed_id = $_POST["unique_id"] ?? null;

$params_array = array("orcid", "today");
$optional_get_params = array("limit", "academic_age_offset", "enable_h_index", "enable_teaching_mentorship");

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


$result = search(
    "orcid",
    $dirty_query,
    $post_params,
    $params_array,
    true,
    true,
    null,
    $precomputed_id,
    false
);

echo $result

?>

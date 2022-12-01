<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$post_params = $_POST;

if (array_key_exists("acronymtitle", $_POST)) {
    $q = library\CommUtils::getParameter($_POST, "acronymtitle");
    $param_array = array("project_id",
    "funder",
    "title",
    "funding_tree",
    "call_id",
    "start_date",
    "end_date",
    "oa_mandate",
    "special_clause",
    "organisations",
    "openaire_link",
    "obj_id",
    "acronym");
    $id_array = array("project_id", "funder");
} else {
    $q = library\CommUtils::getParameter($_POST, "project_id");
    $param_array = array("project_id", "funder");
    $id_array = array("project_id", "funder");
}


$result = search("openaire", $q
                  , $post_params, $param_array
                  , false
                  , true, $id_array
                  , null, true);

echo $result

?>

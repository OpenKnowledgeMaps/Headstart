<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;

$result = search("gsheets", $dirty_query, $post_params
                    , array("vis_id")
                    , ";", null, true, false, null, 3
                    , "area_uri", "subject", "covid19", false
                    , "api");

echo $result

?>

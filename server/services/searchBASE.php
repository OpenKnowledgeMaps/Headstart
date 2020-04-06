<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

$result = search("base", $dirty_query, $post_params
                    , array("from", "to", "document_types", "sorting")
                    , ";", null, true, true, null, 3
                    , "area_uri", "subject", $precomputed_id, false
                    , "legacy");

echo $result

?>

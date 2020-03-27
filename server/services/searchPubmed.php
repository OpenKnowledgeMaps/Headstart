<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);
$query_params = array("from", "to", "sorting");
if(isset($_POST["article_types"])) {
    $query_params[] = "article_types";
}

$post_params = $_POST;

$result = search("pubmed", $dirty_query
                    , $post_params, $query_params
                    , ";", null, true, true, null, 3
                    , "area_uri", "subject", $precomputed_id, false);

echo $result

?>

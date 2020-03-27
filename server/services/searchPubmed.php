<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");
$precomputed_id = (isset($_POST["unique_id"]))?($_POST["unique_id"]):(null);

$post_params = $_POST;

#HOTFIX - article_types cause a 414 with PubMed
#$result = search("pubmed", $dirty_query, $post_params, array("article_types", "from", "to", "sorting"), ";", null);
$result = search("pubmed", $dirty_query
                    , $post_params, array("article_types", "from", "to", "sorting")
                    , ";", null, true, true, null, 3
                    , "area_uri", "subject", $precomputed_id, false);

echo $result

?>

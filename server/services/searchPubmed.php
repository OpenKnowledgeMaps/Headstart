<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;

#HOTFIX - article_types cause a 414 with PubMed
#$result = search("pubmed", $dirty_query, $post_params, array("article_types", "from", "to", "sorting"), ";", null);
$result = search("pubmed", $dirty_query, $post_params, array("from", "to", "sorting"), ";", null);

echo $result

?>

<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;

$result = search("linkedcat_authorview",
                 $dirty_query,
                 $post_params,
                 array("id", "doc_count", "living_dates", "image_link"),
                 ";"
               );

echo $result

?>

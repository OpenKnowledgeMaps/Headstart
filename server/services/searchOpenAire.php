<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$acronym = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;

$result = search("openaire", $acronym, $post_params, array("project_id", "funding_level"), ";", null);

echo $result

?>

<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/preprocessing/Snapshot.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);
$service = array("name" => "PubMed", "service" => "pubmed");

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;

$result = search("pubmed", $dirty_query, $post_params, array("article_types", "from", "to"), ";", null);

$snapshot = new \headstart\preprocessing\Snapshot($ini_array, $result, $service);
$snapshot->takeSnapshot();

echo $result

?>

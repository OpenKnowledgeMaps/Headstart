<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);
$settings = $ini_array["snapshot"];
$general = $ini_array["general"];

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$post_params = $_POST;
$result = search("pubmed", $dirty_query, $post_params, array("article_types", "from", "to"), ";", null);
$resultDecoded = json_decode($result);

$id = $resultDecoded->id;
$query = $resultDecoded->query;
//$title = 'Overview of PubMed articles for ' . $query . ':' . $id;
$command = 'nohup '.
    $settings["phantomjs_path"] . ' ' .
    $settings["getsvg_path"] .
    ' "' .
    $general["host"] .
    $settings["snapshot_php"] . '?'.
    'query='.$query.
    '&service_name=PubMed'.
    '&service=pubmed'.
    '&file=' . $id . '" '.
    $settings["storage_path"] .
    $id .'.png '. $settings["snapshot_width"] .' 1>/dev/null 2>/dev/null &';
exec($command);
echo $result

?>

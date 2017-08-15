<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

$data = $persistence->getContext($vis_id)[0];
$return_data = array("id" => $data["rev_vis"], "query" => $data["vis_query"], "service" => $data["vis_title"]
                         , "timestamp" => $data["rev_timestamp"], "params" => $data["vis_params"]);
    
$jsonData = json_encode($return_data);
library\CommUtils::echoOrCallback($jsonData, $_GET);

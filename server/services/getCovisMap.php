<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$dirty_query = library\CommUtils::getParameter($_GET, "q");
$sheet_id = library\CommUtils::getParameter($_GET, "sheet_id");
$context = filter_input(INPUT_GET, "context", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));
$streamgraph = filter_input(INPUT_GET, "streamgraph", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));
$backend = isset($_GET["backend"]) ? library\CommUtils::getParameter($_GET, "backend") : "legacy";

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

if ($backend == "api") {
} else {
  $result = json_decode(search("gsheets", $dirty_query, array("sheet_id" => $sheet_id, "sheet_range" => "Resources!A1:N200")
                      , array("sheet_id")
                      , ";", null, true, false, null, 3
                      , "area_uri", "subject", null, false
                      , "api"));
  $vis_id = $result["vis_id"];
  $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
  $rev_data = json_decode($data["rev_data"], true);
  $return_data = array("context" => array("id" => $data["rev_vis"],
                                          "query" => $data["vis_query"],
                                          "service" => $data["vis_title"],
                                          "timestamp" => $data["rev_timestamp"],
                                          "params" => $data["vis_params"],
                                          "sheet_id" => $rev_data["sheet_id"],
                                          "last_update" => $rev_data["last_update"]),
                       "data" => $rev_data["data"],
                       "errors" => $rev_data["errors"]);
  $jsonData = json_encode($return_data);
  library\CommUtils::echoOrCallback($jsonData, $_GET);
}

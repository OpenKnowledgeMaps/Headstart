<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "sheet_id");
$backend = isset($_GET["backend"]) ? library\CommUtils::getParameter($_GET, "backend") : "legacy";

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

if ($backend == "api") {
  $return_data = array("status" => "error", "reason" => "Not implemented.");
  $jsonData = json_encode($return_data);
  library\CommUtils::echoOrCallback($jsonData, $_GET);
} else {
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

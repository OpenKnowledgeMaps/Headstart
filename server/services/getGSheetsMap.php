<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require 'search.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$persistence_backend = $ini_array["general"]["persistence_backend"];
$database = $ini_array["connection"]["database"];

if ($persistence_backend === "api") {
  $route = $ini_array["general"]["api_url"] . "persistence/" . "getLastVersion/" . $database;
  $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => true));
  $res = library\CommUtils::call_api($route, $payload);
  if ($res["httpcode"] != 200) {
    library\CommUtils::echoOrCallback($res, $_GET);
  } else {
    $data = json_decode($res["result"], true);
    $rev_data = json_decode($data["rev_data"], true);
    $context = array("id" => $data["rev_vis"],
                                   "query" => $data["vis_query"],
                                   "service" => $data["vis_title"],
                                   "timestamp" => $data["rev_timestamp"],
                                   "params" => $data["vis_params"],
                                   "sheet_id" => $rev_data["sheet_id"],
                                   "last_update" => $rev_data["last_update"]);
    if (array_key_exists("additional_context", $rev_data)) {
      $context = array_merge($context, $rev_data["additional_context"]);
    }
    $return_data = array("context" => $context,
                         "data" => $rev_data["data"],
                         "errors" => $rev_data["errors"]);
    $jsonData = json_encode($return_data);
    library\CommUtils::echoOrCallback($jsonData, $_GET);
  }
} else {
  $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
  $rev_data = json_decode($data["rev_data"], true);
  $context = array("id" => $data["rev_vis"],
                                 "query" => $data["vis_query"],
                                 "service" => $data["vis_title"],
                                 "timestamp" => $data["rev_timestamp"],
                                 "params" => $data["vis_params"],
                                 "sheet_id" => $rev_data["sheet_id"],
                                 "last_update" => $rev_data["last_update"]);
  if (array_key_exists("additional_context", $rev_data)) {
    $context = array_merge($context, $rev_data["additional_context"]);
  }
  $return_data = array("context" => $context,
                       "data" => $rev_data["data"],
                       "errors" => $rev_data["errors"]);
  $jsonData = json_encode($return_data);
  library\CommUtils::echoOrCallback($jsonData, $_GET);
}

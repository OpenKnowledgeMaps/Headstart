<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$gsheet_last_updated = library\CommUtils::getParameter($_GET, "gsheet_last_updated");
$database = $ini_array["connection"]["database"];

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$persistence_backend = $ini_array["general"]["persistence_backend"];

if ($persistence_backend == "api") {
  $route = $ini_array["general"]["api_url"] . "persistence/" . "getLastVersion/" . $database;
  $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => true));
  $res = library\CommUtils::call_api($route, $payload);
  if ($res["httpcode"] != 200) {
    library\CommUtils::echoOrCallback($res, $_GET);
  } else {
    $data = json_decode($res["result"], true);
    $rev_data = json_decode($data["rev_data"], true);
    $timestamp_old = $rev_data["last_update"];
    $update_available = ($timestamp_old != $gsheet_last_updated) ? true : false;
    $return_data = array("update_available" => $update_available);
    $jsonData = json_encode($return_data);
    library\CommUtils::echoOrCallback($jsonData, $_GET);
  }
} else {
  $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
  $rev_data = json_decode($data["rev_data"], true);
  $timestamp_old = $rev_data["last_update"];
  $update_available = ($timestamp_old != $gsheet_last_updated) ? true : false;
  $return_data = array("update_available" => $update_available);
  $jsonData = json_encode($return_data);
  library\CommUtils::echoOrCallback($jsonData, $_GET);
}

?>

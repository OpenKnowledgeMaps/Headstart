<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$persistence_backend = isset($_GET["persistence_backend"]) ? library\CommUtils::getParameter($_GET, "persistence_backend") : "legacy";

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

if ($persistence_backend === "api") {
  $route = $ini_array["general"]["api_url"] . "/persistence" . "/getContext";
  $payload = json_encode(array("vis_id" => $vis_id));
  $res = library\CommUtils::call_api($route, $payload);
  if ($res["httpcode"] != 200) {
    library\CommUtils::echoOrCallback($res, $_GET);
  } else {
    $data = json_decode($res["result"], true);
    $return_data = array("id" => $data["rev_vis"],
                         "query" => $data["vis_query"],
                         "service" => $data["vis_title"],
                         "timestamp" => $data["rev_timestamp"],
                         "params" => $data["vis_params"]);
    $jsonData = json_encode($return_data);
    library\CommUtils::echoOrCallback($jsonData, $_GET);
  }
} else {
  $data = $persistence->getContext($vis_id)[0];
  $return_data = array("id" => $data["rev_vis"],
                       "query" => $data["vis_query"],
                       "service" => $data["vis_title"],
                       "timestamp" => $data["rev_timestamp"],
                       "params" => $data["vis_params"]);

  $jsonData = json_encode($return_data);
  library\CommUtils::echoOrCallback($jsonData, $_GET);
}

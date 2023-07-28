<?php
// This route is used for the fallback mechanism that checks if
// connection was interrupted during waiting, and a vis already created
header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);
$apiclient = new \headstart\library\APIClient($ini_array);
$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$persistence_backend = $ini_array["general"]["persistence_backend"];

if ($persistence_backend === "api") {
  $payload = json_encode(array("vis_id" => $vis_id,
                               "details" => false,
                               "context" => false));
  $res = $apiclient->call_persistence("getLastVersion", $payload);
  if ($res["httpcode"] != 200) {
    echo json_encode($res);
  } else {
    $last_version = json_decode($res["result"], true);
  }
} else {
  $last_version = $persistence->getLastVersion($vis_id, false);
}


if ($last_version != null && $last_version != "null" && $last_version != false) {
    echo json_encode(array("status" => "success", "last_version" => $last_version));
} else {
    echo json_encode(array("status" => "error"));
}

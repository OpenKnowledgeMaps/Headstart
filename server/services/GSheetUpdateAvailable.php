<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$gsheet_last_updated = library\CommUtils::getParameter($_GET, "gsheet_last_updated");
$backend = isset($_GET["backend"]) ? library\CommUtils::getParameter($_GET, "backend") : "legacy";

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

if ($backend == "api") {
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

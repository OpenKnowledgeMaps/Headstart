<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/PostgresPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/DispatchingPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$revision_context =  isset($_GET["revision_context"]) ? library\CommUtils::getParameter($_GET, "revision_context") : false;

$apiclient = new headstart\library\APIClient($ini_array);
$sqlitePersistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$postgresPersistence = new \headstart\persistence\PostgresPersistence($apiclient);
$shiftReadPercentage = $ini_array["general"]["shift_read_percentage"];
$persistence = new \headstart\persistence\DispatchingPersistence($sqlitePersistence, $postgresPersistence, $shiftReadPercentage);


$data = $persistence->getContext($vis_id)[0];
$return_data = array("id" => $data["rev_vis"],
                      "query" => $data["vis_query"],
                      "service" => $data["vis_title"],
                      "timestamp" => $data["rev_timestamp"],
                      "params" => $data["vis_params"]);
if (array_key_exists("additional_context", $data)) {
  $return_data = array_merge($return_data, $data["additional_context"]);
}
$jsonData = json_encode($return_data);
library\CommUtils::echoOrCallback($jsonData, $_GET);

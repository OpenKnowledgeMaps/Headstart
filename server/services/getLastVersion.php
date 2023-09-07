<?php
// This route is used for the fallback mechanism that checks if
// connection was interrupted during waiting, and a vis already created
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
$apiclient = new \headstart\library\APIClient($ini_array);
$sqlitePersistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$postgresPersistence = new \headstart\persistence\PostgresPersistence($apiclient);
$shiftReadPercentage = isset($ini_array["general"]["shift_read_percentage"]);
$persistence = new \headstart\persistence\DispatchingPersistence($sqlitePersistence, $postgresPersistence, $shiftReadPercentage);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");

$last_version = $persistence->getLastVersion($vis_id, false);


if ($last_version != null && $last_version != "null" && $last_version != false) {
    echo json_encode(array("status" => "success", "last_version" => $last_version));
} else {
    echo json_encode(array("status" => "error"));
}

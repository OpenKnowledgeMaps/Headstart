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

$last_version = $persistence->getLastVersion($vis_id, false);

if ($last_version != null && $last_version != "null" && $last_version != false) {
    echo json_encode(array("status" => "success", "last_version" => $last_version));
} else {
    echo json_encode(array("status" => "error"));
}

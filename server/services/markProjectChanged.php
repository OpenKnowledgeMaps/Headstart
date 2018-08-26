<?php
header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/persistence/ViperUpdater.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';

use headstart\library;
use headstart\persistence;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");

$persistence = new headstart\persistence\ViperUpdater($ini_array["connection"]["sqlite_db"]);

$persistence->markVisChanged($vis_id);
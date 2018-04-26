<?php

require dirname(__FILE__) . '/../classes/headstart/persistence/ViperUpdater.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
use headstart\library;
use headstart\persistence;

foreach($argv as $value)
{
  echo "$value\n";
}

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);
$persistence = new headstart\persistence\ViperUpdater($ini_array["connection"]["sqlite_db"]);

$maps = $persistence->getUpdateMaps($vis_changed = false);

var_dump($maps);

?>

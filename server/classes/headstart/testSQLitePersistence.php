<?php

namespace headstart;

require_once("autoload.inc.php");

use headstart\persistence;
use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$persistence = new persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

//$persistence->createTables();
 
//$persistence->createVisualization("test_id", "My Test Vis", "{[some json string;]}");

echo $persistence->getLastVersion("vis_id2");

//$persistence->writeRevision("test_id", "{[some other json string;]}");
        
//echo $persistence->getLastVersion("test_id");


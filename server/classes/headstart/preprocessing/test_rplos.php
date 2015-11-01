<?php

namespace headstart\preprocessing;

require_once("/../autoload.inc.php");

use headstart\preprocessing\calculation;
use headstart\preprocessing\naming;
use headstart\library;
use headstart\persistence;

$INI_DIR = dirname(__FILE__) . "/../../../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

$calculation = new calculation\RCalculation($ini_array);
$output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, "dna");

$output_json = end($output);

//echo $output_json;

$persistence = new persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
//$persistence->createVisualization("test_rplos", "My Test RPLOS", $output_json);

$persistence->writeRevision("test_rplos", $output_json);

//$naming = new naming\ApiNaming($ini_array);
//$naming->performNaming($WORKING_DIR);


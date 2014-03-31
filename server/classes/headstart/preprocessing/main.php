<?php

namespace headstart\preprocessing;

require_once("/../autoload.inc.php");

use headstart\preprocessing\connection;
use headstart\preprocessing\calculation;
use headstart\preprocessing\naming;
use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../../../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

$calculation = new calculation\RCalculation($ini_array);
$calculation->performCalculationAndWriteOutputToFile($ini_array["output"]["cooc"], 
        $ini_array["output"]["metadata"], $ini_array["output"]["output_scaling_clustering"]);

$naming = new naming\ApiNaming($ini_array);
$naming->performNaming($WORKING_DIR);

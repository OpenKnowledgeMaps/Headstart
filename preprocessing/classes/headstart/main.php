<?php

namespace headstart;

require_once("autoload.inc.php");

use headstart\connection;
use headstart\calculation;
use headstart\naming;

$INI_DIR = "../../conf/";

$ini_array = array();

if(file_exists($INI_DIR . 'config_local.ini')) {
    $ini_array = parse_ini_file($INI_DIR . "config_local.ini", true);
} else {
    $ini_array = parse_ini_file($INI_DIR . "config.ini", true);
}

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

$calculation = new calculation\RCalculation($ini_array);
$calculation->performCalculationAndWriteOutputToFile($ini_array["output"]["cooc"], 
        $ini_array["output"]["metadata"], $ini_array["output"]["output_scaling_clustering"]);

$naming = new naming\ApiNaming($ini_array);
$naming->performNaming();

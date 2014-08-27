<?php

namespace headstart\preprocessing;

require_once("../autoload.inc.php");

use headstart\preprocessing\connection;
use headstart\preprocessing\calculation;
use headstart\preprocessing\naming;
use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../../../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$years = $ini_array["general"]["year"];
$years_string = "";

if(is_array($years)) {
    foreach($years as $year) {
        $years_string .= $year . "_";
    }
    $years_string = substr($years_string, 0, strlen($years_string)-1);
} else {
    $years_String = $years;
}

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"]. $years_string . "/";

$dbconnect = new connection\DBConnectionTopics($ini_array);
$dbconnect->establishConnection();

//$dbconnect->writeMetadataFile($ini_array["general"]["event_id"], 
//        $WORKING_DIR . $ini_array["output"]["metadata"], 
//        $ini_array["general"]["cut_off"]);
//
//$contents = $dbconnect->returnContents($ini_array["general"]["event_id"]);
//
$naming = new naming\ApiNaming($ini_array);
//$topics = $naming->executeCurlSensium($contents);
//
//foreach($topics as $api => $topic) {
//    $cluster_names = $topics[$api];
//    $dbconnect->writeTopicsToDB($cluster_names, $api);
//}
//
//$topics = $naming->executeCurl($contents);
//
//foreach($topics as $api => $topic) {
//    $cluster_names = $topics[$api];
//    $dbconnect->writeTopicsToDB($cluster_names, $api);
//}

$dbconnect->writeCoocFile($ini_array["general"]["event_id"], 
        $ini_array["general"]["cut_off"], 
        $WORKING_DIR . $ini_array["output"]["cooc"],
        array("calais", "zemanta", "sensium"),
        false);

$calculation = new calculation\RCalculation($ini_array);
$calculation->performCalculationAndWriteOutputToFile($WORKING_DIR);

$naming->performNaming($WORKING_DIR);


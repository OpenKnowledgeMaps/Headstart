<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$context = filter_input(INPUT_GET, "context", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));
$streamgraph = filter_input(INPUT_GET, "streamgraph", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));

$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

if ($context === true) {
   $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
   $return_data = array("context" => array("id" => $data["rev_vis"], "query" => $data["vis_query"], "service" => $data["vis_title"]
                            , "timestamp" => $data["rev_timestamp"], "params" => $data["vis_params"]),
                        "data" => $data["rev_data"]);
   if ($streamgraph === true) {
     $calculation = new headstart\preprocessing\calculation\RCalculation($ini_array);
     $working_dir = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];
     $sg_output = $calculation->performStreamgraphCalculation($working_dir, $return_data["context"]["service"], $return_data["data"]);
     $sg_output_json = end($sg_output);
     $sg_output_json = mb_convert_encoding($sg_output_json, "UTF-8");
     $return_data["streamgraph"] = $sg_output_json;
   }
   $jsonData = json_encode($return_data);
   library\CommUtils::echoOrCallback($jsonData, $_GET);
} else {
    $jsonData = $persistence->getLastVersion($vis_id);
    library\CommUtils::echoOrCallback($jsonData[0], $_GET);
}

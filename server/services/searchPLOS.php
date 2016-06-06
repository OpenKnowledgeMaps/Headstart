<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/preprocessing/naming/KeywordNaming.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

require 'helper.php';

use headstart\library;

function packParamsJSON($params_array) {

    $output_array = array();

    foreach ($params_array as $entry) {
        $current_params = library\CommUtils::getParameter($_POST, $entry);
        $output_array[$entry] = $current_params;
    }

    return json_encode($output_array);
}

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$dirty_query = library\CommUtils::getParameter($_POST, "q");

$query = strip_tags($dirty_query);

$query = strtolower($query);

$query = addslashes($query);

$persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

$settings = $ini_array["general"];

$params_json = packParamsJSON(array("article_types", "journals", "from", "to"));

$unique_id = $persistence->createID(array($query, $params_json));

$last_version = $persistence->getLastVersion($unique_id, false);

if ($last_version != null && $last_version != "null" && $last_version != false) {
    redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?id=" . $unique_id); 
    //echo json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
    //return;
}

$params_file = tmpfile();
$params_meta = stream_get_meta_data($params_file);
$params_filename = $params_meta["uri"];
fwrite($params_file, $params_json);

$WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

$calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
$output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query, $params_filename, "plos");

//print_r($output);

$output_json = end($output);

$output_json = mb_convert_encoding($output_json, "UTF-8");

if (!library\Toolkit::isJSON($output_json) || $output_json == "null" || $output_json == null) {
    //echo "Sorry! Something went wrong. Most likely there are not enough documents for your search - please <a href=\"http://" . $settings["host"] . $settings["vis_path"] ."\">go back and try again.</a>";
    //    echo $output_json;
    echo json_encode(array("status" => "error"));;
    return;
}

$result = json_decode($output_json, true);

$naming = new \headstart\preprocessing\naming\KeywordNaming($ini_array);

$naming->performNamingTfIdf($result, 3, $id="area_uri", $subjects="subject", $keyword_separator=";");

//attachMostUsedKeywords($result, 3);

$input_json = json_encode($result);

$new_last_version = $persistence->getLastVersion($unique_id, false);

$vis_title = "PLOS Search: " . $query;

if ($new_last_version == null || $new_last_version == false) {
    $persistence->createVisualization($unique_id, $vis_title, $input_json, $query, $dirty_query, $params_json);
} else {
    $persistence->writeRevision($unique_id, $input_json);
}

echo json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
//redirect("http://" . $settings["host"] . $settings["vis_path"] . "index.php?query=$query&id=$unique_id"); 
?>

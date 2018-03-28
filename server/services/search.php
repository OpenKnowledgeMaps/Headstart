<?php

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/preprocessing/naming/KeywordNaming.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/preprocessing/Snapshot.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

require 'helper.php';

use headstart\library;

function packParamsJSON($params_array, $post_params) {
    
    if($params_array === null) {
        return null;
    }

    $output_array = array();

    foreach ($params_array as $entry) {
        $current_params = library\CommUtils::getParameter($post_params, $entry);
        $output_array[$entry] = $current_params;
    }

    return json_encode($output_array);
}

function utf8_converter($array)
{
    array_walk_recursive($array, function(&$item, $key){
        if(!mb_detect_encoding($item, 'utf-8', true)){
                $item = utf8_encode($item);
        }
    });
 
    return $array;
}

function search($repository, $dirty_query, $post_params, $param_types, $keyword_separator, $taxonomy_separator, $num_labels = 3,
        $id="area_uri", $subjects="subject") {
    $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

    $ini_array = library\Toolkit::loadIni($INI_DIR);

    $query = strip_tags($dirty_query);

    $query = strtolower($query);

    $query = addslashes($query);

    $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

    $settings = $ini_array["general"];

    $params_json = packParamsJSON($param_types, $post_params);

    $unique_id = $persistence->createID(array($query, $params_json));

    $last_version = $persistence->getLastVersion($unique_id, false);

    if ($last_version != null && $last_version != "null" && $last_version != false) {
        echo json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
        return;
    }

    $params_file = tmpfile();
    $params_meta = stream_get_meta_data($params_file);
    $params_filename = $params_meta["uri"];
    fwrite($params_file, $params_json);

    $WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];

    $calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
    $output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query, $params_filename, $repository);

    $output_json = end($output);
    $output_json = mb_convert_encoding($output_json, "UTF-8");

    if (!library\Toolkit::isJSON($output_json) || $output_json == "null" || $output_json == null) {

        echo json_encode(array("status" => "error"));;
        return;
    }

    $result = json_decode($output_json, true);
 
    $input_json = json_encode(utf8_converter($result));
    $input_json = preg_replace("/\<U\+(.*?)>/", "&#x$1;", $input_json);

    $vis_title = $repository;
    
    $exists = $persistence->existsVisualization($unique_id);

    if (!$exists) {
        $persistence->createVisualization($unique_id, $vis_title, $input_json, $query, $dirty_query, $params_json);
    } else {
        $persistence->writeRevision($unique_id, $input_json);
    }
    
    $repo_mapping = array("plos" => "PLOS"
                            , "pubmed" => "PubMed"
                            , "doaj" => "DOAJ"
                            , "base" => "BASE"
                            , "openaire" => "OpenAire");
    
    if(!isset($ini_array["snapshot"]["snapshot_enabled"]) || $ini_array["snapshot"]["snapshot_enabled"] > 0) {
        $snapshot = new \headstart\preprocessing\Snapshot($ini_array, $query, $unique_id, $repository, $repo_mapping[$repository]);
        $snapshot->takeSnapshot();
    }
    
    return json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
}
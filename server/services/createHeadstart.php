<?php

if (file_exists(dirname(__FILE__) . '/config_local.ini')) {
    $ini_services = parse_ini_file(dirname(__FILE__) . "/config_local.ini", true);
} else {
    $ini_services = parse_ini_file(dirname(__FILE__) . "/config.ini", true);
}

$path = $ini_services["path_to_headstart_server"];

require $path . 'classes/headstart/preprocessing/calculation/RCalculation.php';
require $path . 'classes/headstart/preprocessing/naming/KeywordNaming.php';
require_once $path . 'classes/headstart/library/CommUtils.php';
require_once $path . 'classes/headstart/library/toolkit.php';

require $path . 'services/helper.php';

use headstart\library;

header('Content-type: application/json');

$url = $_POST["url"];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$output = curl_exec($ch);

$input_json = substr($output, 2, strlen($output) - 4);

$test = mb_detect_encoding($input_json);

//$input_json = $test_json;

$input_array = json_decode($input_json, true);

$input_array = $input_array["data"];

$cooc = calculateCooccurrences($input_array, "keywords");

$cooc_json = json_encode($cooc);

$INI_DIR = $path . "preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$settings = $ini_array["general"];

$metadata_file = tmpfile();
fwrite($metadata_file, json_encode($input_array, JSON_HEX_QUOT | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS));
$metadata_meta = stream_get_meta_data($metadata_file);
$metadata_filename = $metadata_meta["uri"];

$cooc_file = tmpfile();
fwrite($cooc_file, $cooc_json);
$cooc_meta = stream_get_meta_data($cooc_file);
$cooc_filename = $cooc_meta["uri"];

$calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
$output = $calculation->performCalculationAndReturnOutputAsJSON($metadata_filename, $cooc_filename);

fclose($metadata_file);
fclose($cooc_file);

$output_json = end($output);

$output_json = iconv(mb_detect_encoding($output_json), "UTF-8", $output_json);

$output_json = html_entity_decode(preg_replace("/<U\+([0-9A-F]{4})>/", "&#x\\1;", $output_json), ENT_NOQUOTES, 'UTF-8');

if (!library\Toolkit::isJSON($output_json)) {
    echo "Sorry! Something went wrong - most likely we haven't found any documents matching your search term. Please <a href=\"http://" . $settings["host"] . $settings["vis_path"] . "\">go back and try again.</a>";
//    echo $output_json;
    return;
}

$result = json_decode($output_json, true);

$naming = new \headstart\preprocessing\naming\KeywordNaming($ini_array);
$naming->performNamingTfIdf($result, 3, "area_uri", "keywords", ",", null);

echo json_encode($result);

function calculateCooccurrences($array, $key) {
    $working = array();
    $output = array();

    foreach ($array as $entry) {

        $id = $entry["id"];
        $keywords = explode(",", $entry[$key]);

        array_walk($keywords, function(&$value, &$key) {
            $value = trim($value);
        });
        
        $working[$id] = $keywords;
    }
    
    
    $row = 0;
    $keys = array_keys($working);
    foreach($working as $id => $keywords) {
        
        for ($corow = $row; $corow < count($working); $corow++) {
            $id2 = $keys[$corow];
            $intersect = array_intersect($keywords, $working[$id2]);
            
            if ($corow == $row) {
                $output[] = array("id1" => $id, "id2" => $id2, "count" => count($intersect));
            } else {
                $output[] = array("id1" => $id, "id2" => $id2, "count" => count($intersect));
                $output[] = array("id1" => $id2, "id2" => $id, "count" => count($intersect));
            }
            
            $corow++;
        }
        
        $row++;
    }
    
    return $output;
     
}

function entities_to_unicode($str) {
    $str = html_entity_decode($str, ENT_QUOTES, 'UTF-8');
    $str = preg_replace_callback("/(&#[0-9]+;)/", function($m) { return mb_convert_encoding($m[1], "UTF-8", "HTML-ENTITIES"); }, $str);
    return $str;
}

?>
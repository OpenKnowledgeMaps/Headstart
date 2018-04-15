<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';

use headstart\library;

function createAndAddMultiHandle($url, &$multi_array, &$mh, $id) {
  $multi_array[$id] = curl_init();
  curl_setopt($multi_array[$id], CURLOPT_URL, $url);
  curl_setopt($multi_array[$id], CURLOPT_RETURNTRANSFER, 1);
  curl_multi_add_handle($mh, $multi_array[$id]);
}

$funders = library\CommUtils::getParameter($_GET, "funder");
$project_ids = library\CommUtils::getParameter($_GET, "project_id");
$obj_ids = library\CommUtils::getParameter($_GET, "obj_id");

$multi_array = array();
$results = array();

$mh = curl_multi_init();

foreach ($project_ids as $i => $project_id) {
  $url_publications = "http://api.openaire.eu/search/publications?projectID=" . $project_id . 
          "&funder=" . $funders[$i] . "&format=json&size=0";
  
  $url_datasets = "http://api.openaire.eu/search/datasets?projectID=" . $project_id . 
          "&funder=" . $funders[$i] . "&format=json&size=0";
  
  $id = $obj_ids[$i];
  createAndAddMultiHandle($url_publications, $multi_array, $mh, "p_" . $id);
  createAndAddMultiHandle($url_datasets, $multi_array, $mh, "d_" . $id);
  
}

$index=null;
do {
  curl_multi_exec($mh,$index);
} while($index > 0);

foreach($multi_array as $id => $ch) {
  $results[$id] = curl_multi_getcontent($ch);
  curl_multi_remove_handle($mh, $ch);
}

curl_multi_close($mh);

$return_array = array();

foreach($results as $id => $result) {
    $prefix = substr($id, 0, 2);
    $obj_id = substr($id, 2);
    
    $result_array = json_decode($result, true);
    
    if($prefix  == "p_") {
        $return_array[$obj_id]["publications"] = $result_array["response"]["header"]["total"]["$"];
    } else if($prefix  == "d_") {
        $return_array[$obj_id]["datasets"] = $result_array["response"]["header"]["total"]["$"];
    }
}

$jsonData = json_encode($return_array);

echo $jsonData;


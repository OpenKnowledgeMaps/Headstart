<?php

require 'search.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
use headstart\library;
use headstart\persistence;
use headstart\search;

// var_dump($argv);

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

// $funder = library\CommUtils::getParameter($_GET, "funder");
// $startYear = library\CommUtils::getParameter($_GET, "startYear");
// $endYear = library\CommUtils::getParameter($_GET, "endYear");
// $participantCountries = library\CommUtils::getParameter($_GET, "participantCountries");
// $participantAcronyms = library\CommUtils::getParameter($_GET, "participantAcronyms");


$response = getProjectsbyFunder("FWF", NULL);
$parsed_response = parseProjects($response);
$resource_counts = getResourceCounts($parsed_response);
var_dump($resource_counts);


function createMaps($projects) {

}

function parseProjects($response) {
  $xml = simplexml_load_string($response);
  $namespaces = $xml->getNamespaces(true);
  $xml->registerXPathNamespace('oaf', 'http://namespace.openaire.eu/oaf');
  $xml->registerXPathNamespace('dri', 'http://www.driver-repository.eu/namespace/dri');
  $xml->registerXPathNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  $projects = $xml->xpath("//result//oaf:project");
  $project_ids = $xml->xpath("//code");
  $funders = $xml->xpath("//fundingtree/funder/shortname");
  $obj_ids = $xml->xpath("//header//dri:objIdentifier");
  $parsed_projects = array_combine($project_ids, $funders);
  $parsed_ids = array_combine($project_ids, $obj_ids);
  return array($parsed_projects, $parsed_ids);
}

function filterProjects($projects) {
}


function getProjectsbyFunder($funder, $params) {
  $funder = "EC";
  $startYear = "2017";
  $endYear = "2018";

  $url = 'http://api.openaire.eu/search/projects?format=xml'
      . "&funder=" . $funder
      . "&size=" . "100"
      . "&startYear=" . $startYear
      . "&endYear=" . $endYear;
  $ch = curl_init();

  curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $url
  ));

  $response = curl_exec($ch);

  return $response;
}


# functions for getting resources

function createAndAddMultiHandle($url, &$multi_array, &$mh, $id) {
  $multi_array[$id] = curl_init();
  curl_setopt($multi_array[$id], CURLOPT_URL, $url);
  curl_setopt($multi_array[$id], CURLOPT_RETURNTRANSFER, 1);
  curl_multi_add_handle($mh, $multi_array[$id]);
}

function getResourceCounts($parsed_response) {
  $parsed_projects = $parsed_response[0];
  $parsed_ids = $parsed_response[1];
  $multi_array = array();
  $results = array();
  $mh = curl_multi_init();
  foreach ($parsed_projects as $project_id => $funder) {
    $url_publications = "http://api.openaire.eu/search/publications?projectID="
            . urlencode($project_id)
            . "&funder=" . $funder . "&format=json&size=0";
    $url_datasets = "http://api.openaire.eu/search/datasets?projectID="
            . urlencode($project_id)
            . "&funder=" . $funder . "&format=json&size=0";

    $id = $parsed_ids[$project_id];
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
  return $return_array;

}

?>

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

# define options
# vis_changed, required: true/false
# object_ids, optional: path to csv of series of unique object IDs as given by openaire
# funder, optional: funder ID
# project_id, optional: project_id
# test: flag for testing purposes
$shortopts = "";
$longopts = array(
  "object_ids::",
  "funderproject::",
  "test::"
);

# parse options and determine action

$options = getopt($shortopts, $longopts);
$action = parseOptions($options);

if ($action == 'getByObjectIDs') {
  $object_ids = array_map('str_getcsv', file($options['object_ids']));
  $response = getCandidatesByObjectIDs($object_ids, NULL);
} elseif ($action == 'getByFunderProject') {
  $funderparamslist = array_map('str_getcsv', file($options['funderproject']));
  $responses = array();
  foreach($funderparamslist as $funderparams) {
    $responses[] = getProjectsbyFunder($funderparams);
  };
} else {
  echo "No valid action.\n";
}

# main logic
# currently defaults to getCandidates if no specific action is identified
$filtered_project_ids = array();
foreach($responses as $response) {
  $parsed_response = parseProjects($response);
  $funder = $parsed_response[0];
  $objid2projid = $parsed_response[3];
  $resource_counts = getResourceCounts($parsed_response);
  $filtered_projects = filterProjects($resource_counts);
  foreach($filtered_projects as $fp) {
    $proj_id = $objid2projid[$fp];
    $filtered_project_ids[$proj_id] = $funder;
  };
}

var_dump($filtered_project_ids);




# define functions

function parseOptions($options) {
  if (array_key_exists('object_ids', $options) and
      !array_key_exists('funderproject', $options)) {
    $action = "getByObjectIDs";
  } elseif (array_key_exists('funderproject', $options) and
            !array_key_exists('object_ids', $options)) {
    $action = "getByFunderProject";
  } else {
    echo "Invalid combination of options.\n";
    $action = NULL;
  }
  return $action;
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
  $funderstr = array();
  foreach($funders as $f) {
    $funderstr[] = (string)$f;
  }
  $obj_ids = $xml->xpath("//header//dri:objIdentifier");
  $obj_idstr = array();
  foreach($obj_ids as $obj_id) {
    $obj_idstr[] = (string)$obj_id;
  }
  $proj_idstr = array();
  foreach($project_ids as $proj_id) {
    $proj_idstr[] = (string)$proj_id;
  }
  $parsed_projects = array_combine($proj_idstr, $funderstr);
  $projid2objid = array_combine($proj_idstr, $obj_idstr);
  $objid2projid = array_combine($obj_idstr, $proj_idstr);
  return array($funderstr[0], $parsed_projects, $projid2objid, $objid2projid);
}

function filterProjects($resource_counts) {
  $filtered_projects = array();
  foreach($resource_counts as $obj_id => $rc) {
    if ($rc["publications"] + $rc["datasets"] > 0) {
      $filtered_projects[] = $obj_id;
    }
  }
  return $filtered_projects;
}

function getProjectsbyFunder($funderparams) {
  $funder = $funderparams[0];
  $startYear = $funderparams[1];
  $endYear = $funderparams[2];
  $participantCountries = $funderparams[3];
  $participantAcronyms = $funderparams[4];

  $url = 'http://api.openaire.eu/search/projects?format=xml'
      . "&funder=" . $funder
      . "&size=" . "1000"
      . "&startYear=" . $startYear
      . "&endYear=" . $endYear;
  if ($participantCountries) {
    $url = $url . "&participantCountries=" . $participantCountries;
  }
  if ($participantAcronyms) {
    $url = $url . "&participantAcronyms=" . $participantAcronyms;
  }
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
  $parsed_projects = $parsed_response[1];
  $projid2objid = $parsed_response[2];
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

    $id = $projid2objid[$project_id];
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

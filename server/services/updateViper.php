<?php

require 'search.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/ViperUpdater.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';
use headstart\library;
use headstart\persistence;
use headstart\search;

// var_dump($argv);

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

# persistence is a SQLitePersistence class with added Viper functionalities
$persistence = new headstart\persistence\ViperUpdater($ini_array["connection"]["sqlite_db"]);

# define options
# vis_changed, required: true/false
# object_ids, optional: series of unique object IDs as given by openaire
# funder, optional: funder ID
# project_id, optional: project_id
$shortopts = "";
$longopts = array(
  "vis_changed:",
  "object_ids::",
  "funder::",
  "project_id::"
);


# parse options and determine action

$options = getopt($shortopts, $longopts);

if ($options['vis_changed'] == 'true') {
  $vis_changed = true;
} elseif ($options['vis_changed'] == 'false') {
  $vis_changed = false;
} else {
  echo "invalid argument for vis_changed";
};
$action = parseOptions($options);
echo "$action";


# main logic
# currently defaults to getCandidates if no specific action is identified
if ($action == 'getByObjectIDs') {
  $updateCandidates = getCandidatesByObjectIDs($vis_changed, $persistence, $options);
} elseif ($action == 'getByFunderProject') {
  $updateCandidates = getCandidates($vis_changed, $persistence);
} else {
  $updateCandidates = getCandidates($vis_changed, $persistence);
}
#runUpdates($updateCandidates);


# define functions

function parseOptions($options) {
  if (array_key_exists('object_ids', $options) and
      !array_key_exists('funder', $options) and
      !array_key_exists('project_id', $options)) {
    $action = "getByObjectIDs";
  } elseif (array_key_exists('funder', $options) and
            array_key_exists('project_id', $options) and
            !array_key_exists('object_ids', $options)) {
    $action = "getByFunderProject";
  } else {
    echo "Invalid combination of options.";
    $action = NULL;
  }
  return $action;
}

function getCandidates($vis_changed, $persistence) {
  # get candidates via DB query
  $maps = $persistence->getUpdateMaps($vis_changed);
  $updateCandidates = array();
  foreach($maps as $map) {
    $params = json_decode($map['vis_params'], true);
    $updateCandidates[$map['vis_query']] = $params;
  }
  return $updateCandidates;
}

function getCandidatesByObjectIDs($vis_changed, $persistence, $options) {
  # get candidates via DB query
  $maps = $persistence->getUpdateMaps($vis_changed);
  $updateCandidates = array();
  foreach($maps as $map) {
    $params = json_decode($map['vis_params'], true);
    $updateCandidates[$map['vis_query']] = $params;
  }
  return $updateCandidates;
}

function runUpdate($acronymtitle, $params) {
  echo "$acronymtitle";
  echo "\n";
  $decoded_params = decodeParams($params);
  $post_params = $decoded_params[0];
  $param_types = $decoded_params[1];
  var_dump($param_types);
  var_dump($post_params);
  $result = search("base", $acronymtitle,
                                     $params, $param_types,
                                     ";", null, false, false);
  echo $result;
}


function runUpdates($updateCandidates) {
  foreach($updateCandidates as $acronymtitle => $params) {
    runUpdate($acronymtitle, $params);
    sleep(10);
  }
}


function decodeParams($paramString) {
  $post_params = array();
  $param_types = array();
  foreach($paramString as $x => $x_value) {
    $post_params[] = $x_value;
    $param_types[] = $x;
  }
  return array($post_params, $param_types);
}

?>

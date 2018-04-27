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
$persistence = new headstart\persistence\ViperUpdater($ini_array["connection"]["sqlite_db"]);

$maps = $persistence->getUpdateMaps($vis_changed = false);

$updateCandidates = array();
foreach($maps as $map) {
  $params = json_decode($map['vis_params'], true);
  $updateCandidates[$map['vis_query']] = $params;
}

#var_dump($updateCandidates);

# require search.php
# decode params and use packParamsJSON
# build openaire query with query as $acronymtitle and decoded params as $post_params
# create new revision with results; check search.php for code on that

runUpdates($updateCandidates);


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

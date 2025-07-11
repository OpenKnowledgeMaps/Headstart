<?php

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/PostgresPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/DispatchingPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/preprocessing/Snapshot.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require 'helper.php';

use headstart\library;

function packParamsJSON($params_array, $post_params)
{

  if ($params_array === null) {
    return null;
  }

  $output_array = array();

  foreach ($params_array as $entry) {
    $current_params = library\CommUtils::getParameter($post_params, $entry);
    $output_array[$entry] = $current_params;
  }

  return json_encode($output_array);
}

function encode_string(string $str, string $to_encoding = 'UTF-8'): string {
  // Defining constants with known encodings and default one
  $DEFAULT_ENCODING = 'ISO-8859-1';
  $ENCODINGS = [
    'UTF-8',
    'Windows-1251',
    'ISO-8859-1',
    'ASCII',
    'KOI8-R',
    'CP866'
  ];

  // Trying to define the received string encoding
  $str_encoding = mb_detect_encoding($str, $ENCODINGS, true);

  // If the received string encoding is unknown the default one will be used
  if ($str_encoding === false) {
    $str_encoding = $DEFAULT_ENCODING;
  }

  // Converting encoding and returning updated string back
  return mb_convert_encoding($str, $to_encoding, $str_encoding);
}

function utf8_converter($array)
{
  array_walk_recursive($array, function (&$item, $key) {
    if ($item !== null && !mb_detect_encoding($item, 'utf-8', true)) {
      $item = encode_string($item);
    }
  });

  return $array;
}

function cleanQuery($dirty_query, $transform_query_tolowercase, $add_slashes)
{
  $query = strip_tags($dirty_query);
  $query = trim($query);

  if ($transform_query_tolowercase) {
    $query = strtolower($query);
  }

  if ($add_slashes) {
    $query = addslashes($query);
  }

  return $query;
}

function search(
  $service,
  $dirty_query,
  $post_params,
  $param_types,
  $transform_query_tolowercase = true,
  $retrieve_cached_map = true,
  $params_for_id = null,
  $precomputed_id = null,
  $do_clean_query = true,
  $add_slashes = true
) {
  $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
  $ini_array = library\Toolkit::loadIni($INI_DIR);
  $apiclient = new \headstart\library\APIClient($ini_array);
  $repo2snapshot = array(
    "plos" => "PLOS",
    "pubmed" => "PubMed",
    "doaj" => "DOAJ",
    "base" => "BASE",
    "openaire" => "OpenAire",
    "orcid" => "ORCID",
  );

  $query = ($do_clean_query === true)
    ? (cleanQuery($dirty_query, $transform_query_tolowercase, $add_slashes))
    : ($dirty_query);

    $persistence = new \headstart\persistence\PostgresPersistence($apiclient);
    // $persistence = new \headstart\persistence\DispatchingPersistence($postgresPersistence);

  // todo: move back into own function once error handling is refactored
  if ($service == "openaire") {
    $payload = json_encode(array("params" => $post_params));
    $res = $apiclient->call_api($service . "/projectdata", $payload);
    $result = json_decode($res["result"], true);
    if (isset($result["status"]) && $result["status"] === "error") {
      return json_encode($result);
    } else {
      $projectdata = $result["projectdata"];
      $post_params = array_merge($post_params, $projectdata);
    }
  }

  $params_json = packParamsJSON($param_types, $post_params);

  $params_for_id_creation = ($params_for_id === null) ? ($params_json) : (packParamsJSON($params_for_id, $post_params));

  $payload = json_encode(array(
    "params" => $post_params,
    "param_types" => $param_types
  ));
  $unique_id = $persistence->createID(array($query, $params_for_id_creation), $payload);

  $unique_id = ($precomputed_id === null) ? ($unique_id) : ($precomputed_id);
  $post_params["vis_id"] = $unique_id;
  if (array_key_exists("repo", $post_params)) {
    // ? what it is?
    $payload = json_encode(array("repo" => $post_params["repo"]));
    $res = $apiclient->call_api($service . "/contentproviders", $payload);
    $res = $res["result"];
    $res = json_decode($res, true);
    $repo_name = $res["repo_name"];
    $post_params["repo_name"] = $repo_name;
    $param_types[] = "repo_name";
    // this is not duplicate code, the $params_json needs to be updated with the addition metadata
    $params_json = packParamsJSON($param_types, $post_params);
  }

    if($retrieve_cached_map) {
      $last_version = $persistence->getLastVersion($unique_id, false, false);
      // error_log("search.php: last_version call returned " . print_r($last_version, true));
      // check if last_version call has httpcode, this is not always the case for return values
      // then check if success-status of last_version call is false
      if (is_array($last_version) && is_array(($last_version[0]))) {
        $last_version = $last_version[0];
        if (array_key_exists("httpcode", $last_version) && $last_version["httpcode"] != 200) {
          $result = json_decode($last_version["result"], true);
          $httpcode = $last_version["httpcode"];
          error_log("search.php: last_version call failed with http code " . $httpcode);
          error_log("search.php: last_version call failed with result " . print_r($result, true));
          echo json_encode($result);
          return;
        }
      }
      // TODO: This and the previous if are not mutually exclusive, so the second if should be an else if
      // and also it should be refactored to a function that returns the result or throws an exception
      if ($last_version != null && $last_version != "null" && $last_version != false) {
          // for example, non-existant vis_id is handled here, which looks like [False]
          echo json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
          return;
      }
      //todo: log output of $last_version
      // log to docker logs
     
    }

  // ? here we are making requests, should we restructure a little bit our requests to handle errors better?
  $payload = json_encode($post_params);
  $res = $apiclient->call_api($service . "/search", $payload);
  if ($res["httpcode"] != 200) {
    return json_encode($res);
  } else {
    $output_json = $res["result"];
  }

  if (!library\Toolkit::isJSON($output_json) || $output_json == "null" || $output_json == null) {

    echo json_encode(array("status" => "error"));
    ;
    return;
  }

  $result = json_decode($output_json, true);

  if (isset($result["status"]) && $result["status"] === "error") {
    return json_encode($result);
  }
  if (isset($result["status"]) && $result["status"] === "No update required") {
    return json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
  }

  $input_json = json_encode(utf8_converter($result));
  $input_json = preg_replace("/\<U\+(.*?)>/", "&#x$1;", $input_json);

  $vis_title = $service;

  $exists = $persistence->existsVisualization($unique_id);

  if (!$exists) {
    $persistence->createVisualization($unique_id, $vis_title, $input_json, $query, $dirty_query, $params_json);
  } else {
    $persistence->writeRevision($unique_id, $input_json);
  }

  if (!isset($ini_array["snapshot"]["snapshot_enabled"]) || $ini_array["snapshot"]["snapshot_enabled"] > 0) {
    if (isset($post_params["vis_type"]) && $post_params["vis_type"] == "timeline") {
      $vis_type = "timeline";
    } else {
      $vis_type = "overview";
    }
    $snapshot = new \headstart\preprocessing\Snapshot($ini_array, $query, $unique_id, $service, $repo2snapshot[$service], $vis_type);
    $snapshot->takeSnapshot();
  }

  return json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
}

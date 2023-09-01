<?php

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/preprocessing/Snapshot.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require 'helper.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/PostgresPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/DispatchingPersistence.php';

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

function cleanQuery($dirty_query, $transform_query_tolowercase, $add_slashes) {
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


function search($service, $dirty_query
        , $post_params, $param_types
        , $transform_query_tolowercase = true
        , $retrieve_cached_map = true, $params_for_id = null
        , $precomputed_id = null, $do_clean_query = true, $add_slashes = true) {
    var_dump('search.php start function search()');
    $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
    $ini_array = library\Toolkit::loadIni($INI_DIR);
    $processing_backend = isset($ini_array["general"]["processing_backend"])
    ? ($ini_array["general"]["processing_backend"])
    : "legacy";
    $persistence_backend = isset($ini_array["general"]["persistence_backend"])
    ? ($ini_array["general"]["persistence_backend"])
    : "legacy";
    $apiclient = new \headstart\library\APIClient($ini_array);
    $repo2snapshot = array("plos" => "PLOS"
    , "pubmed" => "PubMed"
    , "doaj" => "DOAJ"
    , "base" => "BASE"
    , "openaire" => "OpenAire"
    , "gsheets" => "GSheets");

    $query = ($do_clean_query === true)
        ? (cleanQuery($dirty_query, $transform_query_tolowercase, $add_slashes))
        : ($dirty_query);

//  $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
    $sqlitePersistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
    $postgresPersistence = new \headstart\persistence\PostgresPersistence($apiclient);
    $shiftReadPercentage = isset($ini_array["general"]["shift_read_percentage"]);
    $persistence = new \headstart\persistence\DispatchingPersistence($sqlitePersistence, $postgresPersistence, $shiftReadPercentage);

    $database = $ini_array["connection"]["database"];
    $service = $service;

    $settings = $ini_array["general"];

    // todo: move back into own function once error handling is refactored
    if ($service == "openaire") {
        if ($processing_backend === "api") {
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
    }

    $params_json = packParamsJSON($param_types, $post_params);

    $params_for_id_creation = ($params_for_id === null)?($params_json):(packParamsJSON($params_for_id, $post_params));

    var_dump("!!!!! search.php persistence_backend: " . $persistence_backend);

    if ($persistence_backend === "api") {
        var_dump("search.php (persistence_backend === api ) call_persistence params_json: ");
      $payload = json_encode(array("params" => $post_params,
                                   "param_types" => $param_types));
      $res = $apiclient->call_persistence("createID", $payload);
        var_dump("search.php (persistence_backend === api ) call_persistence result is: " . $res["result"]);
        echo("search.php call_persistence result is: " . $res["result"]);
      if ($res["httpcode"] != 200) {
          var_dump("search.php if httpcode is 200 res: " . $res["result"]);
          echo json_encode($res);
      } else {
          var_dump("search.php persistence_backend if httpcode != 200 res: " . $res["result"]);
        $result = json_decode($res["result"], true);
        $unique_id = $result["unique_id"];
      }
    } else {
        $payload = json_encode(array("params" => $post_params,
                                   "param_types" => $param_types));
        $unique_id = $persistence->createID(array($query, $params_for_id_creation), $payload);
        var_dump("search.php => string(131); (persistence_backend != api ) call_persistence unique_id: " . $unique_id);
    }


    $unique_id = ($precomputed_id === null)?($unique_id):($precomputed_id);
    $post_params["vis_id"] = $unique_id;
    if (array_key_exists("repo", $post_params)) {
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
      if ($persistence_backend === "api") {
        $payload = json_encode(array("vis_id" => $unique_id,
                                     "details" => false,
                                     "context" => false));
        $res = $apiclient->call_persistence("getLastVersion", $payload);
        if ($res["httpcode"] != 200) {
          echo json_encode($res);
        } else {
          $last_version = json_decode($res["result"], true);
        }
      } else {
        $last_version = $persistence->getLastVersion($unique_id, false);
      }
      if ($last_version != null && $last_version != "null" && $last_version != false) {
          echo json_encode(array("query" => $query, "id" => $unique_id, "status" => "success"));
          return;
      }
    }

    if ($processing_backend === "api") {
      $payload = json_encode($post_params);
      $res = $apiclient->call_api($service . "/search", $payload);
      if ($res["httpcode"] != 200) {
        return json_encode($res);
      } else {
        $output_json = $res["result"];
      }
    } else {
      $params_file = tmpfile();
      $params_meta = stream_get_meta_data($params_file);
      $params_filename = $params_meta["uri"];
      fwrite($params_file, $params_json);  
      $WORKING_DIR = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];
      $calculation = new \headstart\preprocessing\calculation\RCalculation($ini_array);
      $output = $calculation->performCalculationAndReturnOutputAsJSON($WORKING_DIR, $query, $params_filename, $service);

      $output_json = end($output);
      $output_json = mb_convert_encoding($output_json, "UTF-8");
    }

    if (!library\Toolkit::isJSON($output_json) || $output_json == "null" || $output_json == null) {

        echo json_encode(array("status" => "error"));;
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

    if ($persistence_backend === "api") {
      $payload = json_encode(array("vis_id" => $unique_id));
      $res = $apiclient->call_persistence("existsVisualization", $payload);
      if ($res["httpcode"] != 200) {
        return json_encode($res);
      } else {
        $result = json_decode($res["result"], true);
        $exists = $result["exists"];
      }
    } else {
      $exists = $persistence->existsVisualization($unique_id);
    }

    if (!$exists) {
      if ($persistence_backend === "api") {
        $payload = json_encode(array("vis_id" => $unique_id,
                                     "vis_title" => $vis_title,
                                     "data" => $input_json,
                                     "vis_clean_query" => $query,
                                     "vis_query" => $dirty_query,
                                     "vis_params" => $params_json));
        $res = $apiclient->call_persistence("createVisualization", $payload);
        if ($res["httpcode"] != 200) {
         return json_encode($res);
        }
      } else {
        $persistence->createVisualization($unique_id, $vis_title, $input_json, $query, $dirty_query, $params_json);
      }
    } else {
      if ($persistence_backend === "api") {
        $payload = json_encode(array("vis_id" => $unique_id,
                                     "data" => $input_json));
        $res = $apiclient->call_persistence("writeRevision", $payload);
        if ($res["httpcode"] != 200) {
          return json_encode($res);
        }
      } else {
        $persistence->writeRevision($unique_id, $input_json);
      }
    }

    if(!isset($ini_array["snapshot"]["snapshot_enabled"]) || $ini_array["snapshot"]["snapshot_enabled"] > 0) {
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

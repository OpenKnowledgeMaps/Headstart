<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);
$apiclient = new \headstart\library\APIClient($ini_array);
//$persistence = new headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$sqlitePersistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);
$postgresPersistence = new \headstart\persistence\PostgresPersistence($apiclient);
$shiftReadPercentage = 0; // 1
$persistence = new \headstart\persistence\DispatchingPersistence($sqlitePersistence, $postgresPersistence, $shiftReadPercentage);

$persistence_backend = $ini_array["general"]["persistence_backend"];
$processing_backend = $ini_array["general"]["processing_backend"];

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$context = filter_input(INPUT_GET, "context", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));
$streamgraph = filter_input(INPUT_GET, "streamgraph", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));

if ($processing_backend == "api") {
  # case of streamgraph calculation in backend
  if ($context === true) {
      # context data true start
      if ($persistence_backend === "api") {
        # get data + context from api
        $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => true));
        $res = $apiclient->call_persistence("getLastVersion", $payload);
        if ($res["httpcode"] != 200) {
          library\CommUtils::echoOrCallback($res, $_GET);
        } else {
          $data = json_decode($res["result"], true);
        }
      } else {
        # get data + context from legacy
        $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
      }
      if ($streamgraph === true) {
        # transform data formats if streamgraph requested
        $packed_data = json_decode($data["rev_data"], true);
        $return_data = array("context" => array("id" => $data["rev_vis"], "query" => $data["vis_query"], "service" => $data["vis_title"]
                                , "timestamp" => $data["rev_timestamp"], "params" => $data["vis_params"]),
                            "data" => $packed_data["data"],
                            "streamgraph" => $packed_data["streamgraph"]);
        $jsonData = json_encode($return_data);
        library\CommUtils::echoOrCallback($jsonData, $_GET);
        } else {
        $return_data = array("context" => array("id" => $data["rev_vis"], "query" => $data["vis_query"], "service" => $data["vis_title"]
                                 , "timestamp" => $data["rev_timestamp"], "params" => $data["vis_params"]),
                             "data" => $data["rev_data"]);
         $jsonData = json_encode($return_data);
         library\CommUtils::echoOrCallback($jsonData, $_GET);
      }
      # context data true end
      } else {
          if ($persistence_backend === "api") {
            # return data without context from api
            $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => false));
            $res = $apiclient->call_persistence("getLastVersion", $payload);
            if ($res["httpcode"] != 200) {
              library\CommUtils::echoOrCallback($res, $_GET);
            } else {
              $data = json_decode($res["result"], true);
              $jsonData = json_encode($data);
              library\CommUtils::echoOrCallback($jsonData, $_GET);
            }
          } else {
            # return data without context from legacy
            $jsonData = $persistence->getLastVersion($vis_id);
            library\CommUtils::echoOrCallback($jsonData[0], $_GET);
          }
      }
  # end of streamgraph calculation in backend
} else {
  # case of streamgraph calculation in legacy way
  if ($context === true) {
     if ($persistence_backend === "api") {
       # get data + context from api
       $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => true));
       $res = $apiclient->call_persistence("getLastVersion", $payload);
       if ($res["httpcode"] != 200) {
         library\CommUtils::echoOrCallback($res, $_GET);
       } else {
         $data = $res;
       }
     } else {
       $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
     }
     $return_data = array("context" => array("id" => $data["rev_vis"], "query" => $data["vis_query"], "service" => $data["vis_title"]
                              , "timestamp" => $data["rev_timestamp"], "params" => $data["vis_params"]),
                          "data" => $data["rev_data"]);
     if ($streamgraph === true) {
       # calculate streamgraph data live if requested
       $calculation = new headstart\preprocessing\calculation\RCalculation($ini_array);
       $working_dir = $ini_array["general"]["preprocessing_dir"] . $ini_array["output"]["output_dir"];
       $sg_output = $calculation->performStreamgraphCalculation($working_dir, $return_data["context"]["service"], $return_data["data"]);
       $sg_output_json = end($sg_output);
       $sg_output_json = mb_convert_encoding($sg_output_json, "UTF-8");

       if (!library\Toolkit::isJSON($sg_output_json) || $sg_output_json == "null" || $sg_output_json == null) {

           $sg_output_json = json_encode(array("status" => "error"));
       }
       $return_data["streamgraph"] = $sg_output_json;
     }
     $jsonData = json_encode($return_data);
     library\CommUtils::echoOrCallback($jsonData, $_GET);
  } else {
      if ($persistence_backend === "api") {
        # get data without context from api
        $payload = json_encode(array("vis_id" => $vis_id, "details" => false, "context" => false));
        $res = $apiclient->call_persistence("getLastVersion", $payload);
        if ($res["httpcode"] != 200) {
          library\CommUtils::echoOrCallback($res, $_GET);
        } else {
          $data = json_decode($res["result"], true);
          $jsonData = json_encode($data);
          library\CommUtils::echoOrCallback($jsonData, $_GET);
        }
      } else {
        # get data without context from legacy
        $jsonData = $persistence->getLastVersion($vis_id);
      }
      library\CommUtils::echoOrCallback($jsonData[0], $_GET);
  }
  # end of streamgraph calculation in legacy way
}

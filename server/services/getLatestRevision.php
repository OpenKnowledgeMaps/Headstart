<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/preprocessing/calculation/RCalculation.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/PostgresPersistence.php';
require dirname(__FILE__) . '/../classes/headstart/persistence/DispatchingPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);
$apiclient = new \headstart\library\APIClient($ini_array);
$postgresPersistence = new \headstart\persistence\PostgresPersistence($apiclient);
$persistence = new \headstart\persistence\DispatchingPersistence($postgresPersistence);


$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$context = filter_input(INPUT_GET, "context", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));
$streamgraph = filter_input(INPUT_GET, "streamgraph", FILTER_VALIDATE_BOOLEAN,
    array("flags" => FILTER_NULL_ON_FAILURE));

# get data depending on context parameter
if ($context === true) {
  # context data true start
  $data = $persistence->getLastVersion($vis_id, false, true)[0];

  # transform data depending on streamgraph parameter and return transformed data
  if ($streamgraph === true) {
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
  # return data without context from legacy
  $jsonData = $persistence->getLastVersion($vis_id, false, false);
  library\CommUtils::echoOrCallback($jsonData[0], $_GET);
}

<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/persistence/PostgresPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/persistence/DispatchingPersistence.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/Toolkit.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/APIClient.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/getContextResultBuilder.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$vis_id = library\CommUtils::getParameter($_GET, "vis_id");
$revision_context =  isset($_GET["revision_context"]) ? library\CommUtils::getParameter($_GET, "revision_context") : false;

$apiclient = new headstart\library\APIClient($ini_array);
$persistence = new \headstart\persistence\PostgresPersistence($apiclient);

// Remove the calls to this getContext on the persistence object. Replace instead with a getContextResultBuilder that returns a result object
// This should contain the httpStatusCode to pass to the client, the result in string form (some json encoded string) and it should never throw.

$getContextResultBuilder = new \headstart\library\getContextResultBuilder($persistence);

// [thing that formats the response for the user] - [thing that parses responses from the persistence api] - [thing that makes requests to persisent api and handles the network calls etc.]

// Err... why is the only caller of this having to unpack the array to take the first result? Is someone wrapping this reponse in an array unecessarily?
// $data = $persistence->getContext($vis_id)[0];
$result = $getContextResultBuilder->getContext($vis_id);

/*
It it works
{
  "rev_timestamp": "Thu, 12 Sep 2024 10:23:47 GMT",
  "rev_vis": "d161dba364a1e8c0468b9c74407e3575",
  "vis_params": "{\"id\": \"d161dba364a1e8c0468b9c74407e3575\", \"query\": \"\\\\\\\"climate change\\\\\\\" and impact\", \"service\": \"base\", \"timestamp\": \"Wed, 24 Aug 2022 14:24:13 GMT\", \"params\": \"{\\\"from\\\":\\\"1665-01-01\\\",\\\"to\\\":\\\"2022-08-24\\\",\\\"document_types\\\":[\\\"121\\\"],\\\"sorting\\\":\\\"most-relevant\\\",\\\"min_descsize\\\":\\\"300\\\"}\"}",
  "vis_query": "\\\"climate change\\\" and impact",
  "vis_title": "base"
}
*/
// $return_data = array("id" => $data["rev_vis"],
//                       "query" => $data["vis_query"],
//                       "service" => $data["vis_title"],
//                       "timestamp" => $data["rev_timestamp"],
//                       "params" => $data["vis_params"]);
// if (array_key_exists("additional_context", $data)) {
//   $return_data = array_merge($return_data, $data["additional_context"]);
// }
// $jsonData = json_encode($return_data);
// To investigate: is anyone needing the callback version of this??
// meaning, can this be simplified to just echo $result;
// library\CommUtils::echoOrCallback($result, $_GET);
echo $result;

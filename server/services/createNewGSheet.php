<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
use headstart\library;

if(php_sapi_name() == 'cli') {
    // Called from command-line, maybe cron
    # parse options
    $shortopts = "";
    $longopts = array(
      "sheet_name:",
      "project_name:",
      "main_curator_email:",
      "knowledge_base_template_id:"
    );
    $options = getopt($shortopts, $longopts);
    $sheet_name = $options["sheet_name"];
    $project_name = $options["project_name"];
    $main_curator_email = $options["main_curator_email"];
    $knowledge_base_template_id = $options["knowledge_base_template_id"];
} elseif(php_sapi_name() == 'apache2handler') {
  echo "Call not accepted.";
}

$route = $ini_array["general"]["api_url"] . "/gsheets" . "/createKnowledgebase";
$payload = json_encode(array("sheet_name" => $sheet_name,
                             "project_name" => $project_name,
                             "main_curator_email" => $main_curator_email,
                             "knowledge_base_template_id" => $knowledge_base_template_id));
$res = library\CommUtils::call_api($route, $payload);
if ($res["httpcode"] != 200) {
  echo json_encode($res);
} else {
  $result = json_decode($res["result"], true);
  echo $result;
}

?>

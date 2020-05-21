<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$shortopts = "";
$longopts = array(
  "q:",
  "sheet_id:"
);

# parse options
$options = getopt($shortopts, $longopts);
$dirty_query = $options["q"];
$sheet_id = $options["sheet_id"];

$result = search("gsheets", $dirty_query, array("q" => $dirty_query, "sheet_id" => $sheet_id, "sheet_range" => "Resources!A1:O200")
                    , array("sheet_id")
                    , ";", null, false, false, null, 3
                    , "area_uri", "subject", null, false
                    , "api");

echo $result;

?>

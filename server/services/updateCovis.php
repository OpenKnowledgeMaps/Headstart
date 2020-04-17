<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$dirty_query = "covid19";
$sheet_id = "1csxG23x99DcxoEud782Bji76C7mGxKkAVMBz8gdf_0A";

$result = search("gsheets", $dirty_query, array("q" => $dirty_query, "sheet_id" => $sheet_id, "sheet_range" => "Resources!A1:O200")
                    , array("sheet_id")
                    , ";", null, false, false, null, 3
                    , "area_uri", "subject", null, false
                    , "api");

echo $result

?>

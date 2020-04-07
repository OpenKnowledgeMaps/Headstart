<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require 'search.php';

use headstart\library;

$result = search("gsheets", "covid19", array("vis_id" => "covid19")
                    , array("vis_id")
                    , ";", null, true, false, null, 3
                    , "area_uri", "subject", "covid19", false
                    , "api");

echo $result

?>

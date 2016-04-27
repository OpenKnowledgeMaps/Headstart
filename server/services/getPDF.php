<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

require 'helper.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$url = library\CommUtils::getParameter($_GET, "url");
$filename = library\CommUtils::getParameter($_GET, "filename");

$images_path = $ini_array["general"]["images_path"];
$output_path = $images_path . $filename;

$pdf = file_get_contents($url);
file_put_contents($output_path, $pdf);

library\CommUtils::echoOrCallback(json_encode($filename), $_GET);

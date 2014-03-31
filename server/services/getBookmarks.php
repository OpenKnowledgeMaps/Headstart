<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/../classes/headstart/personalization/DBConnectionPersonalization.php';
require_once '/../classes/headstart/library/CommUtils.php';
require_once '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = library\Toolkit::loadIni($INI_DIR);

$user_id = library\CommUtils::getParameter($_GET, "user");
$conference_id = library\CommUtils::getParameter($_GET, "conference");

$connection = new headstart\personalization\DBConnectionPersonalization($ini_array);
$connection->establishConnection();
$data = $connection->getPersonalBookmarks($user_id, $conference_id);

$jsonData = json_encode($data);

library\CommUtils::echoOrCallback($jsonData, $_GET);

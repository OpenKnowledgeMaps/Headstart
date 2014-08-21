<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/lib/DBConnectionPersonalization.php';
require_once dirname(__FILE__) . '/lib/CommUtils.php';
require_once dirname(__FILE__) . '/lib/toolkit.php';

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = Toolkit::loadIni($INI_DIR);

$user_id = CommUtils::getParameter($_GET, "user_id");
$conference_id = CommUtils::getParameter($_GET, "content_id");

$connection = new DBConnectionPersonalization($ini_array);
$connection->establishConnection();
$bookmarking_data = $connection->removePersonalBookmark($user_id, $conference_id);

$jsonData = json_encode($bookmarking_data);

CommUtils::echoOrCallback($jsonData, $_GET);

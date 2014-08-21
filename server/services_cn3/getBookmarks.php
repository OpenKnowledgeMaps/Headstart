<?php

header('Content-type: application/json');

require dirname(__FILE__) . '/lib/DBConnectionPersonalization.php';
require_once dirname(__FILE__) . '/lib/CommUtils.php';
require_once dirname(__FILE__) . '/lib/toolkit.php';

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

$ini_array = Toolkit::loadIni($INI_DIR);

$user_id = CommUtils::getParameter($_GET, "user");
$conference_id = CommUtils::getParameter($_GET, "conference");

$connection = new DBConnectionPersonalization($ini_array);
$connection->establishConnection();
$bookmarking_data = $connection->getPersonalBookmarks($user_id, $conference_id);
$recommendation_data = $connection->getPersonalRecommendations($user_id, $conference_id);
$bookmarking_data_all = $connection->getConferenceBookmarks($conference_id);

$data = array("bookmarks" => $bookmarking_data, "recommendations" => $recommendation_data, "bookmarks_all" => $bookmarking_data_all);

$jsonData = json_encode($data);

CommUtils::echoOrCallback($jsonData, $_GET);

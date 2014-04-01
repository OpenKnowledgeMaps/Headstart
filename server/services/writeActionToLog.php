<?php

header('Content-type: application/json');

require_once '/../classes/headstart/evaluation/logger/FileLogger.php';
require_once '/../classes/headstart/library/CommUtils.php';

use headstart\evaluation\logger;
use headstart\library;

$serverData = array("addr"=>$_SERVER['REMOTE_ADDR'], "user_agent"=>$_SERVER['HTTP_USER_AGENT']);

$logData = array_merge($serverData, $_GET);

if($_POST != null)
    $logData = array_merge($logData, $_POST);

$logger = new logger\FileLogger(dirname(__FILE__) . '/../../log/', null);
$logger->writeToLog($logData);

$jsonData = json_encode($logData);

library\CommUtils::echoOrCallback($jsonData, $_GET["jsoncallback"]);



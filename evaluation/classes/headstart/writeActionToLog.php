<?php

header('Content-type: application/json');

require_once 'logger/FileLogger.php';
require_once 'util/CommUtils.php';

use headstart\logger;
use headstart\util;

$serverData = array("addr"=>$_SERVER['REMOTE_ADDR'], "user_agent"=>$_SERVER['HTTP_USER_AGENT']);

$logData = array_merge($serverData, $_GET);

$logger = new logger\FileLogger(dirname(__FILE__) . '/../../log/', null);
$logger->writeToLog($logData);

$jsonData = json_encode($_GET);

util\CommUtils::echoOrCallback($jsonData, $_GET["jsoncallback"]);



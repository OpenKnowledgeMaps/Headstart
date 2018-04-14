<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';

use headstart\library;

$keywords = library\CommUtils::getParameter($_GET, "keywords");
$page = library\CommUtils::getParameter($_GET, "page");
$size = library\CommUtils::getParameter($_GET, "size");
$funders = library\CommUtils::getParameter($_GET, "funders");

$url = 'http://api.openaire.eu/search/projects?format=json&keywords=' 
    . urlencode($keywords) . "&page=" . $page . "&size=" . $size . (($funders !== "all")?("&funder=" . $funders):(""));

$ch = curl_init();

curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url
));

$jsonData = curl_exec($ch);

echo $jsonData;

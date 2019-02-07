<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$url = "https://" .
       $ini_array["connection"]["linkedcat_user"] . ":" .
       $ini_array["connection"]["linkedcat_pwd"] . "@" .
       $ini_array["connection"]["linkedcat_solr"] . "/solr/linkedcat/" .
        "select?facet.field=author100_a_str&facet.query=author100_a_str&facet=on&fl=author100_a_str&q=*:*&rows=0";

$ch = curl_init();

curl_setopt_array($ch, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url
));

$jsonData = curl_exec($ch);

$resultarray = json_decode($jsonData, true);
$authors = array();
// [id, author100_a_str, doc_count, living_dates and possibly image_link]
foreach ($resultarray["facet_counts"]["facet_fields"]["author100_a_str"] as $k => $v) {
  if ($k % 2 == 0) {
    $author = array();
    $author[] = $v;
    $author[] = $resultarray["facet_counts"]["facet_fields"]["author100_a_str"][$k+1];
    $authors[] = $author;
  }
}
echo json_encode($authors);

$retVal = array_values();

echo json_encode($authors);

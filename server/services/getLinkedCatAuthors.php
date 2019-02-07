<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

$base_url = "https://" .
       $ini_array["connection"]["linkedcat_user"] . ":" .
       $ini_array["connection"]["linkedcat_pwd"] . "@" .
       $ini_array["connection"]["linkedcat_solr"] . "/solr/linkedcat/";


function execQuery($base_url, $query) {
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $base_url . $query
  ));
  // make function out of initial author array getter
  $jsonData = curl_exec($ch);
  return $jsonData;
}
$author_facet_query = "select?facet.field=author100_a_str" .
                      "&facet.query=author100_a_str" .
                      "&facet=on&fl=author100_a_str" .
                      "&q=*:*&rows=0";
$author_data_query =

$author_facet = json_decode(execQuery($base_url, $author_facet_query), true);
$authors = array();
// [id, author100_a_str, doc_count, living_dates and possibly image_link]
foreach ($author_facet["facet_counts"]["facet_fields"]["author100_a_str"] as $k => $v) {
  if ($k % 2 == 0) {
    $author = array();
    $author[] = $v;
    $author[] = $author_facet["facet_counts"]["facet_fields"]["author100_a_str"][$k+1];
    $authors[] = $author;
    // write function to get additional author information
    // user array_unshift($author, $author_id) to insert left
  }
}
echo json_encode($authors);

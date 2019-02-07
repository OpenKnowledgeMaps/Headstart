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

$author_facet_query = "select?facet.field=author100_a_str" .
                     "&facet.query=author100_a_str" .
                     "&facet=on&fl=author100_a_str" .
                     "&q=*:*&rows=0";

$author_data_query = "select?fl=idnr,author100_d" .
                    "&rows=1&wt=json" .
                    "&q=author100_a_str:";


function execQuery($base_url, $query) {
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $base_url . $query
  ));
  $jsonData = curl_exec($ch);
  return $jsonData;
}

function getAuthorFacet($base_url, $author_facet_query) {
  $res = json_decode(execQuery($base_url, $author_facet_query), true);
  return $res["facet_counts"]["facet_fields"];
}

function getAuthorData($base_url, $author_data_query, $v) {
  $q = $author_data_query . '"' . $v . '"';
  $res = json_decode(execQuery($base_url, $q), true);
  return $res["response"]["docs"][0];
}

$author_facet = getAuthorFacet($base_url, $author_facet_query);
$authors = array();
// [id, author100_a_str, doc_count, living_dates and possibly image_link]
foreach ($author_facet["author100_a_str"] as $k => $v) {
  if ($k % 2 == 0) {
    $author = array();
    $author[] = $v;
    $author_data = getAuthorData($base_url, $author_data_query, $v);
    $author[] = $author_facet["author100_a_str"][$k+1];
    array_unshift($author, $author_data["idnr"][0]);
    $author[] = $author_data["author100_d"][0];
    $authors[] = $author;
  }
}
echo json_encode($authors);

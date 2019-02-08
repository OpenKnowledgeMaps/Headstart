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
                     "&rows=1" .
                     "&q=author100_a_str:";


function execQuery($base_url, $query) {
  $ch = curl_init();
  curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_URL => $base_url . $query
  ));
  $jsonData = curl_exec($ch);
  curl_close($ch);
  return $jsonData;
}

function getAuthorFacet($base_url, $author_facet_query) {
  $res = json_decode(execQuery($base_url, $author_facet_query), true);
  return $res["facet_counts"]["facet_fields"]["author100_a_str"];
}

function getAuthorData($base_url, $author_data_query, $author_names) {
  $multiCurl = array();
  $res = array();
  $mh = curl_multi_init();
  $ch = curl_init();
  foreach ($author_names as $i => $name) {
    $target = curl_escape($ch, '"' . $name . '"');
    $fetchURL = $base_url . $author_data_query . $target;
    $multiCurl[$i] = curl_init();
    curl_setopt($multiCurl[$i], CURLOPT_URL, $fetchURL);
    curl_setopt($multiCurl[$i], CURLOPT_HEADER, 0);
    curl_setopt($multiCurl[$i], CURLOPT_RETURNTRANSFER, 1);
    curl_multi_add_handle($mh, $multiCurl[$i]);
  }
  curl_close($ch);
  $index = null;
  do {
    curl_multi_exec($mh, $index);
  } while($index > 0);
  foreach($multiCurl as $k => $ch) {
    $res[$k] = curl_multi_getcontent($ch);
    curl_multi_remove_handle($mh, $ch);
  }
  curl_multi_close($mh);
  return $res;
}

$author_facet = getAuthorFacet($base_url, $author_facet_query);
$author_names = array();
$author_counts = array();
foreach ($author_facet as $k => $v) {
  if ($k % 2 == 0) {
    $author_names[] = $v;
  } else {
    $author_counts[] = $v;
  }
}
$authors = array();
$author_data = getAuthorData($base_url, $author_data_query, $author_names);
// [id, author100_a_str, doc_count, living_dates and possibly image_link]
foreach ($author_names as $i => $name) {
    $author_count = $author_counts[$i];
    $author_id = $author_data["idnr"][0];
    $author_date = $author_data["author100_d"][0];
    $authors[] = array($author_id, $name, $author_count, $author_date);
}
echo json_encode($authors);

<?php

# currently returns a list of lists:
# [["(DE-588)11881835X","Pfizmaier, August",186,"1808-1887"],
#  ["(DE-588)118545426","Hammer-Purgstall, Joseph <<von>>",83,"1774-1856"]]

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
                      "&q=*:*&rows=0&facet.limit=-1&facet.sort=index";

$author_data_query = "select?fl=author100_0,author100_d" .
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
  try {
    $res = json_decode(execQuery($base_url, $author_facet_query), true);
  }
  catch (exception $e) {
    error_log("Failed at getting author facet, error in SOLR query, check config params");
  }
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
  }
  while($index > 0);
  foreach($multiCurl as $k => $ch) {
    $res[$k] = curl_multi_getcontent($ch);
    curl_multi_remove_handle($mh, $ch);
  }
  curl_multi_close($mh);
  $cleaned = array();
  foreach ($res as $i => $r) {
    $j = json_decode($r, true);
    $doc = $j["response"]["docs"][0];
    $cleaned[$i] = array();
    $cleaned[$i]["author100_0"] = $doc["author100_0"][0];
    $cleaned[$i]["author100_d"] = $doc["author100_d"][0];
  }
  return $cleaned;
}

function getAuthors() {
  # first get author facet and counts
  # -> list of unique authors in SOLR and their document count
  $author_facet = getAuthorFacet($GLOBALS['base_url'],
                                 $GLOBALS['author_facet_query']);
  $author_names = array();
  $author_counts = array();
  foreach ($author_facet as $k => $v) {
    if ($k % 2 == 0) {
      $author_names[] = $v;
    }
    else {
      $author_counts[] = $v;
    }
  }
  $authors = array();
  # now iterate over author names and get their metadata
  # from the first retrieved document
  $author_data = getAuthorData($GLOBALS['base_url'],
                               $GLOBALS['author_data_query'],
                               $author_names);

  // [id, author100_a_str, doc_count, living_dates and possibly image_link]
  foreach ($author_names as $i => $name) {
      $author_count = $author_counts[$i];
      $author_id = $author_data[$i]["author100_0"];
      $author_date = $author_data[$i]["author100_d"];
      # the following array contains a placeholder "" for a possible image link
      $authors[] = array($author_id, $name, $author_count, $author_date, "");
  }
  return json_encode($authors, JSON_UNESCAPED_UNICODE);
}

function loadCache($fname) {
  $json = file_get_contents($fname);
  return $json;
}

function writeCache($fname, $output) {
  $fp = fopen($fname, 'w');
  fwrite($fp, $output);
  fclose($fp);
}

function loadOrRefresh($lc_cache) {
  # checks if file exists AND if its fresher than 24h
  # if true && true, load the cached file
  if (file_exists($lc_cache) && (time() - filemtime($lc_cache) < 86400)) {
    $authors = loadCache($lc_cache);
  }
  else {
    # if one is false, create from SOLR and store in cache file
    try {
      $authors = getAuthors();
    }
    # if error in getting authors occurs, catch error and set authors null
    catch (exception $e) {
      $authors = arry();
      error_log($e);
      # if error occurred, skip cache refreshment at this stage and load instead
      if (file_exists($lc_cache)) {
          $authors = loadCache($lc_cache);
      }
    }
    finally {
      if (count($authors) > 0) {
        # if no error occurred, update cache
          writeCache($lc_cache, $authors);
      }
      else {
        error_log("Author suggestions could not be loaded or created.");
      }
    }
  }
  return $authors;
}

$lc_cache = $ini_array["connection"]["linkedcat_suggest_cache"];
echo loadOrRefresh($lc_cache);

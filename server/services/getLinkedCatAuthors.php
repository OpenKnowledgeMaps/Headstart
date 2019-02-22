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

$author_facet_query = "select?facet.field=author100_0_str" .
                      "&facet.query=author100_0_str" .
                      "&facet=on&fl=author100_0_str" .
                      "&q=*:*&rows=0&facet.limit=-1&facet.sort=index";

$author_data_query = "select?fl=author100_0,author100_a_str,author100_d" .
                     "&rows=1" .
                     "&q=author100_0_str:";


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
  return $res["facet_counts"]["facet_fields"]["author100_0_str"];
}

function getAuthorData($base_url, $author_data_query, $author_ids) {
  $window = 100;
  $res = array();
  $mh = curl_multi_init();

  # setup initial window slice
  for ($i = 0; $i < $window; $i++) {
    $ch = curl_init();
    $target = curl_escape($ch, '"' . array_pop($author_ids) . '"');
    $fetchURL = $base_url . $author_data_query . $target;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fetchURL);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_multi_add_handle($mh, $ch);
  }
  do {
    while (($mrc = curl_multi_exec($mh, $active)) == CURLM_CALL_MULTI_PERFORM)
    if ($mrc != CURLM_OK) break;
    # do stuff with the completed request
    while ($done = curl_multi_info_read($mh)) {
      $info = curl_getinfo($done['handle']);
      if ($info['http_code'] == 200) {
        # process response
        $output = curl_multi_getcontent($done['handle']);
        $output = json_decode($output, true);
        $doc = $output["response"]["docs"][0];
        $temp_id = $doc["author100_0"][0];
        $res[$temp_id] = array();
        $res[$temp_id]["author100_a_str"] = $doc["author100_a_str"][0];
        $res[$temp_id]["author100_d"] = $doc["author100_d"][0];
        # $res is now a k:v array with k = author_ids, v = k:v array of
        # keys author100_a_str and author100_d

        # add new author to request stack until author_ids is exhausted
        $next_author = array_pop($author_ids);
        # requests terminate prematurely in CURLM_OK check at invalid author query
        # which comes from the author facet for ""
        if (isset($next_author) && strlen($next_author)>0) {
          $ch = curl_init();
          $target = curl_escape($ch, '"' . $next_author . '"');
          $fetchURL = $base_url . $author_data_query . $target;
          curl_setopt($ch, CURLOPT_URL, $fetchURL);
          curl_setopt($ch, CURLOPT_HEADER, 0);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
          curl_multi_add_handle($mh, $ch);
        }
        # remove finished one
        curl_multi_remove_handle($mh, $done['handle']);
      } else {
        print_r($info);
      }
    }
  } while ($active);
  curl_multi_close($mh);
  return $res;
}

function getAuthors() {
  # first get author facet and counts
  # -> list of unique authors in SOLR and their document count
  $author_facet = getAuthorFacet($GLOBALS['base_url'],
                                 $GLOBALS['author_facet_query']);
  $author_ids = array();
  $author_counts = array();
  foreach ($author_facet as $k => $v) {
    if ($k % 2 == 0) {
      $author_ids[] = $v;
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
                               $author_ids);
  // [id, author100_a_str, doc_count, living_dates and possibly image_link]
  foreach ($author_ids as $i => $author_id) {
      $author_count = $author_counts[$i];
      $author_name = $author_data[$author_id]["author100_a_str"];
      $author_date = $author_data[$author_id]["author100_d"];
      if (is_null($author_name)) {
        $author_name = "";
      }
      if (is_null($author_date)) {
        $author_date = "";
      }
      # the following array contains a placeholder "" for a possible image link
      $authors[] = array($author_id, $author_name, $author_count, $author_date, "");
  }
  if(count($authors) == 0){
    throw new Exception("Could not create author list, check SOLR config.");
  }
  array_multisort(array_column($authors, 1), SORT_ASC, $authors);
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
      # if no error occurred, update cache
      writeCache($lc_cache, $authors);
    }
    # if error in getting authors occurs, catch error
    catch (exception $e) {
      $msg = "Author suggestions could not be loaded or created. Possible reason: " . $e->getMessage();
      # if error occurred, skip cache refreshment at this stage and load instead
      if (file_exists($lc_cache)) {
          $authors = loadCache($lc_cache);
      } else {
        $authors = array();
        $authors["error"] = $msg;
        $authors = json_encode($authors);
      }
    }
  }
  return $authors;
}

$lc_cache = $ini_array["connection"]["linkedcat_suggest_cache"];
echo loadOrRefresh($lc_cache);

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
       $ini_array["connection"]["linkedcat_solr"];

$author_facet_query = "select?facet.field=author100_0" .
                      "&facet.field=author700_0" .
                      "&facet.query=author100_0" .
                      "&facet=on&fl=author100_0" .
                      "&q=*:*&rows=0&facet.limit=-1&facet.sort=index";

$author_data_query = "select?fl=author100_0,author100_a,author100_d,author100_wiki_img" .
                     "&rows=1" .
                     "&q=author100_0:";

$lc_cache = $ini_array["connection"]["linkedcat_suggest_cache"];

$force_refresh = FALSE;
if (file_exists($lc_cache) == FALSE) {
  $force_refresh = TRUE;
}
if (isset($argv)) {
  if (count($argv) == 2) {
    if ($argv[1] == "--force-refresh") {
      $force_refresh = TRUE;
    }
  }
}

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
  return $res["facet_counts"]["facet_fields"];
}

function getAuthorData($base_url, $author_data_query, $author_ids) {
  $window = 100;
  $res = array();
  $mh = curl_multi_init();
  curl_multi_setopt($mh, CURLMOPT_MAX_TOTAL_CONNECTIONS, 10);
  curl_multi_setopt($mh, CURLMOPT_MAX_HOST_CONNECTIONS, 10);
  $urls = array();
  foreach ($author_ids as $i => $id) {
    if (strlen($id)>0) {
      $target = rawurlencode('"' . $id . '"');
      $fetchURL = $base_url . $author_data_query . $target;
      $urls[] = $fetchURL;
    }
  }

  # setup initial window slice
  for ($i = 0; $i < $window; $i++) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, array_shift($urls));
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
        if (isset($output["response"]["docs"][0])) {
          $doc = $output["response"]["docs"][0];
          $temp_id = $doc["author100_0"];
          $res[$temp_id] = array();
          $res[$temp_id]["author100_a"] = $doc["author100_a"];
          $res[$temp_id]["author100_d"] = $doc["author100_d"];
          $res[$temp_id]["author100_wiki_img"] = $doc["author100_wiki_img"];
        }
        # $res is now a k:v array with k = author_ids, v = k:v array of
        # keys author100_a and author100_d

        # add new author to request stack until author_ids is exhausted
        $next_url = array_shift($urls);
        # requests terminate prematurely in CURLM_OK check at invalid author query
        # which comes from the author facet for ""
        if (isset($next_url)) {
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, $next_url);
          curl_setopt($ch, CURLOPT_HEADER, 0);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
          curl_multi_add_handle($mh, $ch);
        }
        # remove finished one
        curl_multi_remove_handle($mh, $done['handle']);
      } else {
        curl_multi_remove_handle($mh, $done['handle']);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $info["url"]);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_multi_add_handle($mh, $ch);
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
  foreach ($author_facet["author100_0"] as $k => $v) {
    if ($k % 2 == 0) {
      $author_ids[] = $v;
    }
    else {
      $author_counts[] = $v;
    }
  }
  foreach ($author_facet["author700_0"] as $k => $v) {
    if ($k % 2 == 0) {
      $pos = array_search($v, $author_ids);
      if ($pos != false) {
        $author_counts[$pos] += $author_facet["author700_0"][$k + 1];
      }
      else {
        $author_ids[] = $v;
      }
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
  // [id, author100_a, doc_count, living_dates and possibly image_link]
  foreach ($author_ids as $i => $author_id) {
      $author_count = $author_counts[$i];
      $author_name = isset($author_data[$author_id]["author100_a"]) ? $author_data[$author_id]["author100_a"] : "";
      $author_date = isset($author_data[$author_id]["author100_d"]) ? $author_data[$author_id]["author100_d"] : "";
      $author_image = isset($author_data[$author_id]["author100_wiki_img"]) ? $author_data[$author_id]["author100_wiki_img"] : "";
      # the following array contains a placeholder "" for a possible image link
      $authors[] = array($author_id, $author_name, $author_count, $author_date, $author_image);
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
  if (($GLOBALS['force_refresh'] == FALSE) &&
       (file_exists($lc_cache) && (time() - filemtime($lc_cache) < 172800))
     ) {
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

echo loadOrRefresh($lc_cache);

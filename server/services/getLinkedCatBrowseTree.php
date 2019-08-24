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
       $ini_array["connection"]["linkedcat_solr"] . "/solr/linkedcat2/";

#bkl_top_caption
$bkl_top_query = "select?facet.field=bkl_top_caption" .
                  "&q=*:*&rows=0" .
                  "&facet=on" .
                  "&facet.limit=-1" .
                  "&facet.sort=index";

$bkl_query = "select?facet.field=bkl_caption" .
             "&facet=on&q=*:*&rows=0" .
             "&fq=bkl_top_caption:";

# &fq=bkl_top_caption:"Einzelne Sprachen und Literaturen"

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

function getBkltopFacet($base_url, $bkl_top_query) {
  $res = json_decode(execQuery($base_url, $bkl_top_query), true);
  return $res["facet_counts"]["facet_fields"];
}

function getBklFacetData($base_url, $bkl_query, $bkls_top) {
  $window = 100;
  $res = array();
  $mh = curl_multi_init();
  $urls = array();
  foreach ($bkls_top as $i => $bkl_top) {
    if (strlen($bkl_top) > 0) {
      $target = rawurlencode('"' . $bkl_top . '"');
      $fetchURL = $base_url . $bkl_query . $target;
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
        $content = curl_multi_getcontent($done['handle']);
        $content = json_decode($content, true);
        if (isset($content["facet_counts"]["facet_fields"]["bkl_caption"])) {
          $bkl_top = explode(":", $content["responseHeader"]["params"]["fq"])[1];
          $res[$bkl_top] = array();
          $bkls = array();
          $bkl_counts = array();
          foreach ($content["facet_counts"]["facet_fields"]["bkl_caption"] as $k => $v) {
            if ($k % 2 == 0) {
              $bkls[] = $v;
            }
            else {
              $bkl_counts[] = $v;
            }
          }
          foreach ($bkls as $i => $bkl) {
            $res[$bkl_top]["bkl_facet"][] = array("bkl_caption" => $bkl) + array("count" => $bkl_counts[$i]);
            }
          }

        # add new bkls to request stack until bkls_top is exhausted
        $next_url = array_shift($urls);
        # requests terminate prematurely in CURLM_OK check at invalid query
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

function getBrowseTree() {
  # first get facet counts of bkl_top_caption
  # -> list of top_basisklassen and their document count
  $bkls_top_facet = getBkltopFacet($GLOBALS['base_url'],
                                   $GLOBALS['bkl_top_query']);
  $bkls_top = array();
  $bkls_top_counts = array();
  foreach ($bkls_top_facet["bkl_top_caption"] as $k => $v) {
    if ($k % 2 == 0) {
      $bkls_top[] = $v;
    }
    else {
      $bkls_top_counts[] = $v;
    }
  }
  # build tree
  $bkl_tree = array();
  # multicurl bkl_facet for top_bkls
  $bkl_facetdata = getBklFacetData($GLOBALS['base_url'],
                                   $GLOBALS['bkl_query'],
                                   $bkls_top);
  foreach ($bkls_top as $i => $bkl_top) {
    $bkl_top_count = $bkls_top_counts[$i];
    $bkl_facet = isset($bkl_facetdata[$bkl_top]["bkl_facet"]) ? $bkl_facetdata[$bkl_top]["bkl_facet"] : null;
    $bkl_tree[] = array($bkl_top => $bkl_top_count) + array("bkl_facet" => $bkl_facet);
  }
  print_r($bkl_tree);
  array_multisort($bkls_top_counts, SORT_DESC, $bkl_tree);
  return json_encode($bkl_tree, JSON_UNESCAPED_UNICODE);
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
    $bkl_tree = loadCache($lc_cache);
  }
  else {
    # if one is false, create from SOLR and store in cache file
    try {
      $bkl_tree = getBrowseTree();
      # if no error occurred, update cache
      #writeCache($lc_cache, $bkl_tree);
    }
    # if error in getting bkls occurs, catch error
    catch (exception $e) {
      $msg = "LinkedCat browse view tree could not be loaded or created. Possible reason: " . $e->getMessage();
      # if error occurred, skip cache refreshment at this stage and load instead
      if (file_exists($lc_cache)) {
          $bkl_tree = loadCache($lc_cache);
      } else {
        $bkl_tree = array();
        $bkl_tree["error"] = $msg;
        $bkl_tree = json_encode($bkl_tree);
      }
    }
  }
  return $bkl_tree;
}

$lc_cache = $ini_array["connection"]["linkedcat_browseview_cache"];
echo loadOrRefresh($lc_cache);

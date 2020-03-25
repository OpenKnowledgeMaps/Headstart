<?php

header('Content-type: application/json');

require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

use headstart\library;

$INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";
$ini_array = library\Toolkit::loadIni($INI_DIR);

if (isset($ini_array["connection"]["linkedcat_protocol"])) {
  $lc_protocol = $ini_array["connection"]["linkedcat_protocol"];
} else {
  $lc_protocol = "https";
}

$base_url = $lc_protocol . "://" .
       $ini_array["connection"]["linkedcat_user"] . ":" .
       $ini_array["connection"]["linkedcat_pwd"] . "@" .
       $ini_array["connection"]["linkedcat_solr"];

$search_url = "services/searchLinkedCatBrowseview.php";

#bkl_top_caption
$bkl_top_query = "select?facet.field=bkl_top_caption" .
                  "&q=*:*&rows=0" .
                  "&facet=on" .
                  "&facet.limit=-1" .
                  "&facet.sort=index";

$bkl_query = "select?facet.field=bkl_caption" .
             "&facet=on&q=*:*&rows=0" .
             "&fq=bkl_top_caption:";

$lc_cache = $ini_array["connection"]["linkedcat_browseview_cache"];

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

function getBkltopFacet($base_url, $bkl_top_query) {
  $res = json_decode(execQuery($base_url, $bkl_top_query), true);
  return $res["facet_counts"]["facet_fields"];
}

function getBklFacetData($base_url, $bkl_query, $bkls_top) {
  $window = 100;
  $res = array();
  $temp_res_bkl_top = array();
  $mh = curl_multi_init();
  curl_multi_setopt($mh, CURLMOPT_MAX_TOTAL_CONNECTIONS, 10);
  curl_multi_setopt($mh, CURLMOPT_MAX_HOST_CONNECTIONS, 10);
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
          $bkl_top = str_replace('"', '', explode(":", $content["responseHeader"]["params"]["fq"])[1]);
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
          array_multisort($bkls, SORT_ASC, $bkl_counts);
          $res[$bkl_top] = array();
          foreach ($bkls as $i => $bkl) {
            if ($bkl_counts[$i] > 0) {
              $res[$bkl_top][] = array("bkl_caption" => $bkl,
                                       "count" => $bkl_counts[$i],
                                       "map_params" => array());
            }
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

function buildMaplink($search_url, $bkl_list, $bkl_level, $doc_count, $bkl_top_caption) {
  # q = ; separated bkls
  # post params: bkl_level: top/normal, bkl_list, doc_count
  $post_fields = array('q' => implode('; ', $bkl_list),
                       'bkl_list' => $bkl_list,
                       'bkl_level' => $bkl_level,
                       'doc_count' => $doc_count,
                       'bkl_top_caption' => $bkl_top_caption);
  // $fields_string = http_build_query($post_fields);
  // $post_url = urlencode($search_url . "?" . $fields_string);
  return $post_fields;
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
      if (strlen($v) > 0) {
        $bkls_top[] = $v;
        $bkls_top_counts[] = $bkls_top_facet["bkl_top_caption"][$k+1];
      }
    }
  }
  array_multisort($bkls_top, SORT_ASC, $bkls_top_counts);
  # multicurl bkl_facet for top_bkls
  $bkl_facetdata = getBklFacetData($GLOBALS['base_url'],
                                   $GLOBALS['bkl_query'],
                                   $bkls_top);
  # build tree
  $bkl_tree = array();
  $bkl_top_rest = array();
  $bkl_top_rest_cumsum = 0;
  foreach ($bkls_top as $i => $bkl_top) {
    $bkl_facet = $bkl_facetdata[$bkl_top];
    $bkl_top_count = $bkls_top_counts[$i];
    $top_map_params = array();
    if ($bkl_top_count > 100) {
      $cleaned_bkl = array();
      $bkl_rest = array();
      $bkl_rest_cumsum = 0;
      foreach ($bkl_facet as $i => $bkl) {
        if ($bkl["count"] >= 10) {
          $map_params = buildMaplink($GLOBALS['search_url'],
                                   array($bkl["bkl_caption"]),
                                   "bkl",
                                   $bkl["count"],
                                   $bkl_top);
          $cleaned_bkl[] = array("bkl_caption" => $bkl["bkl_caption"],
                                 "count" => $bkl["count"],
                                 "map_params" => $map_params);
        } else {
          $bkl_rest[] = $bkl["bkl_caption"];
          $bkl_rest_cumsum += $bkl["count"];
        }
      }
      $top_map_params = buildMaplink($GLOBALS['search_url'],
                               array($bkl_top),
                               "top",
                               $bkl_top_count,
                               $bkl_top);
      $rest_map_params = buildMaplink($GLOBALS['search_url'],
                               $bkl_rest,
                               "bkl",
                               $bkl_rest_cumsum,
                               $bkl_top);
      $cleaned_bkl[] = array("bkl_caption" => implode("; ", $bkl_rest),
                             "count" => $bkl_rest_cumsum,
                             "map_params" => $rest_map_params);
      $cleaned_bkl = array_filter($cleaned_bkl, function ($bkl) {
                                return ($bkl["count"] >= 10);
                              });
      $bkl_tree[] = array("bkl_top_caption" => $bkl_top,
                          "count" => $bkl_top_count,
                          "bkl_facet" => $cleaned_bkl,
                          "map_params" => $top_map_params);
    }
    if ($bkl_top_count >= 10 and $bkl_top_count <= 100) {
      $top_map_params = buildMaplink($GLOBALS['search_url'],
                               array($bkl_top),
                               "top",
                               $bkl_top_count,
                               $bkl_top);
      $bkl_tree[] = array("bkl_top_caption" => $bkl_top,
                          "count" => $bkl_top_count,
                          "bkl_facet" => array(),
                          "map_params" => $top_map_params);
    }
    if ($bkl_top_count < 10) {
      $bkl_top_rest[] = $bkl_top;
      $bkl_top_rest_cumsum += $bkl_top_count;
    }
  }
  $rest_maplink = buildMaplink($GLOBALS['search_url'],
                               $bkl_top_rest,
                               "top",
                               $bkl_top_rest_cumsum,
                               "");
  $bkl_tree[] = array("bkl_top_caption" => implode("; ", $bkl_top_rest),
                      "count" => $bkl_top_rest_cumsum,
                      "bkl_facet" => array(),
                      "map_params" => $rest_maplink);
  $bkl_tree = array_filter($bkl_tree, function($bklt) {
                           return(array($bklt["count"] >= 10));
                           });
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
  if (($GLOBALS['force_refresh'] == FALSE) &&
       (file_exists($lc_cache) && (time() - filemtime($lc_cache) < 172800))
     ) {
    $bkl_tree = loadCache($lc_cache);
  }
  else {
    # if one is false, create from SOLR and store in cache file
    try {
      $bkl_tree = getBrowseTree();
      # if no error occurred, update cache
      writeCache($lc_cache, $bkl_tree);
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

echo loadOrRefresh($lc_cache);
